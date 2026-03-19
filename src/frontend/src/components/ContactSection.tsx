import { ExternalLink, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { motion } from "motion/react";

export default function ContactSection() {
  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="section-title">CONTACT US</h2>
          <div className="flex justify-center mb-4">
            <span className="inline-block w-16 h-1 bg-brand-red rounded-full" />
          </div>
          <p className="section-subtitle">
            Get in touch — we're ready to bring your printing project to life.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Address */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0 }}
            data-ocid="contact.address.card"
            className="flex flex-col items-center text-center bg-gray-50 rounded-xl p-8 shadow-card"
          >
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <MapPin size={24} className="text-brand-red" />
            </div>
            <h3 className="font-bold text-gray-800 text-lg mb-2">
              Our Location
            </h3>
            <p className="text-gray-500 text-sm mb-4 leading-relaxed">
              Dargamitta, Nellore
              <br />
              Andhra Pradesh, India
            </p>
            <a
              href="https://maps.app.goo.gl/gXba56vXmLXL1eFp7"
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="contact.maps.link"
              className="inline-flex items-center gap-1.5 text-brand-red text-sm font-semibold hover:underline"
            >
              View on Google Maps <ExternalLink size={14} />
            </a>
          </motion.div>

          {/* Phone & Email */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            data-ocid="contact.phone.card"
            className="flex flex-col items-center text-center bg-gray-50 rounded-xl p-8 shadow-card"
          >
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <Phone size={24} className="text-brand-red" />
            </div>
            <h3 className="font-bold text-gray-800 text-lg mb-4">
              Phone & Email
            </h3>
            <a
              href="tel:+919390535070"
              data-ocid="contact.phone.link"
              className="text-gray-700 font-semibold text-base hover:text-brand-red transition-colors mb-2"
            >
              +91 93905 35070
            </a>
            <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-3">
              <Mail size={13} className="text-brand-red" />
              <a
                href="mailto:magic.nelloreprinthub@gmail.com"
                data-ocid="contact.email.link"
                className="hover:text-brand-red transition-colors break-all"
              >
                magic.nelloreprinthub@gmail.com
              </a>
            </div>
          </motion.div>

          {/* WhatsApp */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            data-ocid="contact.whatsapp.card"
            className="flex flex-col items-center text-center bg-gray-50 rounded-xl p-8 shadow-card"
          >
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mb-4">
              <MessageCircle size={24} className="text-green-500" />
            </div>
            <h3 className="font-bold text-gray-800 text-lg mb-2">WhatsApp</h3>
            <p className="text-gray-500 text-sm mb-4">
              Chat with us directly on WhatsApp for quick quotes and support.
            </p>
            <a
              href="https://wa.me/919390535070"
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="contact.whatsapp.link"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold text-sm px-5 py-2.5 rounded-md transition-colors"
            >
              <MessageCircle size={16} /> Chat on WhatsApp
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
