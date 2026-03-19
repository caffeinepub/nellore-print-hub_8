import { SiWhatsapp } from "react-icons/si";

export default function WhatsAppFAB() {
  return (
    <a
      href="https://wa.me/919390535070"
      target="_blank"
      rel="noopener noreferrer"
      data-ocid="whatsapp.fab.button"
      className="whatsapp-fab fixed bottom-6 right-6 z-50 w-14 h-14 bg-whatsapp rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      aria-label="Chat on WhatsApp"
    >
      <SiWhatsapp size={28} className="text-white" />
    </a>
  );
}
