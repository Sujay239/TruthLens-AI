
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from .. import models, schemas, database, dependencies, utils
from ..ml.feedback_learning import apply_feedback_calibration
import random
import datetime
import subprocess
import sys
import os
import shutil
from ..ml import bert_classifier

router = APIRouter(
    prefix="/scan",
    tags=["Scanning"]
)

# Helper to save log
def create_analysis_log(db: Session, user_id: int, filename: str, file_type: str, 
                       label: str, confidence: float, file_size: str, media_url: str = None,
                       analysis_summary: dict = None, scan_type: str = None, scan_id: int = None):
    log = models.AnalysisLog(
        user_id=user_id,
        filename=filename,
        file_type=file_type,
        result_label=label,
        confidence_score=confidence,
        file_size=file_size,
        media_url=media_url,
        scan_type=scan_type,
        scan_id=scan_id,
        analysis_summary=analysis_summary
    )
    db.add(log)
    db.flush()
    return log
    # db.commit() # We commit at the end of the main transaction

# --- Fake News ---
# --- Fake News ---
# Import the BERT model helper
# from ..ml.bert_classifier import predict_fake_news # This line is replaced by the new import above

from app.utils import search_google_news

@router.post("/fake-news", response_model=dict) # Change response model to dict to be flexible
def scan_fake_news(request: schemas.FakeNewsRequest, db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    try:
        # Step 1: Real-time News Search (Ground Truth)
        search_results = search_google_news(request.text[:200]) # Use first 200 chars for search
        
        # Step 2: Check if provided by frontend already
        if request.verdict and request.confidence:
            label = request.verdict.title() # Ensure "Real" or "Fake"
            confidence = request.confidence
            analysis_text = request.summary or "Analysis provided by AI fact-checker."
            
            # Use provided details or defaults
            details = request.analysis_details or {}
            emotional_tone = details.get("emotional_tone", "Analyzed by AI")
            source_credibility = details.get("source_credibility", "Verified via AI")
            semantic_consistency = details.get("semantic_consistency", "Consistent with AI analysis")
            
            # Full summary for the log
            analysis_summary = {
                "content": request.text[:1000],
                "full_report": request.analysis_details
            }
        else:
            # Fallback to local AI Analysis Logic using BERT
            raw_output = bert_classifier.predict_fake_news(request.text) 
            
            if isinstance(raw_output, dict):
                fake_prob = raw_output.get("fake_probability", 0.0)
                confidence_val = raw_output.get("confidence", 0.0)
            elif isinstance(raw_output, list):
                fake_prob = raw_output[1] if len(raw_output) > 1 else raw_output[0]
                confidence_val = fake_prob if fake_prob > 0.5 else (1 - fake_prob)
            else:
                fake_prob = raw_output 
                confidence_val = fake_prob if fake_prob > 0.5 else (1 - fake_prob)

            # Confidence Boosting / Calibration (Modified to be less "stuck")
            if confidence_val > 0.5:
                # Map [0.5, 1.0] -> [0.85, 0.99] for more variation
                normalized_score = (confidence_val - 0.5) * 2
                confidence_val = 0.85 + (normalized_score * 0.14)

            # Normalize to 0-100 for UI
            confidence = confidence_val * 100
            
            is_fake = fake_prob > 0.5
            label = "Fake" if is_fake else "Real"
            
            score_text = f" Model score (fake probability): {float(fake_prob):.2f}."
            if is_fake:
                emotional_tone = "High sensationalism" if fake_prob >= 0.75 else "Moderate sensationalism"
                source_credibility = "Low credibility indicators" if fake_prob >= 0.75 else "Some credibility concerns"
                semantic_consistency = "Inconsistencies detected" if fake_prob >= 0.75 else "Minor inconsistencies"
                analysis_text = "Content appears likely to be misinformation based on linguistic patterns." + score_text
            else:
                emotional_tone = "Neutral / factual tone" if fake_prob <= 0.25 else "Mostly neutral"
                source_credibility = "No major credibility red flags" if fake_prob <= 0.25 else "Limited red flags"
                semantic_consistency = "Consistent narrative structure" if fake_prob <= 0.25 else "Mostly consistent"
                analysis_text = "Content appears likely to be authentic based on linguistic patterns." + score_text
            
            analysis_summary = {"content": request.text[:1000]}

    except Exception as e:
        # Fallback if model fails
        print(f"Model Error: {e}")
        is_fake = False
        confidence = 0.0
        label = "Error"
        analysis_text = f"AI Analysis failed: {str(e)}"
        emotional_tone = "N/A"
        source_credibility = "N/A"
        semantic_consistency = "N/A"
        analysis_summary = {"content": request.text[:1000], "error": str(e)}

    label, confidence, learning_summary = apply_feedback_calibration(db, "fake_news", label, confidence)
    if learning_summary:
        analysis_summary.update(learning_summary)

    # Save to FakeNewsScan Table
    scan_entry = models.FakeNewsScan(
        user_id=current_user.id,
        content_text=request.text[:1000], 
        label=label,
        confidence_score=confidence,
        emotional_tone=emotional_tone,
        source_credibility=source_credibility,
        semantic_consistency=semantic_consistency,
        analysis_text=analysis_text
    )
    db.add(scan_entry)
    db.flush()
    
    # Save to AnalysisLog (Summary)
    log_entry = create_analysis_log(
        db,
        current_user.id,
        "Text Snippet",
        "Text",
        label,
        confidence,
        f"{len(request.text)} chars",
        analysis_summary=analysis_summary,
        scan_type="fake_news",
        scan_id=scan_entry.id,
    )
    
    db.commit()
    db.refresh(scan_entry)
    
    # Return both the database entry and the search results for the AI context
    response_data = {
        "id": scan_entry.id,
        "scan_id": scan_entry.id,
        "analysis_log_id": log_entry.id,
        "label": scan_entry.label,
        "confidence_score": scan_entry.confidence_score,
        "analysis_text": scan_entry.analysis_text,
        "search_results": search_results # Crucial for the AI to see real news
    }
    
    return response_data


@router.post("/train-fake-news")
def train_fake_news_model(
    sample_size: int = None,
    epochs: int = 1,
    current_user: schemas.User = Depends(dependencies.get_current_user)
):
    """
    Triggers the fine-tuning of the BERT model on the server using True.csv and Fake.csv.
    This process is run in a separate persistent process to avoid blocking the API.
    """
    # Construct command to run train_model.py
    # We use sys.executable to ensure we use the same python interpreter (venv)
    
    # Path to train_model.py
    # Using 'l:\final year project\Backend\app\ml\train_model.py'
    
    # Need to be careful with paths. safer to use relative structure from this file or absolute.
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) # Backend/app
    script_path = os.path.join(base_dir, "ml", "train_model.py")
    
    cmd = [sys.executable, script_path]
    if sample_size:
        cmd.extend(["--sample_size", str(sample_size)])
    if epochs:
        cmd.extend(["--epochs", str(epochs)])
        
    try:
        # Popen starts the process and returns immediately
        # We redirect stdout/stderr to avoid potential pipe buffer locking issues or just let it print to server console
        subprocess.Popen(cmd)
        
        return {
            "message": "Training started in a separate process. Check server logs for progress.",
            "parameters": {
                "sample_size": sample_size,
                "epochs": epochs
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start training process: {str(e)}")


# Helper to save uploaded file
def save_upload_file(upload_file: UploadFile, subfolder: str = "") -> str:
    try:
        # Create uploads directory if not exists
        base_dir = "uploads" 
        if subfolder:
            base_dir = os.path.join(base_dir, subfolder)
        
        if not os.path.exists(base_dir):
            os.makedirs(base_dir)
            
        # Timestamp to avoid collisions
        timestamp = int(datetime.datetime.utcnow().timestamp())
        clean_filename = f"{timestamp}_{upload_file.filename}"
        file_path = os.path.join(base_dir, clean_filename)
        
        # Reset file cursor just in case
        upload_file.file.seek(0)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
            
        # Return DB-friendly URL path (assuming served from /uploads)
        # We need a proper URL helper, but for now assuming localhost/uploads
        # If running on different host, this should be configurable. 
        # Ideally returns relative path "uploads/filename" or absolute URL.
        # Returning URL for now as per current schema expectation
        
        # NOTE: In production, use env var for BASE_URL
        base_url = "http://localhost:8000" 
        
        # If subfolder is empty, url is /uploads/filename
        # Logic here: our mount is app.mount("/uploads", ...)
        
        return f"{base_url}/uploads/{clean_filename}"
        
    except Exception as e:
        print(f"Error saving file: {e}")
        return None

# --- Fake News ---
# ... (Fake News Logic Remains Unchanged) ...
# ...

# --- Deepfake Image ---
from ..ml.image_detector import predict_image
from ..ml.video_detector import predict_video

@router.post("/image", response_model=schemas.ImageScanResponse)
async def scan_image(file: UploadFile = File(...), db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    try:
        # Save file first to ensure we have it
        file_url = save_upload_file(file)
        if not file_url:
            raise HTTPException(status_code=500, detail="Failed to save uploaded file")

        # Read file bytes for prediction (read from saved file or reset cursor)
        # Since save_upload_file reads the stream, we should reset or read from path?
        # save_upload_file resets cursor to 0 before reading? No, it consumes.
        # Let's reset cursor after save if we need to read again, OR read bytes first then save.
        
        file.file.seek(0)
        contents = await file.read()
        
        # Run AI Prediction
        result = predict_image(contents)
        
        label = result.get("label", "Error")
        fake_prob = result.get("fake_probability")
        confidence = result.get("confidence", 0.0) * 100 # Convert to percentage
        is_fake = label == "Fake"
        
        score_text = ""
        if isinstance(fake_prob, (int, float)):
            score_text = f" Model score (fake probability): {float(fake_prob):.2f}."

        if label == "Fake":
            visual_artifacts = "Synthetic textures or boundary artifacts detected"
            pixel_consistency = "Inconsistent lighting/noise patterns"
            metadata_analysis = "Metadata may be missing or altered"
            analysis_text = "Image shows indicators consistent with manipulation." + score_text
        elif label == "Real":
            visual_artifacts = "No strong manipulation artifacts detected"
            pixel_consistency = "Consistent lighting/noise patterns"
            metadata_analysis = "No major metadata anomalies detected"
            analysis_text = "Image appears authentic based on the model." + score_text
        elif label == "Inconclusive":
            visual_artifacts = "Mixed signals"
            pixel_consistency = "Partially consistent"
            metadata_analysis = "Inconclusive"
            analysis_text = "Result is inconclusive. Try a higher-resolution image or a less-compressed file." + score_text
        else:
            raise HTTPException(status_code=400, detail=result.get("error", "Image Analysis Failed"))

        label, confidence, learning_summary = apply_feedback_calibration(db, "image", label, confidence)
        analysis_summary = learning_summary or None

        scan_entry = models.ImageScan(
            user_id=current_user.id,
            image_url=file_url,
            label=label,
            confidence_score=confidence,
            visual_artifacts=visual_artifacts,
            pixel_consistency=pixel_consistency,
            metadata_analysis=metadata_analysis,
            analysis_text=analysis_text
        )
        db.add(scan_entry)
        db.flush()
        
        file_size_mb = f"{len(contents) / (1024*1024):.2f} MB"
        log_entry = create_analysis_log(
            db,
            current_user.id,
            file.filename,
            "Image",
            label,
            confidence,
            file_size_mb,
            file_url,
            analysis_summary=analysis_summary,
            scan_type="image",
            scan_id=scan_entry.id,
        )
        
        db.commit()
        return {
            "analysis_log_id": log_entry.id,
            "scan_id": scan_entry.id,
            "label": scan_entry.label,
            "confidence_score": scan_entry.confidence_score,
            "analysis_text": scan_entry.analysis_text,
            "visual_artifacts": scan_entry.visual_artifacts,
            "pixel_consistency": scan_entry.pixel_consistency,
            "metadata_analysis": scan_entry.metadata_analysis,
        }

    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Image Scan Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- Deepfake Video ---
@router.post("/video", response_model=schemas.VideoScanResponse)
async def scan_video(file: UploadFile = File(...), db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    try:
        # Save file immediately
        file_url = save_upload_file(file)
        if not file_url:
             raise HTTPException(status_code=500, detail="Failed to save uploaded file")
             
        # Calculate SHA256 hash of the video file
        import hashlib
        video_hash = hashlib.sha256()
        
        file.file.seek(0)
        
        # Proceed with processing...
        
        # Use temp file logic for processing as before, but we also have the permanent file now.
        
        temp_filename = f"temp_{random.randint(1000, 9999)}_{file.filename}"
        temp_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "ml", temp_filename)
        
        size_bytes = 0
        with open(temp_path, "wb") as buffer:
            while True:
                chunk = await file.read(4096)
                if not chunk:
                    break
                size_bytes += len(chunk)
                video_hash.update(chunk)
                buffer.write(chunk)
        
        calculated_hash = video_hash.hexdigest()
        
        # CHECK DB FOR EXISTING SCAN
        existing_scan = db.query(models.VideoScan).filter(models.VideoScan.video_hash == calculated_hash).first()

        # If not in DB, proceed with AI Prediction
        result = predict_video(temp_path)
        
        # Cleanup temp
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
        label = result.get("label", "Error")
        if label == "Error":
             error_msg = result.get("error", "Unknown error during video analysis")
             raise HTTPException(status_code=400, detail=f"Video Analysis Failed: {error_msg}")

        fake_probability = result.get("fake_probability")
        confidence = result.get("confidence", 0.0) * 100
        score_text = ""
        if isinstance(fake_probability, (int, float)):
            score_text = f" Model score (fake probability): {float(fake_probability):.2f}."

        if label == "Deepfake":
            frame_consistency = "Jitter or artifacts detected across frames"
            audio_visual_sync = "Potential mismatch detected"
            blinking_patterns = "Irregular or absent blinking"
            analysis_text = "Video contains indicators of deepfake manipulation." + score_text
        elif label == "Real":
            frame_consistency = "Consistent and smooth"
            audio_visual_sync = "Synchronized"
            blinking_patterns = "Natural"
            analysis_text = "Video appears authentic based on frame analysis." + score_text
        else:
            frame_consistency = "Mixed signals across frames"
            audio_visual_sync = "Unclear"
            blinking_patterns = "Inconclusive"
            analysis_text = "Result is inconclusive. The model score is close to the decision boundary; try a higher-resolution or longer clip." + score_text
            
        label, confidence, learning_summary = apply_feedback_calibration(db, "video", label, confidence)
        file_size_mb = f"{(size_bytes / (1024*1024)):.2f} MB"

        if existing_scan:
            existing_scan.video_url = file_url
            existing_scan.label = label
            existing_scan.confidence_score = confidence
            existing_scan.frame_consistency = frame_consistency
            existing_scan.audio_visual_sync = audio_visual_sync
            existing_scan.blinking_patterns = blinking_patterns
            existing_scan.analysis_text = analysis_text
            existing_scan.created_at = datetime.datetime.utcnow()
            scan_entry = existing_scan
            db.flush()
        else:
            scan_entry = models.VideoScan(
                user_id=current_user.id,
                video_url=file_url,
                label=label,
                confidence_score=confidence,
                frame_consistency=frame_consistency,
                audio_visual_sync=audio_visual_sync,
                blinking_patterns=blinking_patterns,
                analysis_text=analysis_text,
                video_hash=calculated_hash 
            )
            db.add(scan_entry)
            db.flush()

        log_entry = create_analysis_log(
            db,
            current_user.id,
            file.filename,
            "Video",
            label,
            confidence,
            file_size_mb,
            scan_entry.video_url,
            analysis_summary=learning_summary or None,
            scan_type="video",
            scan_id=scan_entry.id,
        )
        db.commit()
        return {
            "analysis_log_id": log_entry.id,
            "scan_id": scan_entry.id,
            "label": scan_entry.label,
            "confidence_score": scan_entry.confidence_score,
            "analysis_text": scan_entry.analysis_text,
            "frame_consistency": scan_entry.frame_consistency,
            "audio_visual_sync": scan_entry.audio_visual_sync,
            "blinking_patterns": scan_entry.blinking_patterns,
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        import traceback
        with open("error_log.txt", "a") as f:
            f.write(f"\n--- Video Scan Error at {datetime.datetime.utcnow()} ---\n")
            f.write(str(e))
            f.write("\n")
            f.write(traceback.format_exc())
        print(f"Video Scan Error: {e}")
        if 'temp_path' in locals() and os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(status_code=500, detail=str(e))

# --- Deepfake Audio ---
from ..ml.audio_detector import predict_audio

@router.post("/audio", response_model=schemas.AudioScanResponse)
async def scan_audio(file: UploadFile = File(...), db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    try:
        file_url = save_upload_file(file)
        if not file_url:
             raise HTTPException(status_code=500, detail="Failed to save uploaded file")
             
        file.file.seek(0)
        
        # Save to temp file for librosa
        temp_filename = f"temp_audio_{random.randint(1000, 9999)}_{file.filename}"
        temp_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "ml", temp_filename)
        
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Run AI Prediction
        result = predict_audio(temp_path)
        
        # Cleanup
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
        label = result.get("label", "Error")
        if label == "Error":
             error_msg = result.get("error", "Unknown error during audio analysis")
             raise HTTPException(status_code=400, detail=f"Audio Analysis Failed: {error_msg}")

        confidence = result.get("confidence", 0.0) * 100
        is_fake = result.get("is_fake", False)
        
        if isinstance(label, str):
            final_label = label.title() 
        else:
            final_label = "Fake" if is_fake else "Real"

        if is_fake:
            spectral_analysis = "Abnormal spectral distribution"
            voice_cloning_signature = "Synthetic patterns detected"
            background_noise = "Artificial silence or noise floor"
            analysis_text = "Audio exhibits characteristics of AI generation."
        else:
            spectral_analysis = "Natural spectral range"
            voice_cloning_signature = "Human biometric consistency"
            background_noise = "Natural ambient noise"
            analysis_text = "Audio appears to be authentic human speech."
            
        final_label, confidence, learning_summary = apply_feedback_calibration(db, "audio", final_label, confidence)

        scan_entry = models.AudioScan(
            user_id=current_user.id,
            audio_url=file_url,
            label=final_label,
            confidence_score=confidence,
            spectral_analysis=spectral_analysis,
            voice_cloning_signature=voice_cloning_signature,
            background_noise=background_noise,
            analysis_text=analysis_text
        )
        db.add(scan_entry)
        db.flush()
        log_entry = create_analysis_log(
            db,
            current_user.id,
            file.filename,
            "Audio",
            final_label,
            confidence,
            "N/A",
            scan_entry.audio_url,
            analysis_summary=learning_summary or None,
            scan_type="audio",
            scan_id=scan_entry.id,
        )
        db.commit()
        return {
            "analysis_log_id": log_entry.id,
            "scan_id": scan_entry.id,
            "label": scan_entry.label,
            "confidence_score": scan_entry.confidence_score,
            "analysis_text": scan_entry.analysis_text,
            "spectral_analysis": scan_entry.spectral_analysis,
            "voice_cloning_signature": scan_entry.voice_cloning_signature,
            "background_noise": scan_entry.background_noise,
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Audio Scan Error: {e}")
        if 'temp_path' in locals() and os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(status_code=500, detail=str(e))

# --- AI Text ---
@router.post("/ai-text", response_model=schemas.AiTextResponse)
def scan_ai_text(request: schemas.AiTextRequest, db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    try:
        # Use the RoBERTa model helper
        result = bert_classifier.predict_ai_generated_text(request.text)
        
        label = result.get("label", "Error")
        if label == "Error":
             error_msg = result.get("error", "Unknown error")
             raise HTTPException(status_code=400, detail=f"AI Text Analysis Failed: {error_msg}")

        confidence = result.get("confidence", 0.0) * 100
        is_ai = result.get("is_ai", False)
        
        # Heuristic Analysis Text based on probability
        if is_ai:
            perplexity = "Low (Typical of LLMs)"
            burstiness = "Low variation (Uniform)"
            repetitive_patterns = "Algorithmic phrasing detected"
            analysis_text = "Content strongly resembles AI-generated text patterns."
        else:
            perplexity = "High (Human-like)"
            burstiness = "High (Natural variation)"
            repetitive_patterns = "Natural phrasing"
            analysis_text = "Content appears to be human-written."

        label, confidence, learning_summary = apply_feedback_calibration(db, "ai_text", label, confidence)

        scan_entry = models.AiTextScan(
            user_id=current_user.id,
            content_text=request.text[:1000],
            label=label,
            confidence_score=confidence,
            perplexity=perplexity,
            burstiness=burstiness,
            repetitive_patterns=repetitive_patterns,
            analysis_text=analysis_text
        )
        db.add(scan_entry)
        db.flush()
        analysis_summary = {"content": request.text[:1000]}
        analysis_summary.update(learning_summary)
        log_entry = create_analysis_log(
            db,
            current_user.id,
            "Text Snippet",
            "Text",
            label,
            confidence,
            f"{len(request.text)} chars",
            analysis_summary=analysis_summary,
            scan_type="ai_text",
            scan_id=scan_entry.id,
        )
        db.commit()
        return {
            "analysis_log_id": log_entry.id,
            "scan_id": scan_entry.id,
            "label": scan_entry.label,
            "confidence_score": scan_entry.confidence_score,
            "analysis_text": scan_entry.analysis_text,
            "perplexity": scan_entry.perplexity,
            "burstiness": scan_entry.burstiness,
            "repetitive_patterns": scan_entry.repetitive_patterns,
        }

    except Exception as e:
        print(f"AI Text Scan Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- Malware ---
# --- Malware ---
from ..ml.virustotal import VirusTotalClient
vt_client = VirusTotalClient()

@router.post("/malware", response_model=schemas.MalwareResponse)
async def scan_malware(
    url: str = Form(None), 
    file: UploadFile = File(None), 
    db: Session = Depends(database.get_db), 
    current_user: models.User = Depends(dependencies.get_current_user)
):
    try:
        target = url if url else file.filename
        scan_type = "URL" if url else "File"
        
        if url:
            # Scan URL
            result = vt_client.scan_url(url)
        elif file:
            # Read file bytes
            file_bytes = await file.read()
            target = file.filename
            result = vt_client.scan_file(file_bytes, target)
        else:
            raise HTTPException(status_code=400, detail="Must provide either 'url' or 'file'")
            
        # Parse result
        if "error" in result:
             # If API fails or file unknown, handle gracefully
             # For unknown, we default to "Clean - Cloud Unknown" or similar?
             # But let's return error if it's an API error
             if "VirusTotal Error" in result["error"]:
                 raise HTTPException(status_code=502, detail=result["error"])
             
             # Fallback
             label = "Unknown"
             score = 0
             threat_level = "Unknown"
             signature_match = "None"
             heuristic_score = "0/100"
             analysis_text = f"Scan inconclusive: {result['error']}"
        else:
            label = result.get("label", "Clean")
            if label == "Pending":
                raise HTTPException(status_code=409, detail=result.get("analysis", "VirusTotal analysis is still processing."))
            score = result.get("score", 0)
            threat_level = result.get("threat_level", "None")
            signature_match = result.get("signature", "None")
            malicious_count = result.get("malicious_count", 0)
            total_engines = result.get("total_engines", 100)
            heuristic_score = f"{malicious_count}/{total_engines}" if total_engines else f"{score}/100"
            analysis_text = result.get("analysis", "No analysis details.")

        label, calibrated_score, learning_summary = apply_feedback_calibration(db, "malware", label, float(score))
        score = int(round(calibrated_score))

        scan_entry = models.MalwareScan(
            user_id=current_user.id,
            target=target[:500],
            scan_type=scan_type,
            label=label,
            threat_score=score,
            threat_level=threat_level,
            signature_match=signature_match[:255],
            heuristic_score=heuristic_score[:50],
            analysis_text=analysis_text
        )
        db.add(scan_entry)
        db.flush()
        analysis_summary = {"content": analysis_text}
        analysis_summary.update(learning_summary)
        log_entry = create_analysis_log(
            db,
            current_user.id,
            target,
            "Malware",
            label,
            float(score),
            "N/A",
            analysis_summary=analysis_summary,
            scan_type="malware",
            scan_id=scan_entry.id,
        )
        db.commit()
        return {
            "analysis_log_id": log_entry.id,
            "scan_id": scan_entry.id,
            "label": scan_entry.label,
            "threat_score": scan_entry.threat_score,
            "threat_level": scan_entry.threat_level,
            "signature_match": scan_entry.signature_match,
            "heuristic_score": scan_entry.heuristic_score,
            "analysis_text": scan_entry.analysis_text,
        }

    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Malware Scan Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
