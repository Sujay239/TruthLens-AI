import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 md:py-20 max-w-4xl">
        <div className="space-y-4 mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            Privacy Policy
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
              1. Introduction
            </h2>
            <p className="text-muted-foreground leading-7">
              Welcome to TruthLens AI ("we," "our," or "us"). We are committed
              to protecting your personal information and your right to privacy.
              This Privacy Policy explains how we collect, use, disclose, and
              safeguard your information when you visit our website and use our
              AI-powered verification services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold tracking-tight mb-4">
              2. Information We Collect
            </h2>
            <p className="text-muted-foreground leading-7 mb-4">
              We collect information that you strictly provide to us when you
              register an account, use our detection tools, or communicate with
              us.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground marker:text-primary">
              <li>
                <strong>Personal Information:</strong> Name, email address,
                password, and contact details.
              </li>
              <li>
                <strong>Usage Data:</strong> Information about how you use our
                tools, including analysis history and API usage statistics.
              </li>
              <li>
                <strong>Content Data:</strong> Images, videos, or text you
                upload for verification purposes.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold tracking-tight mb-4">
              3. How We Use Your Information
            </h2>
            <p className="text-muted-foreground leading-7">
              We use the collected information to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground marker:text-primary mt-4">
              <li>Provide, operate, and maintain our services.</li>
              <li>Improve, personalize, and expand our platform.</li>
              <li>
                Analyze usage patterns to enhance our AI models (with anonymized
                data).
              </li>
              <li>
                Communicate with you regarding updates, security alerts, and
                support.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold tracking-tight mb-4">
              4. Data Security
            </h2>
            <p className="text-muted-foreground leading-7">
              We implement appropriate technical and organizational security
              measures to protect the security of your personal information.
              However, please also remember that we cannot guarantee that the
              internet itself is 100% secure. Although we will do our best to
              protect your personal information, transmission of personal
              information to and from our services is at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold tracking-tight mb-4">
              5. Contact Us
            </h2>
            <p className="text-muted-foreground leading-7">
              If you have any questions about this Privacy Policy, please
              contact us at{" "}
              <a
                href="mailto:privacy@truthlens.ai"
                className="text-blue-600 hover:underline"
              >
                privacy@truthlens.ai
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
