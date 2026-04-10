
import os
os.environ['GLOG_minloglevel'] = '3'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['PYTORCH_CUDA_ALLOC_CONF'] = 'expandable_segments:True'

import cv2
import torchvision
from ultralytics import YOLO
from pathlib import Path

# Patch NMS
original_nms = torchvision.ops.nms
def cpu_nms(boxes, scores, iou_threshold):
    return original_nms(boxes.cpu(), scores.cpu(), iou_threshold).to(boxes.device)
torchvision.ops.nms = cpu_nms

#MODEL_PATH = Path('C:/Users/Adam/Desktop/New folder/School/Educational_App_Development/asl_yolo/runs/asl_yolo11/weights/best.pt')
MODEL_PATH = Path(
    "C:/Users/Adam/Desktop/New folder/School/Educational_App_Development/Educational-App-Design-Project/ASL_Detector/asl_yolo_roboflow/runs/asl_roboflow2/weights/best.pt"
)
MEDIAPIPE_MODEL_PATH = Path(
    "C:/Users/Adam/Desktop/New folder/School/Educational_App_Development/Educational-App-Design-Project/ASL_Detector/hand_landmarker.task"
)
IDX_TO_CLASS = {i: chr(65 + i) for i in range(26)}

model = YOLO(str(MODEL_PATH))
print("Model loaded. Press Q to quit.")

cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    results = model.predict(source=frame, imgsz=640, conf=.50, verbose=False)


    for box in results[0].boxes:
        cls_id  = int(box.cls[0])
        conf    = float(box.conf[0])
        letter  = IDX_TO_CLASS.get(cls_id, '?')
        x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())

        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
        cv2.putText(frame, f'{letter} {conf:.2f}',
                    (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 0), 2)

    cv2.imshow('ASL Test', frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()