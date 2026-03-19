import { useEffect, useState } from "react";
import ContactSection from "../components/ContactSection";
import CustomerNotificationBanner from "../components/CustomerNotificationBanner";
import Footer from "../components/Footer";
import GallerySection from "../components/GallerySection";
import HeroSection from "../components/HeroSection";
import Navbar from "../components/Navbar";
import QuoteSection from "../components/QuoteSection";
import ReviewsSection from "../components/ReviewsSection";
import ServicesSection from "../components/ServicesSection";
import {
  SESSION_KEY,
  STORAGE_NAME_KEY,
  STORAGE_PHONE_KEY,
} from "../components/VisitorLoginModal";
import VisitorLoginModal from "../components/VisitorLoginModal";
import WhatsAppFAB from "../components/WhatsAppFAB";
import { useGetSiteSettings } from "../hooks/useQueries";

export default function HomePage() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [visitorPhone, setVisitorPhone] = useState("");
  const { data: settings } = useGetSiteSettings();

  useEffect(() => {
    // Show login modal on fresh load (not during same session)
    const logged = sessionStorage.getItem(SESSION_KEY);
    if (!logged) {
      setShowLoginModal(true);
    } else {
      // Restore stored phone
      const phone = localStorage.getItem(STORAGE_PHONE_KEY) || "";
      setVisitorPhone(phone);
    }
  }, []);

  const handleEntered = (_name: string, phone: string) => {
    setVisitorPhone(phone);
    setShowLoginModal(false);
  };

  const whatsappNumber = settings?.whatsappNumber || "919390535070";

  return (
    <div className="min-h-screen font-poppins">
      {showLoginModal && <VisitorLoginModal onEntered={handleEntered} />}

      {visitorPhone && (
        <CustomerNotificationBanner
          phone={visitorPhone}
          whatsappNumber={whatsappNumber}
        />
      )}

      <Navbar />
      <main>
        <HeroSection />
        <ServicesSection />
        <GallerySection />
        <ReviewsSection />
        <QuoteSection />
        <ContactSection />
      </main>
      <Footer />
      <WhatsAppFAB />
    </div>
  );
}
