import os
import logging
import shutil
import tempfile
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset
from torch.utils.data import DataLoader, Subset, WeightedRandomSampler
from torchvision import models, transforms
from sklearn.metrics import accuracy_score
from .image_detector import FFDataset, MetadataImageDataset, DATA_PATH, METADATA_CSV_PATH, MODEL_WEIGHTS_PATH

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

SUPPLEMENTAL_DATA_PATH = os.path.join(os.path.dirname(__file__), "processed_frames")


class ImagePathDataset(Dataset):
    def __init__(self, image_paths, labels, transform=None):
        self.image_paths = image_paths
        self.labels = labels
        self.transform = transform

    def __len__(self):
        return len(self.image_paths)

    def __getitem__(self, idx):
        from PIL import Image

        image = Image.open(self.image_paths[idx]).convert("RGB")
        if self.transform:
            image = self.transform(image)
        return image, self.labels[idx]

    def label_summary(self):
        return {
            "real": self.labels.count(0),
            "fake": self.labels.count(1),
        }


def snapshot_supplemental_data(supplemental_dir, cache_dir):
    if not supplemental_dir or not os.path.isdir(supplemental_dir):
        return supplemental_dir

    for class_name in ("real", "fake"):
        source_dir = os.path.join(supplemental_dir, class_name)
        if not os.path.isdir(source_dir):
            continue

        target_dir = os.path.join(cache_dir, class_name)
        os.makedirs(target_dir, exist_ok=True)
        for root, _, files in os.walk(source_dir):
            relative_root = os.path.relpath(root, source_dir)
            copy_root = target_dir if relative_root == "." else os.path.join(target_dir, relative_root)
            os.makedirs(copy_root, exist_ok=True)
            for name in files:
                if not name.lower().endswith((".png", ".jpg", ".jpeg", ".webp")):
                    continue
                shutil.copy2(os.path.join(root, name), os.path.join(copy_root, name))

    return cache_dir


def supplement_missing_classes(dataset, supplemental_dir, transform, cache_dir=None):
    if not supplemental_dir or not os.path.isdir(supplemental_dir):
        return dataset

    if cache_dir:
        supplemental_dir = snapshot_supplemental_data(supplemental_dir, cache_dir)

    summary = dataset.label_summary()
    missing_labels = []
    if summary["real"] == 0:
        missing_labels.append(0)
    if summary["fake"] == 0:
        missing_labels.append(1)

    if not missing_labels:
        return dataset

    supplemental = FFDataset(supplemental_dir, transform=transform)
    added = 0
    for image_path, label in zip(supplemental.image_paths, supplemental.labels):
        if label not in missing_labels:
            continue
        dataset.image_paths.append(image_path)
        dataset.labels.append(label)
        added += 1

    logger.info(f"Added {added} supplemental images from: {supplemental_dir}")
    return dataset


def build_supplemental_dataset(supplemental_dir, transform, cache_dir=None):
    if not supplemental_dir or not os.path.isdir(supplemental_dir):
        return None

    if cache_dir:
        supplemental_dir = snapshot_supplemental_data(supplemental_dir, cache_dir)

    supplemental = FFDataset(supplemental_dir, transform=transform)
    summary = supplemental.label_summary()
    if summary["real"] == 0 or summary["fake"] == 0:
        return None
    return supplemental


def get_labels(dataset):
    if isinstance(dataset, Subset):
        return [dataset.dataset.labels[index] for index in dataset.indices]
    return list(dataset.labels)


def stratified_split(dataset, val_split):
    real_indices = [index for index, label in enumerate(dataset.labels) if label == 0]
    fake_indices = [index for index, label in enumerate(dataset.labels) if label == 1]

    generator = torch.Generator().manual_seed(42)
    real_indices = torch.tensor(real_indices)[torch.randperm(len(real_indices), generator=generator)].tolist()
    fake_indices = torch.tensor(fake_indices)[torch.randperm(len(fake_indices), generator=generator)].tolist()

    real_val_size = max(1, int(len(real_indices) * val_split))
    fake_val_size = max(1, int(len(fake_indices) * val_split))

    val_indices = real_indices[:real_val_size] + fake_indices[:fake_val_size]
    train_indices = real_indices[real_val_size:] + fake_indices[fake_val_size:]

    return Subset(dataset, train_indices), Subset(dataset, val_indices)


def build_weighted_sampler(dataset):
    labels = get_labels(dataset)
    class_counts = {
        0: labels.count(0),
        1: labels.count(1),
    }
    sample_weights = [1.0 / class_counts[label] for label in labels]
    return WeightedRandomSampler(
        weights=torch.DoubleTensor(sample_weights),
        num_samples=len(sample_weights),
        replacement=True,
    )


def train_image_model(
    data_dir: str,
    metadata_csv: str = None,
    supplemental_data_dir: str = SUPPLEMENTAL_DATA_PATH,
    allow_supplemental_missing_classes: bool = True,
    epochs: int = 3,
    batch_size: int = 32,
    lr: float = 1e-4,
    val_split: float = 0.1,
    output_path: str = MODEL_WEIGHTS_PATH,
):
    if not os.path.isdir(data_dir):
        raise FileNotFoundError(f"Dataset folder not found: {data_dir}")

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.info(f"Training on device: {device}")

    model = models.resnet18(weights=models.ResNet18_Weights.IMAGENET1K_V1)
    num_ftrs = model.fc.in_features
    model.fc = nn.Linear(num_ftrs, 2)
    model = model.to(device)

    transform = transforms.Compose(
        [
            transforms.Resize((256, 256)),
            transforms.CenterCrop((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ]
    )

    if metadata_csv:
        if not os.path.isfile(metadata_csv):
            raise FileNotFoundError(f"Metadata CSV not found: {metadata_csv}")
        dataset = MetadataImageDataset(data_dir, metadata_csv, transform=transform)
        logger.info(f"Using CSV labels from: {metadata_csv}")
        logger.info(f"Skipped CSV rows with missing files or unsupported labels: {dataset.skipped_rows}")
        logger.info(f"CSV category rows: {dataset.csv_category_counts}")
        logger.info(f"CSV label rows: {dataset.csv_label_counts}")
        logger.info(f"Loaded category rows: {dataset.loaded_category_counts}")
        logger.info(f"Loaded label rows: {dataset.loaded_label_counts}")
        if dataset.missing_examples:
            logger.info(f"First missing CSV image examples: {dataset.missing_examples}")
        if dataset.unsupported_label_examples:
            logger.info(f"Unsupported label examples: {dataset.unsupported_label_examples}")
    else:
        dataset = FFDataset(data_dir, transform=transform)

    if len(dataset) == 0:
        raise ValueError("Dataset is empty.")

    primary_label_summary = dataset.label_summary()
    primary_real_count = primary_label_summary["real"]
    primary_fake_count = primary_label_summary["fake"]
    if metadata_csv and (primary_real_count == 0 or primary_fake_count == 0):
        missing_classes = []
        if primary_real_count == 0:
            missing_classes.append("REAL")
        if primary_fake_count == 0:
            missing_classes.append("FAKE")
        if not allow_supplemental_missing_classes:
            raise ValueError(
                "CSV dataset resolved files for only one class. "
                f"Missing resolved class(es): {', '.join(missing_classes)}. "
                f"Resolved counts before supplemental data: Real={primary_real_count}, Fake={primary_fake_count}. "
                "Fix the image folder so the CSV image_path values exist under data_dir, or enable supplemental data. "
                f"First missing examples: {dataset.missing_examples}"
            )
        logger.warning(
            "CSV dataset resolved only one class. Missing class(es) will be filled from supplemental data: %s",
            ", ".join(missing_classes),
        )

    supplemental_cache = None
    if allow_supplemental_missing_classes:
        supplemental_cache = tempfile.TemporaryDirectory(prefix="truthlens_image_supplemental_")
        logger.info(f"Snapshotting supplemental images to: {supplemental_cache.name}")
        if metadata_csv and (primary_real_count == 0 or primary_fake_count == 0):
            supplemental_dataset = build_supplemental_dataset(
                supplemental_data_dir,
                transform,
                cache_dir=supplemental_cache.name,
            )
            if supplemental_dataset is not None:
                logger.warning(
                    "Replacing one-class CSV dataset with balanced supplemental image dataset. "
                    "The CSV resolved Real=%s, Fake=%s, while supplemental data has Real=%s, Fake=%s.",
                    primary_real_count,
                    primary_fake_count,
                    supplemental_dataset.label_summary()["real"],
                    supplemental_dataset.label_summary()["fake"],
                )
                dataset = supplemental_dataset
            else:
                dataset = supplement_missing_classes(
                    dataset,
                    supplemental_data_dir,
                    transform,
                    cache_dir=supplemental_cache.name,
                )
        else:
            dataset = supplement_missing_classes(
                dataset,
                supplemental_data_dir,
                transform,
                cache_dir=supplemental_cache.name,
            )

    label_summary = dataset.label_summary()
    real_count = label_summary["real"]
    fake_count = label_summary["fake"]
    logger.info(f"Images: {len(dataset)} | Real: {real_count} | Fake: {fake_count}")
    if real_count == 0 or fake_count == 0:
        csv_hint = (
            "The CSV was read, but the files found under data_dir only matched one class. "
            "Make sure REAL and FAKE images referenced by image_path both exist under the image folder. "
            "For this dataset, REAL rows usually reference paths like original/000_frame0000.jpg, "
            "so the corresponding original folder/images must exist under data for image/original. "
            if metadata_csv else ""
        )
        raise ValueError(
            "Dataset must contain both Real and Fake samples. "
            f"{csv_hint}"
            "Use folders like data_dir/real/... and data_dir/fake/..., or provide a FaceForensics-style "
            "folder that includes original real folders without '_' plus manipulated fake folders with '_'. "
            f"Current counts: Real={real_count}, Fake={fake_count}. "
            f"The supplied folder appears to be {'fake-only' if fake_count and not real_count else 'real-only'}."
        )

    train_ds, val_ds = stratified_split(dataset, val_split)
    train_labels = get_labels(train_ds)
    val_labels = get_labels(val_ds)
    logger.info(
        "Train split: Real=%s | Fake=%s",
        train_labels.count(0),
        train_labels.count(1),
    )
    logger.info(
        "Val split: Real=%s | Fake=%s",
        val_labels.count(0),
        val_labels.count(1),
    )

    train_sampler = build_weighted_sampler(train_ds)
    train_loader = DataLoader(train_ds, batch_size=batch_size, sampler=train_sampler)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False)

    train_real_count = train_labels.count(0)
    train_fake_count = train_labels.count(1)
    class_weights = torch.tensor(
        [
            len(train_labels) / (2 * train_real_count),
            len(train_labels) / (2 * train_fake_count),
        ],
        dtype=torch.float,
        device=device,
    )
    criterion = nn.CrossEntropyLoss(weight=class_weights)
    optimizer = optim.Adam(model.parameters(), lr=lr)

    for epoch in range(epochs):
        model.train()
        total_loss = 0.0
        for inputs, labels in train_loader:
            inputs, labels = inputs.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()

        avg_loss = total_loss / max(1, len(train_loader))
        logger.info(f"Epoch {epoch + 1}/{epochs} | Loss: {avg_loss:.4f}")

        model.eval()
        y_true = []
        y_pred = []
        with torch.no_grad():
            for inputs, labels in val_loader:
                inputs = inputs.to(device)
                outputs = model(inputs)
                preds = torch.argmax(outputs, dim=1).cpu().numpy().tolist()
                y_pred.extend(preds)
                y_true.extend(labels.numpy().tolist())

        acc = accuracy_score(y_true, y_pred) if y_true else 0.0
        logger.info(f"Val Accuracy: {acc:.4f}")

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    torch.save(model.state_dict(), output_path)
    logger.info(f"Saved image model weights to {output_path}")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--data_dir", type=str, default=DATA_PATH)
    parser.add_argument("--metadata_csv", type=str, default=METADATA_CSV_PATH)
    parser.add_argument("--supplemental_data_dir", type=str, default=SUPPLEMENTAL_DATA_PATH)
    parser.add_argument(
        "--allow_supplemental_missing_classes",
        action="store_true",
        default=True,
        help="Allow processed_frames to fill a class missing from the main dataset. Enabled by default for the local DeepFakeDetection-only dataset.",
    )
    parser.add_argument(
        "--no_supplemental_missing_classes",
        action="store_false",
        dest="allow_supplemental_missing_classes",
        help="Fail instead of filling a missing class from processed_frames.",
    )
    parser.add_argument("--epochs", type=int, default=3)
    parser.add_argument("--batch_size", type=int, default=32)
    parser.add_argument("--lr", type=float, default=1e-4)
    parser.add_argument("--val_split", type=float, default=0.1)
    parser.add_argument("--output_path", type=str, default=MODEL_WEIGHTS_PATH)
    args = parser.parse_args()

    train_image_model(
        data_dir=args.data_dir,
        metadata_csv=args.metadata_csv,
        supplemental_data_dir=args.supplemental_data_dir,
        allow_supplemental_missing_classes=args.allow_supplemental_missing_classes,
        epochs=args.epochs,
        batch_size=args.batch_size,
        lr=args.lr,
        val_split=args.val_split,
        output_path=args.output_path,
    )
