# Run in terminal: pip install ultralytics mediapipe opencv-python-headless matplotlib seaborn tqdm albumentations

import os
os.environ['GLOG_minloglevel'] = '3'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['MEDIAPIPE_DISABLE_GPU'] = '1'

# Everything else below
import torch
import cv2
# Check GPU
import torch
print(f"CUDA available: {torch.cuda.is_available()}")
print(f"GPU: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'None'}")

import cv2
import json
import shutil
import random
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import seaborn as sns
from pathlib import Path
from tqdm import tqdm
from PIL import Image
import mediapipe as mp
import albumentations as A
from ultralytics import YOLO

# Reproducibility
SEED = 42
random.seed(SEED)
np.random.seed(SEED)

print("Successful.")


# Create all required directories
BASE_DIR    = Path('C:/Users/Adam/Desktop/New folder/School/Educational_App_Development')
DATA_ROOT   = BASE_DIR / 'asl_alphabet_train' / 'asl_alphabet_train'
WORK_DIR    = BASE_DIR / 'asl_yolo'
DATASET_DIR = WORK_DIR / 'dataset'

print(f"Data root: {DATA_ROOT}")
print(f"Exists:    {DATA_ROOT.exists()}")

for split in ['train', 'val', 'test']:
    (DATASET_DIR / split / 'images').mkdir(parents=True, exist_ok=True)
    (DATASET_DIR / split / 'labels').mkdir(parents=True, exist_ok=True)


classes = sorted([d.name for d in DATA_ROOT.iterdir() if d.is_dir()])
print(f"Total classes: {len(classes)}")
print(f"Classes: {classes}")

# Count images per class
class_counts = {}
for cls in classes:
    imgs = list((DATA_ROOT / cls).glob('*.jpg')) + list((DATA_ROOT / cls).glob('*.JPG'))
    class_counts[cls] = len(imgs)

df_counts = pd.DataFrame(class_counts.items(), columns=['Class', 'Count'])
print(f"\nTotal images: {df_counts['Count'].sum():,}")
print(df_counts.to_string(index=False))

# Show a grid of sample images
fig2, axs = plt.subplots(3, 9, figsize=(18, 7))
axs = axs.flatten()
for i, cls in enumerate(classes[:27]):
    imgs = list((DATA_ROOT / cls).glob('*.jpg'))
    if imgs:
        img = cv2.imread(str(random.choice(imgs)))
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        axs[i].imshow(img)
        axs[i].set_title(cls, fontsize=10)
        axs[i].axis('off')
plt.suptitle('Sample ASL Alphabet Images', fontsize=14, y=1.02)
plt.tight_layout()
plt.show()
print("Note: Classes 'del', 'nothing', 'space' are non-letter classes in this dataset.")

# Run in terminal: pip install mediapipe==0.10.32 --force-reinstall
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
from mediapipe.tasks.python.vision import HandLandmarker
from mediapipe.tasks.python.vision.hand_landmarker import HandLandmarkerOptions
import urllib.request

print(mp.__version__)

model_path = str(BASE_DIR / 'hand_landmarker.task')
if not Path(model_path).exists():
    print("Downloading hand landmarker model...")
    urllib.request.urlretrieve(
        "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        model_path
    )
    print("Downloaded.")

print("MediaPipe imports working")

def extract_hand_bbox_and_keypoints(image_path, padding_ratio=0.15):
    img_bgr = cv2.imread(str(image_path))
    if img_bgr is None:
        return None, None, None

    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=img_rgb)

    options = HandLandmarkerOptions(
        base_options=python.BaseOptions(model_asset_path=model_path),
        num_hands=1,
        min_hand_detection_confidence=0.4,
        min_tracking_confidence=0.4
    )

    with HandLandmarker.create_from_options(options) as detector:
        result = detector.detect(mp_image)

    annotated = img_bgr.copy()

    if not result.hand_landmarks:
        return None, None, annotated

    landmarks = result.hand_landmarks[0]

    # Draw keypoints manually (no solutions needed)
    h, w = img_bgr.shape[:2]
    for lm in landmarks:
        cx, cy = int(lm.x * w), int(lm.y * h)
        cv2.circle(annotated, (cx, cy), 4, (0, 255, 0), -1)

    keypoints = [(l.x, l.y) for l in landmarks]
    xs = [l.x for l in landmarks]
    ys = [l.y for l in landmarks]
    x_min = max(0, min(xs) - padding_ratio)
    x_max = min(1, max(xs) + padding_ratio)
    y_min = max(0, min(ys) - padding_ratio)
    y_max = min(1, max(ys) + padding_ratio)

    return (
        ((x_min + x_max) / 2, (y_min + y_max) / 2, x_max - x_min, y_max - y_min),
        keypoints,
        annotated
    )

print("MediaPipe annotation function ready.")

fig, axs = plt.subplots(2, 4, figsize=(16, 8))
axs = axs.flatten()

sample_letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

for i, letter in enumerate(sample_letters):
    imgs = list((DATA_ROOT / letter).glob('*.jpg'))
    bbox, kpts, annotated = extract_hand_bbox_and_keypoints(random.choice(imgs))
    annotated_rgb = cv2.cvtColor(annotated, cv2.COLOR_BGR2RGB)
    axs[i].imshow(annotated_rgb)
    axs[i].set_title(f'Letter: {letter} | Detected: {bbox is not None}', fontsize=10)
    axs[i].axis('off')

plt.tight_layout()
plt.show()





"""Data Prep"""

WORK_DIR.mkdir(parents=True, exist_ok=True)

# YOLO dataset directories
DATASET_DIR = WORK_DIR / 'dataset'
for split in ['train', 'val', 'test']:
    (DATASET_DIR / split / 'images').mkdir(parents=True, exist_ok=True)
    (DATASET_DIR / split / 'labels').mkdir(parents=True, exist_ok=True)

# Only use the 26 letter classes (skip del, nothing, space for core model)
# To include them, add to LETTER_CLASSES below.
LETTER_CLASSES = [c for c in classes if len(c) == 1 and c.isalpha()]
CLASS_TO_IDX = {c: i for i, c in enumerate(sorted(LETTER_CLASSES))}
IDX_TO_CLASS = {v: k for k, v in CLASS_TO_IDX.items()}

print(f"Classes to train: {LETTER_CLASSES}")
print(f"Class-to-index map: {CLASS_TO_IDX}")

# Sampling: to speed up annotation, sample N images per class
# Paper used 130,000 images total (~5,000/class). Adjust to your compute budget.
IMAGES_PER_CLASS = 3000    # reduce to 200 for quick experiments; 3000+ for full training
TRAIN_RATIO = 0.80
VAL_RATIO   = 0.10
# TEST_RATIO = 0.10 (implicit)

print(f"\nImages per class (sample): {IMAGES_PER_CLASS}")
print(f"Split: {TRAIN_RATIO}/{VAL_RATIO}/{1-TRAIN_RATIO-VAL_RATIO}")

#images/ -> resized JPEGs (640×640)
#labels/ -> YOLO .txt annotation files

stats = {'processed': 0, 'hand_detected': 0, 'no_hand': 0, 'error': 0}
IMG_SIZE = 640

def assign_split(idx, n_total):
    if idx < int(n_total * TRAIN_RATIO):
        return 'train'
    elif idx < int(n_total * (TRAIN_RATIO + VAL_RATIO)):
        return 'val'
    else:
        return 'test'

for cls_name in tqdm(LETTER_CLASSES, desc='Processing classes'):
    cls_idx = CLASS_TO_IDX[cls_name]
    img_paths = list((DATA_ROOT / cls_name).glob('*.jpg'))
    random.shuffle(img_paths)
    img_paths = img_paths[:IMAGES_PER_CLASS]

    for i, img_path in enumerate(img_paths):
        split = assign_split(i, len(img_paths))
        stem = f"{cls_name}_{i:05d}"

        out_img  = DATASET_DIR / split / 'images' / f"{stem}.jpg"
        out_lbl  = DATASET_DIR / split / 'labels' / f"{stem}.txt"

        try:
            bbox, kpts, annotated = extract_hand_bbox_and_keypoints(img_path)
            stats['processed'] += 1

            # Resize image
            img_resized = cv2.resize(cv2.imread(str(img_path)), (IMG_SIZE, IMG_SIZE))
            cv2.imwrite(str(out_img), img_resized)

            if bbox is not None:
                stats['hand_detected'] += 1
                x_c, y_c, bw, bh = bbox

                x_c = max(0.001, min(0.999, x_c))
                y_c = max(0.001, min(0.999, y_c))
                bw  = max(0.01,  min(0.999, bw))
                bh  = max(0.01,  min(0.999, bh))
                label_line = f"{cls_idx} {x_c:.6f} {y_c:.6f} {bw:.6f} {bh:.6f}"
            else:
                stats['no_hand'] += 1
                # Fallback: use full image bounding box
                label_line = f"{cls_idx} 0.500000 0.500000 0.900000 0.900000"

            out_lbl.write_text(label_line)

        except Exception as e:
            stats['error'] += 1

print("\n Annotation Summary")
for k, v in stats.items():
    print(f"  {k}: {v}")

detection_rate = stats['hand_detected'] / max(1, stats['processed']) * 100
print(f"\nHand detection rate: {detection_rate:.1f}%")

"""Could write YOLO dataset YAML here"""

yaml_content = f"""# ASL Alphabet — YOLOv11 dataset config
# Generated from: grassknoted/asl-alphabet (Kaggle)
# Method: Alsharif et al., Sensors 2025, doi:10.3390/s25072138

path: {DATASET_DIR.resolve()}
train: train/images
val:   val/images
test:  test/images

nc: {len(LETTER_CLASSES)}
names:
"""
for idx, name in IDX_TO_CLASS.items():
    yaml_content += f"  {idx}: {name}\n"

yaml_path = WORK_DIR / 'asl_dataset.yaml'
yaml_path.write_text(yaml_content)
print(f"YAML written to: {yaml_path}")
print(yaml_content)

for split in ['train', 'val', 'test']:
    n_imgs = len(list((DATASET_DIR / split / 'images').glob('*.jpg')))
    n_lbls = len(list((DATASET_DIR / split / 'labels').glob('*.txt')))
    print(f"{split:5s}: {n_imgs} images, {n_lbls} labels")

MODEL_VARIANT = 'yolo11m.pt'   # change to yolo11n.pt for quick experiments

model = YOLO(MODEL_VARIANT)
print(f"Loaded: {MODEL_VARIANT}")
print(model.info())

