# Truthlense AI — Presentation Slide Content

---

## Slide 1: Title Slide

**Main Content:**
- **Project Name:** Truthlense AI
- **Tagline:** Restoring Digital Trust through Advanced Deepfake and Misinformation Detection
- **Overview:** A source-available, enterprise-ready multimodal verification platform designed to detect synthetic media, fake news, and file-borne vulnerabilities.

**Speaker Notes:**
Welcome, everyone. Today, I am excited to introduce Truthlense AI, a comprehensive media verification platform built to address the growing trust crisis in our digital ecosystem. By integrating cutting-edge deep learning models with local static analysis and cloud threat feeds, Truthlense AI offers a robust defense against deepfakes, AI-generated text, fake news, and associated cyber security risks.

**Suggested Visual:**
A premium, dark-themed slide with a minimalist logo of Truthlense AI in the center, flanked by clean, glowing teal and cobalt blue grid patterns representing media analysis and verification logs.

---

## Slide 2: Problem Statement

**Main Content:**
- **The Deepfake Epidemic:** AI generators can now clone voices, swap faces, and write highly convincing fake articles with minimal effort.
- **The Trust Deficit:** Misinformation, synthetic identity theft, and corporate fraud are growing exponentially, undermining trust in media, legal proceedings, and financial transactions.
- **The Security Risk:** Deepfake files are often weaponized inside phishing emails, containing concealed malware or macro scripts designed to bypass traditional perimeter security.

**Speaker Notes:**
We are living in an era where seeing is no longer believing. Generative AI has made the creation of highly convincing deepfakes and automated misinformation accessible to anyone. Beyond the social impact of fake news, synthetic media is actively used in financial fraud and corporate espionage. Furthermore, malicious actors are increasingly hiding payloads inside media files. Truthlense AI was built because detecting deepfakes is no longer just a content moderation issue—it is a critical cybersecurity requirement.

**Suggested Visual:**
A split-screen graphic. On the left, a stylized visual of a face mesh transitioning into digital noise (representing deepfakes); on the right, a padlock icon with a warning sign (representing the security threat).

---

## Slide 3: Proposed Solution

**Main Content:**
- **Multimodal Verification:** A unified platform checking images, videos, audio clips, text files, and external links for authenticity and safety.
- **Dual-Engine Security:** Combines deepfake classification neural networks with local archive heuristics and Cloud-backed malware scans.
- **Explainable Outcomes:** Moving beyond binary "Real/Fake" answers to offer specific feature-level reports, confidence indexes, and cross-referenced news searches.

**Speaker Notes:**
Truthlense AI solves this problem by offering a unified, multimodal detection platform. Instead of forcing users to navigate separate tools for text, images, and audio, Truthlense AI integrates them into a single, high-performance dashboard. Crucially, the system checks not just if a file is AI-generated, but also if it is safe to open. We replace simple "black box" decisions with explainable indicators, providing detailed metadata analysis, confidence scores, and real-time news validations.

**Suggested Visual:**
A circular ecosystem diagram showing Truthlense AI at the center, with five outer nodes pointing to Text, Image, Video, Audio, and Malware scanning modules.

---

## Slide 4: Key Features

**Main Content:**
- **Multimodal Media Analysis:** Dedicated neural classifiers for deepfake images, audio recordings, video frames, and LLM-generated text.
- **Real-Time News Verification:** Real-time factual alignment checks for text snippets using automated Google News RSS parsing.
- **Hybrid Malware Detection:** Combined local entropy checks, EICAR test signature scans, and VirusTotal API cloud lookups.
- **Advanced PDF Reporting:** One-click generation of verification reports containing embedded evidence, timestamps, and confidence grids.

**Speaker Notes:**
Let's highlight the primary features of the platform. Truthlense AI supports text, image, audio, and video deepfake checking. When a user submits text, the system checks it against local BERT models and queries Google News RSS feeds to check if it aligns with verified reporting. Our malware scanning engine uses a local scanner for instant checks (EICAR signatures and file entropy) and queries VirusTotal. Finally, users can download formal, print-ready PDF reports of their scans for compliance or fact-checking logs.

**Suggested Visual:**
A horizontal grid of four cards, each showing a feature (Multimodal Detection, Real-time News, Hybrid Malware Scan, PDF Reporting) with clean, minimal icons.

---

## Slide 5: User Workflow

**Main Content:**
- **Secure Authentication:** Users register or log in securely using traditional credentials or integrated Google and GitHub OAuth.
- **Drag-and-Drop Ingestion:** The user uploads text, images, videos, or audio directly to the dashboard interface.
- **Dual-Tier Scanning:** Files are validated first for malware and security vulnerabilities, followed by deepfake analysis.
- **Interactive Results:** The UI displays classification labels, confidence scores, and structural anomalies (e.g. frame jitter or voice signatures).
- **Report Archival:** Scan records are automatically logged in the database, enabling historical tracking and PDF report generation.

**Speaker Notes:**
The user journey is streamlined for maximum usability. After a secure login—which supports single sign-on through Google or GitHub—the user lands on the dashboard. They can select the appropriate scanning tool and upload their file. Behind the scenes, the system performs a security scan first, then runs the AI models. The results are displayed instantly with granular feedback, such as blinking patterns for video or voice cloning signatures for audio, and the scan is saved to their history.

**Suggested Visual:**
A step-by-step horizontal chevron flow chart: Ingest -> Malware Scan -> AI Inference -> Dashboard Verdict -> Report Download.

---

## Slide 6: System Architecture

**Main Content:**
- **Frontend Layer:** Built using React 19, Vite, and TypeScript, configured with Tailwind CSS and Shadcn UI components.
- **Backend Layer:** Powered by FastAPI (Python) running on an asynchronous Uvicorn server, providing fast, non-blocking API endpoints.
- **Database & Storage Layer:** MySQL database managed via SQLAlchemy ORM, storing user credentials, detailed scan metadata, and activity charts.
- **AI/ML Layer:** Local PyTorch and scikit-learn models running inference in dedicated modules, with CPU/GPU hardware acceleration.
- **Integration Layer:** External service links to VirusTotal v3 for cloud threat lookups and Google News RSS for real-time fact checking.

**Speaker Notes:**
Truthlense AI uses a modern, high-performance architecture. The frontend is built on React 19 and Vite for a highly responsive single-page experience. The backend uses FastAPI, which provides high throughput and automatic Swagger documentation. We use a MySQL database connected via SQLAlchemy to persist records. When media is uploaded, FastAPI passes it to our local PyTorch and scikit-learn models, which run inference. If necessary, the server invokes the VirusTotal or Google News APIs.

**Suggested Visual:**
An architectural block diagram showing the Frontend (React/Vite), Backend (FastAPI), Database (MySQL), and AI Inference layer (PyTorch/Librosa) stacked vertically, with external boxes for OAuth, Google News RSS, and VirusTotal APIs.

---

## Slide 7: AI/ML Detection Pipeline

**Main Content:**
- **Deepfake Video Pipeline:** Extracts 60 frames uniformly from uploads via OpenCV; each frame is classified by a ResNet-18 model, and the scores are averaged to produce a majority-weighted verdict.
- **Deepfake Image Pipeline:** Normalizes inputs to 224x224 and feeds them to a fine-tuned ResNet-18 network to detect boundary manipulations and synthetic textures.
- **Deepfake Audio Pipeline:** Librosa extracts a 26-dimensional feature vector (Chroma, RMS, Spectral Centroid, Bandwidth, Rolloff, Zero-Crossing, and 20 MFCCs) classified by a trained Scikit-Learn model.
- **Fake News & AI Text Pipeline:** Uses BERT-based text classifiers for factuality verification and a specialized RoBERTa ChatGPT-detector model to isolate LLM-generated text patterns.
- **Deduplication Caching:** Implements SHA-256 video hashing, enabling the server to immediately return cached results for previously analyzed files.

**Speaker Notes:**
Let's drill down into the technical pipeline. Our video scanner uses OpenCV to extract 60 frames uniformly, feeding them into a ResNet-18 model to check for visual inconsistencies. For audio, we extract 26 features using Librosa—including 20 MFCC coefficients, spectral bandwidth, and zero-crossing rate—and run them through a machine learning classifier. To detect AI-written text, we use a RoBERTa-based detector specialized for ChatGPT outputs. Finally, we use SHA-256 video hashing to cache results and avoid re-processing duplicate files.

**Suggested Visual:**
A detailed pipeline diagram showing a video file being parsed: Frame Extraction (60 Frames) -> Neural Net (ResNet-18) -> Average Probability -> Decision Boundary -> Confidence Output.

---

## Slide 8: Technology Stack

**Main Content:**
- **Core Frontend:** React 19, Vite, TypeScript, Tailwind CSS, Shadcn UI
- **Data Visualization & PDF:** Recharts, jsPDF, Lucide React
- **Web API & Database:** FastAPI, Uvicorn, SQLAlchemy, PyMySQL, Pydantic
- **Deep Learning Frameworks:** PyTorch, Torchvision, Hugging Face Transformers
- **Feature Extraction & Math:** OpenCV-Python, Librosa, NumPy, SciPy, Joblib
- **Third-Party Services:** Google OAuth2, GitHub API, VirusTotal v3 API, Google News RSS

**Speaker Notes:**
This slide lists the exact technology stack powering Truthlense AI. We have combined React and Tailwind on the frontend to deliver a premium user interface. The backend uses Python's FastAPI, PyTorch, and Hugging Face Transformers to orchestrate heavy-duty machine learning inference. Signal processing is managed through OpenCV and Librosa, while database persistence is handled with MySQL and SQLAlchemy.

**Suggested Visual:**
A clean layout grouping logos or labels into four categories: Frontend (React, Tailwind, Recharts), Backend (FastAPI, MySQL), ML/AI (PyTorch, Transformers, Librosa, OpenCV), and External APIs (VirusTotal, Google News).

---

## Slide 9: UI/UX Highlights

**Main Content:**
- **Dark Mode Aesthetic:** Designed with a premium dark theme, glassmorphic card overlays, and smooth micro-animations.
- **Interactive Analytics:** Real-time visual summaries using Recharts (Weekly Scan Activity bar chart and Real vs. Fake ratio pie chart).
- **Interactive Auditing Details:** Modal windows allow users to inspect granular metrics like visual artifacts, spectral analysis, perplexity, and burstiness.
- **Evidence Previews:** The history log includes inline video playback and image previews, which are also printed directly into downloaded PDF reports.

**Speaker Notes:**
Aesthetics and user experience are key priorities. The platform features a dark mode layout designed to look premium and trustworthy. Users don't just see a percentage score; they can view interactive charts of their weekly activity and scan ratios. If they want to audit a past scan, the details modal shows structural data like perplexity and burstiness for text, or background noise details for audio, and they can generate beautiful, customized PDF reports on the spot.

**Suggested Visual:**
A mockup graphic showing the User Dashboard interface with the Recharts charts, a file list, and a small screenshot overlay of the downloaded PDF report with its blue header and visual preview.

---

## Slide 10: Security, Privacy & Reliability

**Main Content:**
- **Secure Auth & JWT:** Implements industry-standard password hashing using `passlib[bcrypt]` and stateless authorization tokens via JSON Web Tokens.
- **Local Sandbox Scanning:** Scans archives recursively (up to 3 levels deep) to block hidden executables or high-entropy binaries before they are stored.
- **VirusTotal Integration:** Cross-references files and links with cloud databases using SHA-256 hashes, protecting server infrastructure.
- **Audit Logs & Metadata:** Captures registration telemetry (browser, platform, and timestamps in Indian Standard Time) for administrator alerts.
- **No Data Retention Guarantee:** Processed uploads are securely stored in private local directories (`uploads`) with strict access controls.

**Speaker Notes:**
Security and privacy are deeply integrated into Truthlense AI. We protect user accounts using bcrypt password hashing and JWT sessions. On the ingestion side, our custom VirusTotal client runs local sandbox tests to inspect nested archives for high-entropy binaries or suspicious payload extensions, protecting the server. For compliance, the system logs technical metadata on account registration and processes files without selling or exposing any content.

**Suggested Visual:**
An icon representing safety (a shield with a checkmark) surrounded by padlock, key, and user profile icons, colored in emerald green and blue to convey security and trust.

---

## Slide 11: Use Cases & Impact

**Main Content:**
- **Journalism and Fact-Checking:** Empowers reporters to verify the authenticity of video submissions, audio recordings, and text quotes in real time.
- **Enterprise Fraud Prevention:** Protects human resources and finance departments from deepfake voice calls or manipulated identity documents.
- **Cybersecurity & Threat Intel:** Scans incoming email attachments for disguised media files containing hidden exploits or malicious scripts.
- **Legal and Investigation Support:** Generates print-ready PDF verification reports with digital signatures to archive chain-of-evidence verification.

**Speaker Notes:**
Where does Truthlense AI make an impact? In journalism, it allows editors to verify media clips before they go on air. In enterprise settings, it protects finance teams from voice cloning scams, where attackers impersonate executives on the phone. In cybersecurity, it scans uploaded files to ensure they don't contain malware, and in legal fields, it provides certified verification reports that document file hashes and analysis timestamps.

**Suggested Visual:**
A grid of four photos or illustrations representing the use cases: a journalist verifying a story, a corporate finance desk, a security operations center, and a courtroom gavel.

---

## Slide 12: Future Scope / Roadmap

**Main Content:**
- **Explainable AI Bounding Boxes:** Visual heatmap generation to highlight the exact regions of an image or video frame that were manipulated.
- **Real-Time Stream Interception:** Browser extensions and API hooks to analyze video streams and audio calls in real time (e.g. Zoom or Teams).
- **Multi-Modal Combined Scoring:** Advanced models analyzing video, audio, and transcripts simultaneously for unified credibility scores.
- **Third-Party Integrations:** Developer APIs, webhooks, and CMS plugins (e.g. WordPress, Slack) for automated media pre-screening.
- **Enhanced Local Models:** Continual training on next-generation datasets to improve accuracy on highly compressed social media uploads.

**Speaker Notes:**
Looking ahead, our roadmap focuses on expanding Truthlense AI's capabilities. We plan to introduce explainable AI heatmaps to highlight the exact modified pixels. We are also designing browser extensions for real-time video stream detection in video calls. Finally, we will build developer APIs and webhooks to let third-party platforms integrate our deepfake detection engine directly into their content pipelines. Thank you, and I am open to any questions.

**Suggested Visual:**
A clean, forward-moving timeline graph starting from the current release (Multimodal Verification) and progressing through API Integrations, Real-time Stream Detection, and Heatmap Localization.
