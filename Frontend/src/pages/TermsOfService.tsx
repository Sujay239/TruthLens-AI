import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 md:py-20 max-w-4xl">
        <div className="space-y-4 mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            Terms of Service
          </h1>
          <p className="text-muted-foreground text-lg">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold tracking-tight mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-muted-foreground leading-7">
              By accessing and using TruthLens AI, you accept and agree to be
              bound by the terms and provision of this agreement. In addition,
              when using these particular services, you shall be subject to any
              posted guidelines or rules applicable to such services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold tracking-tight mb-4">
              2. Description of Service
            </h2>
            <p className="text-muted-foreground leading-7">
              TruthLens AI provides AI-powered content verification tools. You
              agree that these tools are provided "AS-IS" and that we assume no
              responsibility for the timeliness, deletion, mis-delivery or
              failure to store any user communications or personalization
              settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold tracking-tight mb-4">
              3. User Conduct
            </h2>
            <p className="text-muted-foreground leading-7 mb-4">
              You agree to not use the service to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground marker:text-primary">
              <li>
                Upload any content that is unlawful, harmful, threatening,
                abusive, harassing, or otherwise objectionable.
              </li>
              <li>
                Impersonate any person or entity or falsely state or otherwise
                misrepresent your affiliation with a person or entity.
              </li>
              <li>
                Forge headers or otherwise manipulate identifiers in order to
                disguise the origin of any content transmitted through the
                Service.
              </li>
              <li>
                Violate any applicable local, state, national or international
                law.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold tracking-tight mb-4">
              4. Intellectual Property
            </h2>
            <p className="text-muted-foreground leading-7">
              The content, organization, graphics, design, compilation, magnetic
              translation, digital conversion and other matters related to the
              Site are protected under applicable copyrights, trademarks and
              other proprietary (including but not limited to intellectual
              property) rights. The copying, redistribution, use or publication
              by you of any such matters or any part of the Site is strictly
              prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold tracking-tight mb-4">
              5. Limitation of Liability
            </h2>
            <p className="text-muted-foreground leading-7">
              YOU EXPRESSLY UNDERSTAND AND AGREE THAT TRUTHLENS AI SHALL NOT BE
              LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
              CONSEQUENTIAL OR EXEMPLARY DAMAGES, INCLUDING BUT NOT LIMITED TO,
              DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA OR OTHER
              INTANGIBLE LOSSES.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
