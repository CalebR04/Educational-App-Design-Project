import os
os.environ['GLOG_minloglevel'] = '3'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['PYTORCH_CUDA_ALLOC_CONF'] = 'expandable_segments:True'

import torch
import torchvision
from pathlib import Path
from ultralytics import YOLO

# Patch NMS to run on CPU
original_nms = torchvision.ops.nms
def cpu_nms(boxes, scores, iou_threshold):
    return original_nms(boxes.cpu(), scores.cpu(), iou_threshold).to(boxes.device)
torchvision.ops.nms = cpu_nms

if __name__ == '__main__':
    print(f"CUDA available: {torch.cuda.is_available()}")
    print(f"GPU: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'None'}")

    BASE_DIR  = Path('C:/Users/Adam/Desktop/New folder/School/Educational_App_Development')
    WORK_DIR  = BASE_DIR / 'asl_yolo'

    # Resume from last checkpoint at epoch 74
    last_pt = str(WORK_DIR / 'runs' / 'asl_yolo11' / 'weights' / 'last.pt')
    model = YOLO(last_pt)

    results = model.train(
        resume  = True,
        data    = str(WORK_DIR / 'asl_dataset.yaml'),
        epochs  = 100,
        patience= 10,
        batch   = 8,
        device  = 0,
        amp     = False,
        workers = 4,
        mixup   = 0.0,
    )

    print(f"\nTraining complete!")
    print(f"Best model saved at: {results.save_dir}/weights/best.pt")
    print(f"Final mAP@0.5: {results.results_dict.get('metrics/mAP50(B)', 'N/A')}")