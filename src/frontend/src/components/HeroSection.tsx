import { ArrowRight, CheckCircle } from "lucide-react";
import { motion } from "motion/react";

const SERVICES = [
  "Logo Design",
  "Flex Banners",
  "Business Cards",
  "Stickers",
  "T-Shirt Printing",
  "Packaging",
];

export default function HeroSection() {
  const handleQuoteClick = () => {
    document.getElementById("quote")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center"
      style={{
        backgroundImage:
          "url(/assets/generated/hero-printing.dim_1920x1080.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/30" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-2xl"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-brand-red/20 border border-brand-red/40 rounded-full px-4 py-1.5 mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-brand-red" />
            <span className="text-red-300 text-sm font-medium">
              Nellore&apos;s Premier Print Shop
            </span>
          </motion.div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Professional Printing
            <br />
            <span className="text-brand-red">Services in Nellore</span>
          </h1>

          <p className="text-gray-300 text-lg mb-8 leading-relaxed">
            Expert printing solutions for your business needs. From vibrant flex
            banners to premium business cards — we bring your vision to life.
          </p>

          <div className="flex flex-wrap gap-2 mb-10">
            {SERVICES.map((s) => (
              <span
                key={s}
                className="flex items-center gap-1.5 text-sm text-gray-200 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20"
              >
                <CheckCircle size={12} className="text-brand-red" />
                {s}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-4">
            <motion.button
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleQuoteClick}
              data-ocid="hero.quote.primary_button"
              className="btn-red flex items-center gap-2 text-base"
            >
              Request a Quote <ArrowRight size={18} />
            </motion.button>
            <motion.a
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              href="https://wa.me/919390535070"
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="hero.whatsapp.secondary_button"
              className="flex items-center gap-2 text-base font-semibold uppercase tracking-wide px-6 py-3 rounded-md border-2 border-white/50 text-white hover:border-white transition-colors"
            >
              WhatsApp Us
            </motion.a>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
          className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2"
        >
          <div className="w-1 h-2 bg-white/60 rounded-full" />
        </motion.div>
      </div>
    </section>
  );
}
