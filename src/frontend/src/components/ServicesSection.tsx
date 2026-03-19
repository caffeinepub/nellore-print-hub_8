import {
  ChevronRight,
  CreditCard,
  Image,
  Package,
  Palette,
  Shirt,
  Tag,
} from "lucide-react";
import { motion } from "motion/react";

const SERVICES = [
  {
    icon: Palette,
    title: "Logo Design",
    description:
      "Stand out with a unique, professional logo. We craft custom brand identities that leave a lasting impression.",
  },
  {
    icon: Image,
    title: "Flex Banner Printing",
    description:
      "High-resolution, weather-resistant flex banners for outdoor events, shops, and promotions.",
  },
  {
    icon: CreditCard,
    title: "Business Cards",
    description:
      "Premium quality business cards with matte, gloss, or UV finishes that make your brand memorable.",
  },
  {
    icon: Tag,
    title: "Sticker Printing",
    description:
      "Die-cut vinyl stickers, product labels, and custom shapes with vibrant waterproof inks.",
  },
  {
    icon: Shirt,
    title: "T-Shirt Printing",
    description:
      "DTF and sublimation printing for stunning full-color designs on cotton, polyester, and blended fabrics.",
  },
  {
    icon: Package,
    title: "Packaging",
    description:
      "Custom paper bags and cardboard boxes printed with your branding for a professional unboxing experience.",
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="section-title">OUR SERVICES</h2>
          <div className="flex justify-center mb-4">
            <span className="inline-block w-16 h-1 bg-brand-red rounded-full" />
          </div>
          <p className="section-subtitle max-w-xl mx-auto">
            We provide end-to-end printing solutions for businesses and
            individuals in Nellore and surrounding areas.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((svc, idx) => {
            const Icon = svc.icon;
            return (
              <motion.div
                key={svc.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                data-ocid={`services.item.${idx + 1}`}
                className="bg-white rounded-xl shadow-card border-t-4 border-brand-red p-6 hover:shadow-lg transition-shadow group"
              >
                <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-brand-red transition-colors">
                  <Icon
                    size={22}
                    className="text-brand-red group-hover:text-white transition-colors"
                  />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  {svc.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                  {svc.description}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById("quote")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="flex items-center gap-1 text-brand-red text-sm font-semibold hover:gap-2 transition-all"
                >
                  Get a Quote <ChevronRight size={16} />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
