import { Printer } from "lucide-react";

const QUICK_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Services", href: "#services" },
  { label: "Gallery", href: "#gallery" },
  { label: "Quote", href: "#quote" },
  { label: "Contact", href: "#contact" },
];

export default function Footer() {
  const year = new Date().getFullYear();
  const hostname = encodeURIComponent(window.location.hostname);

  const handleNavClick = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-brand-dark text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-red rounded-md flex items-center justify-center">
              <Printer size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-base tracking-wide">
                Nellore Print Hub
              </p>
              <p className="text-gray-500 text-xs">Magic Advertising</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {QUICK_LINKS.map((link) => (
              <button
                type="button"
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                data-ocid={`footer.${link.href.slice(1)}.link`}
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="w-full border-t border-gray-700 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <p className="text-gray-500">
              © {year} Nellore Print Hub | Magic Advertising
            </p>
            <p className="text-gray-600">
              Built with ❤️ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
