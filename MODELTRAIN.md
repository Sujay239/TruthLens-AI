# 🚀 TruthLens-AI Model Training Guide

## 📂 Navigate to Backend Directory

```powershell
cd D:\Z_work\Sujay\TruthLens-AI\Backend
```

## 🧠 Train Individual Models

### 1. Fake News / Text AI Model
```powershell
.\venv\Scripts\python.exe -m app.ml.train_model --epochs 20
```

### 2. Image Deepfake Detection Model
```powershell
.\venv\Scripts\python.exe -m app.ml.train_image_model
```

### 3. Audio Deepfake Detection Model
```powershell
.\venv\Scripts\python.exe -m app.ml.train_audio_model
```

### 4. Video Deepfake Detection Model
```powershell
.\venv\Scripts\python.exe -m app.ml.train_video_model
```

---

## ⚡ Train All Models Sequentially

```powershell
cd D:\Z_work\Sujay\TruthLens-AI\Backend

.\venv\Scripts\python.exe -m app.ml.train_model --epochs 20
.\venv\Scripts\python.exe -m app.ml.train_image_model
.\venv\Scripts\python.exe -m app.ml.train_audio_model
.\venv\Scripts\python.exe -m app.ml.train_video_model
```

---

## 💡 Notes

- Make sure the virtual environment (`venv`) is created and activated.
- Install all required dependencies before starting training.
- Training time depends on your system specifications.
- GPU acceleration is recommended for faster model training.


## To Run the backend now

`.\venv\Scripts\activate  ` => This activate the venv in the backend root folder


`python main.py    `  => run this to start the backend server but before that make sure started xammp for db & in phpmyadmin created db named `truthlens_db`
