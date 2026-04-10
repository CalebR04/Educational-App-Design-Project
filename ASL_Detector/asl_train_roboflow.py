import os
os.environ['GLOG_minloglevel'] = '3'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['PYTORCH_CUDA_ALLOC_CONF'] = 'expandable_segments:True'

import torch
import torchvision
from pathlib import Path
from ultralytics import YOLO

# Patch NMS
original_nms = torchvision.ops.nms
def cpu_nms(boxes, scores, iou_threshold):
    return original_nms(boxes.cpu(), scores.cpu(), iou_threshold).to(boxes.device)
torchvision.ops.nms = cpu_nms

# Paths
DATASET_DIR = Path('C:/Users/Adam/Desktop/New folder/School/Educational_App_Development/asl-alphabet-1')
WORK_DIR    = Path('C:/Users/Adam/Desktop/New folder/School/Educational_App_Development/asl_yolo_roboflow')
WORK_DIR.mkdir(parents=True, exist_ok=True)

# Write fixed yaml with absolute paths
yaml_content = f"""path: {DATASET_DIR.resolve()}
train: train/images
val:   test/images
test:  test/images

nc: 27
names:
  0: A
  1: B
  2: C
  3: D
  4: E
  5: F
  6: G
  7: H
  8: I
  9: J
  10: K
  11: L
  12: M
  13: N
  14: O
  15: P
  16: Q
  17: R
  18: S
  19: T
  20: U
  21: V
  22: W
  23: X
  24: Y
  25: Z
  26: nothing
"""

yaml_path = WORK_DIR / 'asl_lsm.yaml'
yaml_path.write_text(yaml_content)
print(f"YAML written to: {yaml_path}")

if __name__ == '__main__':
    print(f"CUDA available: {torch.cuda.is_available()}")
    print(f"GPU: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'None'}")

    model = YOLO('yolo11m.pt')

    TRAIN_CONFIG = dict(
        data          = str(yaml_path),
        epochs        = 100,
        patience      = 10,
        batch         = 8,
        device        = 0,
        amp           = True,
        workers       = 4,
        mixup         = 0.1,
        lr0           = 0.001,
        lrf           = 0.01,
        momentum      = 0.937,
        weight_decay  = 0.0005,
        warmup_epochs = 3,
        freeze        = 10,
        hsv_h         = 0.015,
        hsv_s         = 0.7,
        hsv_v         = 0.4,
        degrees       = 15.0,
        fliplr        = 0.5,
        mosaic        = 1.0,
        project       = str(WORK_DIR / 'runs'),
        name          = 'asl_3',
        save          = True,
        plots         = True,
        verbose       = True,
        exist_ok      = True,
    )

    results = model.train(**TRAIN_CONFIG)
    print(f"\nTraining complete!")
    print(f"Best model: {results.save_dir}/weights/best.pt")
    print(f"Final mAP@0.5: {results.results_dict.get('metrics/mAP50(B)', 'N/A')}")