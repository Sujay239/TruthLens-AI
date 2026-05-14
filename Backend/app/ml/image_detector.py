
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from torchvision import models, transforms
from PIL import Image
import io
import os
import glob
import logging
import pandas as pd

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants
MODEL_WEIGHTS_PATH = os.path.join(os.path.dirname(__file__), "resnet_deepfake.pth")
IMAGE_DATA_ROOT = os.path.join(os.path.dirname(__file__), "data for image")
DATA_PATH = IMAGE_DATA_ROOT
METADATA_CSV_PATH = os.path.join(IMAGE_DATA_ROOT, "image_dataset_metadata.csv")
IMAGE_EXTENSIONS = (".png", ".jpg", ".jpeg", ".webp")

LABEL_MAP = {
    "REAL": 0,
    "REALS": 0,
    "ORIGINAL": 0,
    "TRUE": 0,
    "0": 0,
    "FAKE": 1,
    "FAKES": 1,
    "DEEPFAKE": 1,
    "MANIPULATED": 1,
    "FALSE": 1,
    "1": 1,
}


class MetadataImageDataset(Dataset):
    """
    Image dataset driven by a CSV with image_path and label columns.
    Labels are mapped as REAL=0 and FAKE=1.
    """
    def __init__(self, image_root, metadata_csv, transform=None):
        self.image_root = image_root
        self.metadata_csv = metadata_csv
        self.transform = transform
        self.image_paths = []
        self.labels = []
        self.skipped_rows = 0
        self.missing_examples = []
        self.unsupported_label_examples = []
        self.csv_category_counts = {}
        self.csv_label_counts = {}
        self.loaded_category_counts = {}
        self.loaded_label_counts = {}
        self._filename_index = None

        self._load_dataset()

    def _build_filename_index(self):
        index = {}
        for root, _, files in os.walk(self.image_root):
            for name in files:
                if not name.lower().endswith(IMAGE_EXTENSIONS):
                    continue
                index.setdefault(name.lower(), os.path.join(root, name))
        return index

    def _resolve_image_path(self, csv_image_path):
        normalized = str(csv_image_path).replace("/", os.sep).replace("\\", os.sep)
        candidates = [
            os.path.join(self.image_root, normalized),
            os.path.join(self.image_root, os.path.basename(normalized)),
        ]

        for candidate in candidates:
            if os.path.isfile(candidate):
                return candidate

        if self._filename_index is None:
            self._filename_index = self._build_filename_index()
        return self._filename_index.get(os.path.basename(normalized).lower())

    def _load_dataset(self):
        if not os.path.isdir(self.image_root):
            return
        if not os.path.isfile(self.metadata_csv):
            return

        df = pd.read_csv(self.metadata_csv)
        required_columns = {"image_path", "label"}
        missing_columns = required_columns - set(df.columns)
        if missing_columns:
            raise ValueError(f"Metadata CSV is missing columns: {sorted(missing_columns)}")

        for _, row in df.iterrows():
            category = str(row.get("category", "")).strip() or "unknown"
            self.csv_category_counts[category] = self.csv_category_counts.get(category, 0) + 1
            raw_label = str(row["label"]).strip().upper()
            self.csv_label_counts[raw_label] = self.csv_label_counts.get(raw_label, 0) + 1
            if raw_label not in LABEL_MAP:
                self.skipped_rows += 1
                if len(self.unsupported_label_examples) < 5:
                    self.unsupported_label_examples.append(raw_label)
                continue

            image_path = self._resolve_image_path(row["image_path"])
            if image_path is None:
                self.skipped_rows += 1
                if len(self.missing_examples) < 5:
                    self.missing_examples.append(
                        {
                            "image_path": str(row["image_path"]),
                            "label": raw_label,
                        }
                    )
                continue

            self.image_paths.append(image_path)
            label = LABEL_MAP[raw_label]
            self.labels.append(label)
            self.loaded_category_counts[category] = self.loaded_category_counts.get(category, 0) + 1
            loaded_label = "REAL" if label == 0 else "FAKE"
            self.loaded_label_counts[loaded_label] = self.loaded_label_counts.get(loaded_label, 0) + 1

    def label_summary(self):
        return {
            "real": self.labels.count(0),
            "fake": self.labels.count(1),
        }

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

class FFDataset(Dataset):
    """
    Custom Dataset for FaceForensics++ structure.
    Preferred structure:
    - root/real/**/<image>
    - root/fake/**/<image>

    FaceForensics-style fallback:
    - folders with '_' in name are manipulated/fake sequences (000_003)
    - folders without '_' are original/real sequences (000)
    """
    def __init__(self, root_dir, transform=None):
        self.root_dir = root_dir
        self.transform = transform
        self.image_paths = []
        self.labels = []
        
        self._load_dataset()
    
    def _load_dataset(self):
        if not os.path.exists(self.root_dir):
            return

        real_dir = os.path.join(self.root_dir, "real")
        fake_dir = os.path.join(self.root_dir, "fake")
        if os.path.isdir(real_dir) and os.path.isdir(fake_dir):
            for label, folder_path in [(0, real_dir), (1, fake_dir)]:
                for root, _, files in os.walk(folder_path):
                    for name in files:
                        lower = name.lower()
                        if not lower.endswith(IMAGE_EXTENSIONS):
                            continue
                        self.image_paths.append(os.path.join(root, name))
                        self.labels.append(label)
            return

        for folder_name in os.listdir(self.root_dir):
            folder_path = os.path.join(self.root_dir, folder_name)
            if not os.path.isdir(folder_path):
                continue
                
            if "_" in folder_name:
                label = 1
            else:
                label = 0
            
            images = []
            for extension in IMAGE_EXTENSIONS:
                images.extend(glob.glob(os.path.join(folder_path, f"*{extension}")))
            
            for img_path in images:
                self.image_paths.append(img_path)
                self.labels.append(label)

    def label_summary(self):
        return {
            "real": self.labels.count(0),
            "fake": self.labels.count(1),
        }
                
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
            # Return a generic zero tensor fallback or skip (simplified here)
            return torch.zeros(3, 224, 224), label

class DeepfakeImageDetector:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DeepfakeImageDetector, cls).__new__(cls)
            cls._instance._initialize_model()
        return cls._instance

    def _initialize_model(self):
        """Initializes the ResNet model."""
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"Initializing DeepfakeImageDetector on {self.device}...")

        try:
            # Load ResNet18 (Standard CNN)
            self.model = models.resnet18(weights=models.ResNet18_Weights.IMAGENET1K_V1)
            
            # Modify the final fully connected layer for Binary Classification (Real vs Fake)
            num_ftrs = self.model.fc.in_features
            self.model.fc = nn.Linear(num_ftrs, 2)

            self.model = self.model.to(self.device)
            
            # Transforms
            self.transform = transforms.Compose([
                transforms.Resize((256, 256)),
                transforms.CenterCrop((224, 224)),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
            ])

            if os.path.exists(MODEL_WEIGHTS_PATH):
                logger.info(f"Loading custom model weights from {MODEL_WEIGHTS_PATH}")
                self.model.load_state_dict(torch.load(MODEL_WEIGHTS_PATH, map_location=self.device))
                self.model.eval()
            else:
                logger.warning(f"Image model weights not found at {MODEL_WEIGHTS_PATH}.")
                self.model = None

            logger.info("DeepfakeImageDetector initialized successfully.")

        except Exception as e:
            logger.error(f"Failed to initialize DeepfakeImageDetector: {e}")
            self.model = None

    def train_model(self, epochs=1): # Doing 1 epoch for quick startup, normally more
        """Trains the model on the available data."""
        try:
            dataset = FFDataset(DATA_PATH, transform=self.transform)
            
            if len(dataset) == 0:
                logger.warning("Dataset is empty. Skipping training.")
                return

            label_summary = dataset.label_summary()
            real_count = label_summary["real"]
            fake_count = label_summary["fake"]
            logger.info(f"Training Data: {len(dataset)} images. Real: {real_count}, Fake: {fake_count}")
            
            if real_count == 0 or fake_count == 0:
                 logger.warning(
                     "Dataset classes are unbalanced. Image training needs both classes, for example "
                     "cropped_images/real/... and cropped_images/fake/.... Skipping training to prevent bias."
                 )
                 return

            dataloader = DataLoader(dataset, batch_size=32, shuffle=True)
            
            criterion = nn.CrossEntropyLoss()
            optimizer = optim.Adam(self.model.parameters(), lr=1e-4)
            
            self.model.train()
            logger.info("Starting training loop...")
            
            for epoch in range(epochs):
                running_loss = 0.0
                for i, data in enumerate(dataloader, 0):
                    inputs, labels = data
                    inputs, labels = inputs.to(self.device), labels.to(self.device)

                    optimizer.zero_grad()
                    outputs = self.model(inputs)
                    loss = criterion(outputs, labels)
                    loss.backward()
                    optimizer.step()

                    running_loss += loss.item()
                    
                logger.info(f"Epoch {epoch+1}/{epochs} finished. Loss: {running_loss/len(dataloader):.4f}")

            # Save weights
            torch.save(self.model.state_dict(), MODEL_WEIGHTS_PATH)
            logger.info(f"Model trained and saved to {MODEL_WEIGHTS_PATH}")
            self.model.eval()
            
        except Exception as e:
            logger.error(f"Training failed: {e}")
            self.model.eval()

    def predict(self, image_bytes):
        """
        Predicts whether an image is Real or Fake.
        """
        if self.model is None:
            return {
                "label": "Error",
                "confidence": 0.0,
                "error": "Image model weights not found. Train the image model first so Backend/app/ml/resnet_deepfake.pth exists."
            }

        try:
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            input_tensor = self.transform(image).unsqueeze(0).to(self.device)

            with torch.no_grad():
                outputs = self.model(input_tensor)
                probabilities = torch.nn.functional.softmax(outputs, dim=1)
                
                # Index 0 = Real, Index 1 = Fake
                real_prob = probabilities[0][0].item()
                fake_prob = probabilities[0][1].item()

                if fake_prob >= 0.65:
                    label = "Fake"
                    confidence = fake_prob
                elif fake_prob <= 0.35:
                    label = "Real"
                    confidence = real_prob
                else:
                    label = "Inconclusive"
                    confidence = max(fake_prob, real_prob)

                return {
                    "label": label,
                    "confidence": confidence,
                    "fake_probability": fake_prob,
                    "real_probability": real_prob
                }

        except Exception as e:
            logger.error(f"Prediction error: {e}")
            return {"label": "Error", "confidence": 0.0, "error": str(e)}

# Global Accessor
def predict_image(image_bytes):
    detector = DeepfakeImageDetector()
    return detector.predict(image_bytes)
