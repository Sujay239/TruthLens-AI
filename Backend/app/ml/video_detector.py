
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from torchvision import models, transforms
from PIL import Image
import os
import logging
import shutil
import random

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants
MODEL_WEIGHTS_PATH = os.path.join(os.path.dirname(__file__), "resnet_deepfake_video.pth")

class VideoFrameDataset(Dataset):
    """
    Dataset for training on extracted frames.
    """
    def __init__(self, root_dir, transform=None):
        self.root_dir = root_dir
        self.transform = transform
        self.image_paths = []
        self.labels = []
        
        self.classes = ['real', 'fake']
        for label, class_name in enumerate(self.classes):
            class_dir = os.path.join(self.root_dir, class_name)
            if not os.path.exists(class_dir):
                continue
            
            for img_name in os.listdir(class_dir):
                if img_name.lower().endswith(('.png', '.jpg', '.jpeg')):
                    self.image_paths.append(os.path.join(class_dir, img_name))
                    self.labels.append(label)

    def __len__(self):
        return len(self.image_paths)

    def __getitem__(self, idx):
        img_path = self.image_paths[idx]
        label = self.labels[idx]
        
        try:
            image = Image.open(img_path).convert("RGB")
            if self.transform:
                image = self.transform(image)
            return image, label
        except Exception as e:
            logger.warning(f"Error loading image {img_path}: {e}")
            return torch.zeros(3, 224, 224), label

class DeepfakeVideoDetector:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DeepfakeVideoDetector, cls).__new__(cls)
            cls._instance._initialize_model()
        return cls._instance

    def _initialize_model(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"Initializing DeepfakeVideoDetector on {self.device}...")

        try:
            # ResNet18
            self.model = models.resnet18(weights=models.ResNet18_Weights.IMAGENET1K_V1)
            num_ftrs = self.model.fc.in_features
            self.model.fc = nn.Linear(num_ftrs, 2)
            self.model = self.model.to(self.device)

            self.transform = transforms.Compose([
                transforms.Resize((256, 256)),
                transforms.CenterCrop((224, 224)),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
            ])

            if os.path.exists(MODEL_WEIGHTS_PATH):
                logger.info(f"Loading weights from {MODEL_WEIGHTS_PATH}")
                self.model.load_state_dict(torch.load(MODEL_WEIGHTS_PATH, map_location=self.device))
                self.model.eval()
            else:
                logger.warning("No weights found. Model needs training.")

        except Exception as e:
            logger.error(f"Failed to initialize model: {e}")
            self.model = None

    def extract_frames(self, video_path, output_dir, max_frames=20):
        """
        Extracts frames from a video.

        OpenCV is the primary backend because some torchvision builds do not
        expose torchvision.io.read_video. Keeping this method as the public
        entry point avoids noisy fallback errors in training and prediction.
        """
        count = self.extract_frames_cv2(video_path, output_dir, max_frames=max_frames)
        if count > 0:
            return count

        return self.extract_frames_torchvision(video_path, output_dir, max_frames=max_frames)

    def extract_frames_torchvision(self, video_path, output_dir, max_frames=20):
        """
        Optional torchvision frame extraction fallback.
        """
        try:
            import torchvision.io as io

            if not hasattr(io, "read_video"):
                logger.debug("torchvision.io.read_video is unavailable in this torchvision build.")
                return 0

            if not os.path.exists(output_dir):
                os.makedirs(output_dir)

            # read_video returns (video_frames, audio_frames, metadata)
            # video_frames is [T, H, W, C]
            vframes, _, _ = io.read_video(video_path, pts_unit='sec')
            
            total_frames = vframes.shape[0]
            if total_frames == 0:
                return 0

            # Sample frames uniformly
            indices = torch.linspace(0, total_frames - 1, max_frames).long()
            
            count = 0
            for i in indices:
                frame_tensor = vframes[i] # [H, W, C]
                # Permute to [C, H, W] for PIL
                frame_tensor = frame_tensor.permute(2, 0, 1)
                to_pil = transforms.ToPILImage()
                img = to_pil(frame_tensor)
                
                img.save(os.path.join(output_dir, f"frame_{count}.jpg"))
                count += 1
                
            return count
        except Exception as e:
            logger.warning(f"Frame extraction (torchvision) failed for {video_path}: {e}")
            return 0

    def extract_frames_cv2(self, video_path, output_dir, max_frames=20):
        try:
            import cv2

            if not os.path.exists(output_dir):
                os.makedirs(output_dir)

            cap = cv2.VideoCapture(video_path)
            if not cap.isOpened():
                cap.release()
                return 0

            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
            if total_frames <= 0:
                cap.release()
                return 0

            if total_frames <= max_frames:
                indices = list(range(total_frames))
            else:
                step = total_frames / max_frames
                indices = [int(i * step) for i in range(max_frames)]

            count = 0
            for idx in indices:
                cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
                ok, frame = cap.read()
                if not ok or frame is None:
                    continue

                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                img = Image.fromarray(frame_rgb)
                img.save(os.path.join(output_dir, f"frame_{count}.jpg"))
                count += 1

            cap.release()
            return count
        except Exception as e:
            logger.error(f"Frame extraction (cv2) failed for {video_path}: {e}")
            return 0

    def train_model(self, train_dir, epochs=5):
        try:
            dataset = VideoFrameDataset(train_dir, transform=self.transform)
            if len(dataset) == 0:
                logger.error("No training data found.")
                return

            dataloader = DataLoader(dataset, batch_size=16, shuffle=True)
            criterion = nn.CrossEntropyLoss()
            optimizer = optim.Adam(self.model.parameters(), lr=1e-4)

            self.model.train()
            logger.info(f"Starting training for {epochs} epochs...")

            for epoch in range(epochs):
                running_loss = 0.0
                for inputs, labels in dataloader:
                    inputs, labels = inputs.to(self.device), labels.to(self.device)
                    
                    optimizer.zero_grad()
                    outputs = self.model(inputs)
                    loss = criterion(outputs, labels)
                    loss.backward()
                    optimizer.step()
                    
                    running_loss += loss.item()
                
                logger.info(f"Epoch {epoch+1}/{epochs} Loss: {running_loss/len(dataloader):.4f}")

            torch.save(self.model.state_dict(), MODEL_WEIGHTS_PATH)
            logger.info(f"Model saved to {MODEL_WEIGHTS_PATH}")
            self.model.eval()

        except Exception as e:
            logger.error(f"Training error: {e}")

    def predict(self, video_path):
        if self.model is None:
             return {"label": "Error", "confidence": 0.0, "error": "Model not initialized"}

        try:
            # Temporary extraction
            temp_dir = "temp_frames_inference"
            if os.path.exists(temp_dir):
                shutil.rmtree(temp_dir)
            
            # OPTIMIZATION: Increased from 10 to 60 frames for better accuracy
            num_frames = self.extract_frames(video_path, temp_dir, max_frames=60)
            if num_frames == 0:
                num_frames = self.extract_frames_cv2(video_path, temp_dir, max_frames=60)
            if num_frames == 0:
                if os.path.exists(temp_dir):
                    shutil.rmtree(temp_dir)
                return {
                    "label": "Error",
                    "confidence": 0.0,
                    "error": "Could not extract frames. Try an MP4 (H.264) file. If this persists, install opencv-python-headless or ensure ffmpeg/Video codecs are available on the server."
                }

            fake_probs = []
            
            with torch.no_grad():
                for img_name in sorted(os.listdir(temp_dir)):
                    img_path = os.path.join(temp_dir, img_name)
                    try:
                        image = Image.open(img_path).convert("RGB")
                        input_tensor = self.transform(image).unsqueeze(0).to(self.device)
                        
                        outputs = self.model(input_tensor)
                        probs = torch.nn.functional.softmax(outputs, dim=1)
                        # Index 1 is Fake
                        fake_probs.append(probs[0][1].item())
                    except Exception as e:
                        logger.warning(f"Skipping frame {img_name}: {e}")

            # Cleanup
            if os.path.exists(temp_dir):
                shutil.rmtree(temp_dir)

            if not fake_probs:
                 return {"label": "Error", "confidence": 0.0, "error": "No predictions made"}

            # AVG Probability
            avg_fake_prob = sum(fake_probs) / len(fake_probs)
            fake_prob = avg_fake_prob
            real_prob = 1 - avg_fake_prob
            
            # Majority Vote Logic (Optional, but avg prob is usually more robust for video)
            # count_fake = sum(1 for p in fake_probs if p > 0.5)
            # majority_fake = count_fake > (len(fake_probs) / 2)

            if fake_prob >= 0.65:
                return {
                    "label": "Deepfake",
                    "confidence": fake_prob,
                    "fake_probability": fake_prob,
                    "frames_analyzed": num_frames
                }
            if fake_prob <= 0.35:
                return {
                    "label": "Real",
                    "confidence": real_prob,
                    "fake_probability": fake_prob,
                    "frames_analyzed": num_frames
                }
            return {
                "label": "Inconclusive",
                "confidence": max(fake_prob, real_prob),
                "fake_probability": fake_prob,
                "frames_analyzed": num_frames
            }

        except Exception as e:
            logger.error(f"Prediction failed: {e}")
            return {"label": "Error", "confidence": 0.0, "error": str(e)}

# Global Accessor
def predict_video(video_path):
    detector = DeepfakeVideoDetector()
    return detector.predict(video_path)
