import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Ethics() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 md:py-20 max-w-4xl">
        <div className="space-y-4 mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            AI Ethics & Responsibility
          </h1>
          <p className="text-muted-foreground text-lg">
            Our commitment to building trustworthy, transparent, and fair
            artificial intelligence.
          </p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold tracking-tight mb-4">
              1. Our Core Mission
            </h2>
            <p className="text-muted-foreground leading-7">
              At TruthLens AI, our mission is to empower individuals and
              organizations to discern truth from fabrication in the digital
              age. We believe that technology should serve to clarify reality,
              not distort it. Our tools are designed to detect deepfakes and
              misinformation with high accuracy while upholding the highest
              ethical standards.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold tracking-tight mb-4">
              2. Transparency & Explainability
            </h2>
            <p className="text-muted-foreground leading-7 mb-4">
              We believe that "black box" AI is insufficient for critical
              verification tasks.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground marker:text-primary">
              <li>
                <strong>Explainable Results:</strong> Our models provide
                detailed analysis (e.g., highlighting visual artifacts, spectral
                inconsistencies) rather than just a binary "Real/Fake" label.
              </li>
              <li>
                <strong>Confidence Scores:</strong> We always provide a
                confidence score to reflect the certainty of our models.
              </li>
              <li>
                <strong>Methodology:</strong> We openly discuss the techniques
                and datasets used to train our detection systems (within
                security constraints).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold tracking-tight mb-4">
              3. Privacy & Data Integrity
            </h2>
            <p className="text-muted-foreground leading-7">
              User privacy is paramount. When you upload media for analysis:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground marker:text-primary mt-4">
              <li>We do not sell your personal data or uploaded content.</li>
              <li>
                Uploads are processed securely and deleted or anonymized
                according to our retention policies.
              </li>
              <li>
                We strictly adhere to data protection regulations (GDPR/CCPA
                compliant practices).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold tracking-tight mb-4">
              4. Bias Mitigation
            </h2>
            <p className="text-muted-foreground leading-7">
              We actively work to reduce bias in our AI models.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground marker:text-primary mt-4">
              <li>
                <strong>Diverse Datasets:</strong> We train on diverse datasets
                representing various demographics, languages, and contexts to
                prevent discriminatory outcomes.
              </li>
              <li>
                <strong>Continuous Auditing:</strong> We regularly audit our
                models for performance disparities across different groups.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold tracking-tight mb-4">
              5. Responsible Use
            </h2>
            <p className="text-muted-foreground leading-7">
              Our tools are intended for verification and fact-checking. We
              prohibit the use of our API for malicious purposes, such as
              automated harassment or targeted surveillance. We reserve the
              right to suspend accounts that violate our usage policies.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
