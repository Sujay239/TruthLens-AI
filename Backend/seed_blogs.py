import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os

# Ensure the app module can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SQLALCHEMY_DATABASE_URL
from app.models import Blog, Base

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

demo_blogs = [
  {
    "title": "The Rise of Deepfakes: How AI is Blurring the Lines of Reality",
    "excerpt": "Explore the rapid evolution of deepfake technology, its implications on digital trust, and how advanced AI models are fighting back to detect synthetic media.",
    "content": """
      <p>In recent years, the rapid advancement of artificial intelligence has given rise to a new and pervasive threat: deepfakes. These highly realistic synthetic media, created using advanced deep learning techniques such as Generative Adversarial Networks (GANs), have the potential to blur the lines between reality and fiction like never before.</p>
      
      <h3>The Technology Behind Deepfakes</h3>
      <p>At the core of deepfake technology are GANs, which consist of two neural networks—the generator and the discriminator—competing against each other. The generator creates synthetic images or videos, while the discriminator evaluates them for authenticity. Over time, the generator becomes incredibly adept at producing media that is indistinguishable from real footage.</p>
      
      <h3>Implications for Digital Trust</h3>
      <p>The ability to effortlessly generate hyper-realistic videos of individuals saying or doing things they never did poses significant risks. From political manipulation and misinformation campaigns to corporate espionage and personal defamation, the malicious use of deepfakes threatens to erode public trust in digital media.</p>
      
      <h3>Fighting Fire with Fire</h3>
      <p>As deepfakes become more sophisticated, so too must the tools used to detect them. Researchers and technologists are developing advanced AI models designed specifically to identify telltale signs of synthetic media. These include analyzing subtle anomalies in facial movements, lighting inconsistencies, and digital artifacts left behind by the generation process.</p>
      
      <p>At TruthLens AI, we are committed to staying ahead of the curve, employing state-of-the-art detection algorithms to safeguard digital integrity and protect against the spread of deceptive media.</p>
    """,
    "category": "Deepfake Analysis",
    "author": "Sujay Kumar",
    "read_time": "5 min read",
    "image_url": "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80",
  },
  {
    "title": "Detecting AI-Generated Text in the Era of LLMs",
    "excerpt": "With the proliferation of ChatGPT and other LLMs, distinguishing human-written text from AI-generated content is harder than ever. Learn how perplexity and burstiness metrics help.",
    "content": """
      <p>The advent of Large Language Models (LLMs) like ChatGPT, Claude, and Gemini has revolutionized the way we create and interact with text. However, this technological leap has also introduced a significant challenge: distinguishing between human-written and AI-generated content.</p>
      
      <h3>The Challenge of AI Text</h3>
      <p>Modern LLMs are capable of producing highly coherent, contextually accurate, and engaging text. This makes them incredibly useful for a variety of applications, but it also raises concerns about academic dishonesty, automated propaganda, and the mass generation of low-quality web content.</p>
      
      <h3>Perplexity and Burstiness</h3>
      <p>To combat this, detection algorithms rely on linguistic metrics such as perplexity and burstiness. Perplexity measures how predictable a piece of text is; AI models tend to produce highly predictable, low-perplexity text. Burstiness, on the other hand, measures the variation in sentence length and structure. Human writers naturally exhibit high burstiness, varying their sentence lengths and structures, while AI often produces more uniform text.</p>
      
      <p>By analyzing these and other subtle linguistic patterns, advanced text detection systems can provide a reliable assessment of a text's origin, helping to maintain academic integrity and digital trust.</p>
    """,
    "category": "Text Detection",
    "author": "Sujay Kumar",
    "read_time": "4 min read",
    "image_url": "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&w=800&q=80",
  },
  {
    "title": "Audio Deepfakes: The Next Frontier in Synthetic Media",
    "excerpt": "Voice cloning technology is becoming increasingly accessible. We analyze the mechanisms behind audio deepfakes and the forensic techniques used to uncover them.",
    "content": """
      <p>While visual deepfakes have captured much of the public's attention, a quieter but equally insidious threat is emerging: audio deepfakes. Voice cloning technology has advanced to the point where just a few seconds of audio can be used to create highly convincing synthetic speech.</p>
      
      <h3>The Mechanisms of Voice Cloning</h3>
      <p>Audio deepfakes are typically generated using deep learning models that analyze the acoustic features of a person's voice—such as pitch, tone, and cadence—and use this information to synthesize new speech. This technology can be used for harmless entertainment, but it also carries severe risks for fraud, impersonation, and misinformation.</p>
      
      <h3>Forensic Detection Techniques</h3>
      <p>Detecting audio deepfakes requires sophisticated forensic analysis. Analysts look for subtle inconsistencies in the audio, such as unnatural breathing patterns, digital artifacts, or lack of background noise consistency. Additionally, advanced spectral analysis can reveal anomalies in the frequency distribution of the voice that are characteristic of synthetic generation.</p>
      
      <p>As voice cloning technology continues to evolve, so too must our detection methods to ensure the authenticity of audio communication.</p>
    """,
    "category": "Audio Forensics",
    "author": "Sujay Kumar",
    "read_time": "6 min read",
    "image_url": "https://images.unsplash.com/photo-1589903308904-1010c2294adc?auto=format&fit=crop&w=800&q=80",
  },
  {
    "title": "Understanding Malware Signatures in Suspicious Files",
    "excerpt": "A deep dive into how TruthLens AI analyzes file structures and metadata to identify potentially malicious software hidden within seemingly benign downloads.",
    "content": """
      <p>In an increasingly interconnected digital world, the threat of malware is omnipresent. Malicious actors constantly develop new techniques to hide harmful software within seemingly benign files, making robust detection mechanisms essential.</p>
      
      <h3>The Role of Malware Signatures</h3>
      <p>Traditional antivirus software relies heavily on malware signatures—unique strings of code or data patterns that are known to be associated with specific malicious programs. When a file is scanned, its contents are compared against a vast database of known signatures. If a match is found, the file is flagged as malicious.</p>
      
      <h3>Advanced Heuristic Analysis</h3>
      <p>However, signature-based detection is not foolproof, as it struggles to identify novel or heavily obfuscated malware. This is where heuristic analysis comes in. Instead of looking for specific known patterns, heuristic analysis evaluates the behavior and structural characteristics of a file to determine if it is potentially harmful.</p>
      
      <p>By combining signature matching with advanced heuristic analysis, TruthLens AI provides a comprehensive defense against both known and emerging malware threats, ensuring the safety of your digital environment.</p>
    """,
    "category": "Cybersecurity",
    "author": "Sujay Kumar",
    "read_time": "5 min read",
    "image_url": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
  },
  {
    "title": "The Role of Metadata in Uncovering Manipulated Images",
    "excerpt": "Images carry hidden data that often reveals their true origin. Learn how metadata analysis plays a crucial role in the digital forensics process.",
    "content": """
      <p>In the age of digital photography and image editing software, seeing is no longer believing. While a manipulated image might look perfectly authentic to the naked eye, the hidden data embedded within it—known as metadata—can often reveal its true origins and any alterations it has undergone.</p>
      
      <h3>What is Metadata?</h3>
      <p>Metadata is essentially 'data about data.' In the context of a digital image, this includes information such as the date and time the photo was taken, the camera model, the exposure settings, and sometimes even the GPS coordinates of the location. Additionally, many image editing software programs leave traces of their use in the file's metadata.</p>
      
      <h3>Metadata Analysis in Digital Forensics</h3>
      <p>Digital forensics experts utilize specialized tools to extract and analyze this metadata. For example, if an image claims to depict an event from a specific date, but the metadata indicates it was created months later using Photoshop, this raises immediate red flags.</p>
      
      <p>While metadata can be intentionally stripped or altered by sophisticated actors, it remains a vital and often revealing component of the digital forensics process.</p>
    """,
    "category": "Image Verification",
    "author": "Sujay Kumar",
    "read_time": "4 min read",
    "image_url": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
  },
  {
    "title": "TruthLens AI: Building a Safer Digital Ecosystem",
    "excerpt": "An overview of our mission, the multi-modal detection capabilities of our platform, and our vision for a future where digital truth is easily verifiable.",
    "content": """
      <p>The digital landscape is increasingly fraught with misinformation, deepfakes, and malicious software. At TruthLens AI, we recognize the urgent need for robust tools to verify the authenticity of digital content and protect against these threats.</p>
      
      <h3>Our Mission</h3>
      <p>Our mission is to empower individuals and organizations with the advanced technology necessary to navigate the digital world with confidence. We believe that access to reliable information is a fundamental right, and we are committed to building a safer and more transparent digital ecosystem.</p>
      
      <h3>Multi-Modal Detection Capabilities</h3>
      <p>TruthLens AI offers a comprehensive suite of multi-modal detection capabilities. From analyzing deepfake videos and audio voice cloning to identifying AI-generated text and scanning files for malware, our platform leverages state-of-the-art artificial intelligence to provide highly accurate and reliable assessments.</p>
      
      <p>As the technological landscape continues to evolve, we remain dedicated to advancing our detection methods and staying at the forefront of digital forensics. Together, we can build a future where digital truth is not just an ideal, but a verifiable reality.</p>
    """,
    "category": "Platform Updates",
    "author": "Sujay Kumar",
    "read_time": "3 min read",
    "image_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
  }
]

def seed():
    # Ensure tables are created
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check if blogs already exist
        existing_count = db.query(Blog).count()
        if existing_count > 0:
            print(f"Database already contains {existing_count} blogs. Skipping seeding.")
            return

        for blog_data in demo_blogs:
            blog = Blog(
                id=str(uuid.uuid4()),
                title=blog_data["title"],
                excerpt=blog_data["excerpt"],
                content=blog_data["content"],
                category=blog_data["category"],
                author=blog_data["author"],
                read_time=blog_data["read_time"],
                image_url=blog_data["image_url"]
            )
            db.add(blog)
        
        db.commit()
        print(f"Successfully seeded {len(demo_blogs)} demo blogs.")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
