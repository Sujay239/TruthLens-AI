import pandas as pd
import torch
from torch.utils.data import Dataset, DataLoader
from transformers import BertTokenizer, BertForSequenceClassification
from torch.optim import AdamW
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import os
import logging
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from .constants import DATA_DIR, MODEL_SAVE_PATH

class FakeNewsDataset(Dataset):
    def __init__(self, texts, labels, tokenizer, max_len=512):
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_len = max_len

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        text = str(self.texts[idx])
        label = self.labels[idx]

        encoding = self.tokenizer(
            text,
            max_length=self.max_len,
            padding="max_length",
            truncation=True,
            return_attention_mask=True,
            return_tensors="pt",
        )

        return {
            "text": text,
            "input_ids": encoding["input_ids"].squeeze(0),
            "attention_mask": encoding["attention_mask"].squeeze(0),
            "labels": torch.tensor(label, dtype=torch.long)
        }

def train_model(
    sample_size: int = None,
    epochs: int = 5,
    batch_size: int = 8,
    max_len: int = 128,
    log_every: int = 25,
    freeze_bert: bool = False,
):
    """
    Trains the BERT model on True.csv and Fake.csv.
    
    Args:
        sample_size (int, optional): Number of samples to use from each dataset. 
                                     Useful for quick testing. If None, uses all data.
        epochs (int): Number of training epochs.
        batch_size (int): Number of samples per batch.
        max_len (int): Maximum token length. 128 is much faster on CPU than 512.
        log_every (int): Print progress every N batches.
        freeze_bert (bool): Train only the classifier head for a much faster CPU run.
    """
    logger.info("Starting training process...")

    # 1. Load Data
    true_csv_path = os.path.join(DATA_DIR, "True.csv")
    fake_csv_path = os.path.join(DATA_DIR, "Fake.csv")

    if not os.path.exists(true_csv_path) or not os.path.exists(fake_csv_path):
        raise FileNotFoundError(f"Data files not found in {DATA_DIR}")

    df_true = pd.read_csv(true_csv_path)
    df_fake = pd.read_csv(fake_csv_path)
    logger.info(f"Loaded rows: True={len(df_true)} | Fake={len(df_fake)}")

    # 2. Add Labels (0 for True, 1 for Fake)
    df_true["label"] = 0
    df_fake["label"] = 1

    # 3. Combine and Shuffle
    df = pd.concat([df_true, df_fake]).sample(frac=1, random_state=42).reset_index(drop=True)
    
    # Use only a subset if specified (for faster testing/debugging)
    if sample_size:
        df = df.head(sample_size * 2) # * 2 because we have 2 classes roughly
        logger.info(f"Using subset of {len(df)} samples for training.")

    # 4. Prepare Data
    # prioritizing title + text for better context, or just text? 
    # Let's use 'text' column, but maybe fillna with title if empty?
    # For now, let's stick to 'text' as it usually has the article body.
    texts = df["text"].tolist()
    labels = df["label"].tolist()

    # 5. Tokenizer
    tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")

    # 6. Split Data
    train_texts, val_texts, train_labels, val_labels = train_test_split(
        texts, labels, test_size=0.1, random_state=42
    )

    train_dataset = FakeNewsDataset(train_texts, train_labels, tokenizer, max_len=max_len)
    val_dataset = FakeNewsDataset(val_texts, val_labels, tokenizer, max_len=max_len)

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size)
    logger.info(
        "Prepared data: train=%s | val=%s | batch_size=%s | max_len=%s | train_batches=%s | val_batches=%s",
        len(train_dataset),
        len(val_dataset),
        batch_size,
        max_len,
        len(train_loader),
        len(val_loader),
    )

    # 7. Model Setup
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.info(f"Training on device: {device}")

    model = BertForSequenceClassification.from_pretrained("bert-base-uncased", num_labels=2)
    model = model.to(device)

    if freeze_bert:
        for param in model.bert.parameters():
            param.requires_grad = False
        logger.info("BERT encoder frozen. Training classifier head only.")

    optimizer = AdamW(model.parameters(), lr=2e-5)

    # 8. Training Loop
    model.train()
    for epoch in range(epochs):
        logger.info(f"Epoch {epoch + 1}/{epochs}")
        total_loss = 0
        epoch_start = time.time()
        for batch_idx, batch in enumerate(train_loader, start=1):
            optimizer.zero_grad()
            
            input_ids = batch["input_ids"].to(device)
            attention_mask = batch["attention_mask"].to(device)
            labels = batch["labels"].to(device)

            outputs = model(
                input_ids=input_ids, 
                attention_mask=attention_mask, 
                labels=labels
            )
            
            loss = outputs.loss
            total_loss += loss.item()
            
            loss.backward()
            optimizer.step()

            if log_every and (batch_idx == 1 or batch_idx % log_every == 0 or batch_idx == len(train_loader)):
                elapsed = time.time() - epoch_start
                batches_per_sec = batch_idx / elapsed if elapsed else 0.0
                remaining_batches = len(train_loader) - batch_idx
                eta_seconds = remaining_batches / batches_per_sec if batches_per_sec else 0.0
                logger.info(
                    "Epoch %s/%s | Batch %s/%s | Loss %.4f | %.2f batch/s | ETA %.1f min",
                    epoch + 1,
                    epochs,
                    batch_idx,
                    len(train_loader),
                    loss.item(),
                    batches_per_sec,
                    eta_seconds / 60,
                )
        
        avg_train_loss = total_loss / len(train_loader)
        logger.info(f"Average Training Loss: {avg_train_loss:.4f}")

    # 9. Validation (Optional but recommended to see if it works)
    model.eval()
    val_preds = []
    val_true = []
    
    with torch.no_grad():
        val_start = time.time()
        for batch_idx, batch in enumerate(val_loader, start=1):
            input_ids = batch["input_ids"].to(device)
            attention_mask = batch["attention_mask"].to(device)
            labels = batch["labels"].to(device)

            outputs = model(input_ids=input_ids, attention_mask=attention_mask)
            preds = torch.argmax(outputs.logits, dim=1)
            
            val_preds.extend(preds.cpu().numpy())
            val_true.extend(labels.cpu().numpy())

            if log_every and (batch_idx == 1 or batch_idx % log_every == 0 or batch_idx == len(val_loader)):
                elapsed = time.time() - val_start
                batches_per_sec = batch_idx / elapsed if elapsed else 0.0
                remaining_batches = len(val_loader) - batch_idx
                eta_seconds = remaining_batches / batches_per_sec if batches_per_sec else 0.0
                logger.info(
                    "Validation | Batch %s/%s | %.2f batch/s | ETA %.1f min",
                    batch_idx,
                    len(val_loader),
                    batches_per_sec,
                    eta_seconds / 60,
                )

    val_acc = accuracy_score(val_true, val_preds)
    logger.info(f"Validation Accuracy: {val_acc}")

    # 10. Save Weights
    # We save the state dict so our custom classifier can load it, 
    # OR we can just save the whole model.
    # To keep it compatible with our existing BertClassifier class which uses 'bert-base-uncased',
    # we should save the state dict. 
    # However, our existing class uses `BertModel` + `nn.Linear`. 
    # `BertForSequenceClassification` wraps both. 
    # Let's save the whole `state_dict` and we might need to adjust loading logic or 
    # adjust this training script to match the architecture exactly.
    
    # Actually, simpler approach:
    # Our `FakeNewsBERT` in `bert_classifier.py` has `self.bert` and `self.classifier`.
    # `BertForSequenceClassification` also has `bert` and `classifier` (usually).
    # Let's check keys compatibility later or just save the model and load it using `BertForSequenceClassification` in the inference time too.
    # Refactoring `bert_classifier.py` to use `BertForSequenceClassification` is cleaner than manually maintaining layers.
    
    torch.save(model.state_dict(), MODEL_SAVE_PATH)
    logger.info(f"Model saved to {MODEL_SAVE_PATH}")
    
    return {"status": "success", "accuracy": val_acc, "model_path": MODEL_SAVE_PATH}

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Train Fake News Model")
    parser.add_argument("--sample_size", type=int, default=None, help="Number of samples to use")
    parser.add_argument("--epochs", type=int, default=20, help="Number of epochs")
    parser.add_argument("--batch_size", type=int, default=8, help="Batch size")
    parser.add_argument("--max_len", type=int, default=128, help="Maximum token length")
    parser.add_argument("--log_every", type=int, default=25, help="Log progress every N batches")
    parser.add_argument(
        "--freeze_bert",
        action="store_true",
        help="Freeze BERT and train only the classifier head. Much faster on CPU.",
    )
    
    args = parser.parse_args()
    
    train_model(
        sample_size=args.sample_size,
        epochs=args.epochs,
        batch_size=args.batch_size,
        max_len=args.max_len,
        log_every=args.log_every,
        freeze_bert=args.freeze_bert,
    )
