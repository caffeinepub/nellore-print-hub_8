import { Menu, Printer, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Services", href: "#services" },
  { label: "Gallery", href: "#gallery" },
  { label: "Quote", href: "#quote" },
  { label: "Contact", href: "#contact" },
];

const CATEGORY_LINKS = [
  "Digital Printing",
  "Flex Banners",
  "Business Cards",
  "Stickers",
  "T-Shirts",
  "Packaging",
  "Logo Design",
];

export default function Navbar() {
  const [activeSection, setActiveSection] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const sections = ["home", "services", "gallery", "quote", "contact"];
    const observers: IntersectionObserver[] = [];
    for (const id of sections) {
      const el = document.getElementById(id);
      if (!el) continue;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { threshold: 0.35 },
      );
      obs.observe(el);
      observers.push(obs);
    }
    return () => {
      for (const o of observers) o.disconnect();
    };
  }, []);

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-shadow ${scrolled ? "shadow-lg" : ""}`}
    >
      <nav className="bg-brand-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-brand-red rounded-md flex items-center justify-center">
                <Printer size={18} className="text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-base leading-tight tracking-wide">
                  Nellore Print Hub
                </p>
                <p className="text-gray-400 text-xs leading-tight">
                  Your Vision Printed to Perfection
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const id = link.href.slice(1);
                const isActive = activeSection === id;
                return (
                  <button
                    type="button"
                    key={link.href}
                    onClick={() => handleNavClick(link.href)}
                    data-ocid={`nav.${id}.link`}
                    className={`px-4 py-2 text-sm font-medium rounded transition-colors relative ${isActive ? "text-white" : "text-gray-300 hover:text-white"}`}
                  >
                    {link.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-brand-red rounded-full"
                      />
                    )}
                  </button>
                );
              })}
              <a
                href="/admin"
                className="ml-3 px-4 py-1.5 text-xs font-semibold border border-gray-600 text-gray-300 rounded hover:border-brand-red hover:text-brand-red transition-colors"
                data-ocid="nav.admin.link"
              >
                Admin
              </a>
            </div>

            <button
              type="button"
              className="md:hidden text-white p-2"
              onClick={() => setMenuOpen((p) => !p)}
              data-ocid="nav.menu.toggle"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      <div className="hidden md:block bg-brand-red">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-1.5 flex items-center gap-6 overflow-x-auto">
          {CATEGORY_LINKS.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => handleNavClick("#services")}
              className="text-white text-xs font-medium whitespace-nowrap hover:text-red-100 transition-colors"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-brand-dark border-t border-gray-700"
          >
            <div className="px-4 py-3 space-y-1">
              {NAV_LINKS.map((link) => {
                const id = link.href.slice(1);
                const isActive = activeSection === id;
                return (
                  <button
                    type="button"
                    key={link.href}
                    onClick={() => handleNavClick(link.href)}
                    data-ocid={`nav.mobile.${id}.link`}
                    className={`block w-full text-left px-4 py-2.5 rounded text-sm font-medium transition-colors ${isActive ? "bg-brand-red text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"}`}
                  >
                    {link.label}
                  </button>
                );
              })}
              <a
                href="/admin"
                className="block px-4 py-2.5 text-sm text-gray-400 hover:text-white"
              >
                Admin Panel
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
