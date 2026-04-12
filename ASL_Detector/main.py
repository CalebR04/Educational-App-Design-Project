import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['GLOG_minloglevel'] = '3'  # FIX: was 'GlOG_minloglevel'

import base64
import cv2
import io
import numpy as np
from pathlib import Path
from PIL import Image
import torch
import torchvision
from ultralytics import YOLO
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
from mediapipe.tasks.python.vision import HandLandmarker
from mediapipe.tasks.python.vision.hand_landmarker import HandLandmarkerOptions
import urllib.request
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

# CPU-only NMS patch
original_nms = torchvision.ops.nms
def cpu_nms(boxes, scores, iou_threshold):
    return original_nms(boxes.cpu(), scores.cpu(), iou_threshold).to(boxes.device)
torchvision.ops.nms = cpu_nms


# ----
# Config
BASE_DIR = Path(__file__).resolve().parent

MODEL_PATH = BASE_DIR / "asl_yolo_roboflow" / "runs" / "asl_roboflow2" / "weights" / "best.pt"
MEDIAPIPE_MODEL_PATH = BASE_DIR / "hand_landmarker.task"

CONF_THRESHOLD = 0.5     # was 0.65 — works better in real lighting
IMG_SIZE = 480     # was 640 — faster, negligible accuracy hit for hands
HOLD_FRAMES = 15

IDX_TO_CLASS = {i: chr(65 + i) for i in range(26)}

# Download MediaPipe model if needed
if not MEDIAPIPE_MODEL_PATH.exists():
    print("Downloading MediaPipe hand landmarker model...")
    urllib.request.urlretrieve(
        "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        str(MEDIAPIPE_MODEL_PATH)
    )
    print("Downloaded.")

# ---- Load models ONCE at startup ----
print(f"Loading YOLO model from: {MODEL_PATH}")
model = YOLO(str(MODEL_PATH))
# Warmup so first real request isn't slow
_dummy = np.zeros((IMG_SIZE, IMG_SIZE, 3), dtype=np.uint8)
model.predict(source=_dummy, imgsz=IMG_SIZE, conf=CONF_THRESHOLD, verbose=False)
print("YOLO loaded and warmed up.")

# Create HandLandmarker ONCE
print("Loading MediaPipe HandLandmarker...")
_hand_options = HandLandmarkerOptions(
    base_options=python.BaseOptions(model_asset_path=str(MEDIAPIPE_MODEL_PATH)),
    num_hands=1,
    min_hand_detection_confidence=0.4,
    min_tracking_confidence=0.4,
)
hand_detector = HandLandmarker.create_from_options(_hand_options)
print("HandLandmarker loaded.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    try:
        hand_detector.close()
    except Exception:
        pass


app = FastAPI(title="ASL Detection API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://signquestv2.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# State
state = {
    "word":        [],
    "last_letter": None,
    "hold_count":  0,
}

class FrameRequest(BaseModel):
    image: str
    add_to_word: bool = True
    want_keypoints: bool = False  # Frontend opts in if it actually renders them

class DetectionResponse(BaseModel):
    letter: Optional[str]
    confidence: Optional[float]
    word: str
    keypoints: Optional[list]
    bbox: Optional[list]

class WordRequest(BaseModel):
    action: str


def decode_image(b64_string: str) -> np.ndarray:
    if "," in b64_string:
        b64_string = b64_string.split(",", 1)[1]
    img_bytes = base64.b64decode(b64_string)
    img_pil = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    img_bgr= cv2.cvtColor(np.array(img_pil), cv2.COLOR_RGB2BGR)
    return img_bgr


def get_keypoints(img_bgr: np.ndarray) -> Optional[list]:
    try:
        img_rgb= cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=img_rgb)
        result= hand_detector.detect(mp_image)
        if not result.hand_landmarks:
            return None
        return [{"x": lm.x, "y": lm.y, "z": lm.z} for lm in result.hand_landmarks[0]]
    except Exception:
        return None


def run_detection(img_bgr: np.ndarray, want_keypoints: bool):
    results = model.predict(source=img_bgr, imgsz=IMG_SIZE, conf=CONF_THRESHOLD, verbose=False)

    detected_letter = None
    confidence= None
    bbox = None

    if results and results[0].boxes is not None and len(results[0].boxes) > 0:
        boxes = results[0].boxes
        best_idx = int(boxes.conf.argmax())
        cls_id = int(boxes.cls[best_idx])
        confidence = float(boxes.conf[best_idx])
        detected_letter = IDX_TO_CLASS.get(cls_id, "?")
        h, w = img_bgr.shape[:2]
        x1, y1, x2, y2 = boxes.xyxy[best_idx].tolist()
        bbox  = [x1 / w, y1 / h, x2 / w, y2 / h]

    keypoints = get_keypoints(img_bgr) if want_keypoints else None
    return detected_letter, confidence, bbox, keypoints


@app.get("/health")
def health():
    return {"status": "ok", "model": str(MODEL_PATH.name)}


@app.post("/detect", response_model=DetectionResponse)
async def detect(req: FrameRequest):
    try:
        img_bgr = decode_image(req.image)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image: {e}")

    # Run heavy inference off the event loop
    detected_letter, confidence, bbox, keypoints = await run_in_threadpool(
        run_detection, img_bgr, req.want_keypoints
    )

    # Word-building state machine
    if req.add_to_word and detected_letter:
        if detected_letter == state["last_letter"]:
            state["hold_count"] += 1
        else:
            state["hold_count"]  = 0
            state["last_letter"] = detected_letter
        if state["hold_count"] == HOLD_FRAMES:
            state["word"].append(detected_letter)
            state["hold_count"] = 0

    return DetectionResponse(
        letter=detected_letter,
        confidence=round(confidence, 3) if confidence is not None else None,
        word="".join(state["word"]),
        keypoints=keypoints,
        bbox=bbox,
    )


@app.post("/word")
def word_action(req: WordRequest):
    if req.action == "clear":
        state["word"].clear()
        state["last_letter"] = None
        state["hold_count"]  = 0
    elif req.action == "backspace":
        if state["word"]:
            state["word"].pop()
    return {"word": "".join(state["word"])}


@app.get("/word")
def get_word():
    return {"word": "".join(state["word"])}