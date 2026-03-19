import ContactSection from "../components/ContactSection";
import Footer from "../components/Footer";
import GallerySection from "../components/GallerySection";
import HeroSection from "../components/HeroSection";
import Navbar from "../components/Navbar";
import QuoteSection from "../components/QuoteSection";
import ServicesSection from "../components/ServicesSection";
import WhatsAppFAB from "../components/WhatsAppFAB";

export default function HomePage() {
  return (
    <div className="min-h-screen font-poppins">
      <Navbar />
      <main>
        <HeroSection />
        <ServicesSection />
        <GallerySection />
        <QuoteSection />
        <ContactSection />
      </main>
      <Footer />
      <WhatsAppFAB />
    </div>
  );
}
