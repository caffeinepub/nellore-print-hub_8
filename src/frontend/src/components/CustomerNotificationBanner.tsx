import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { QuoteRequest } from "../backend";
import { useGetQuoteResponseByPhone } from "../hooks/useQueries";

const SEEN_KEY = "nph_seen_responses";

interface Props {
  phone: string;
  whatsappNumber: string;
}

export default function CustomerNotificationBanner({
  phone,
  whatsappNumber,
}: Props) {
  const { data: quotes = [] } = useGetQuoteResponseByPhone(phone);
  const [unseenQuote, setUnseenQuote] = useState<QuoteRequest | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!quotes.length) return;
    const seenIds: string[] = JSON.parse(
      localStorage.getItem(SEEN_KEY) || "[]",
    );
    const unread = quotes.find(
      (q) => q.response && !seenIds.includes(String(q.id)),
    );
    if (unread) setUnseenQuote(unread);
  }, [quotes]);

  const handleDismiss = () => {
    if (unseenQuote) {
      const seenIds: string[] = JSON.parse(
        localStorage.getItem(SEEN_KEY) || "[]",
      );
      seenIds.push(String(unseenQuote.id));
      localStorage.setItem(SEEN_KEY, JSON.stringify(seenIds));
    }
    setDismissed(true);
    setModalOpen(false);
  };

  if (!unseenQuote || dismissed) return null;

  const waMsg = `Hello, I received a response about my quote request for '${unseenQuote.serviceType}'.`;
  const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(waMsg)}`;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[90] bg-green-500 text-white px-4 py-3 flex items-center justify-between gap-3 shadow-lg"
          data-ocid="notification.banner"
        >
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex-1 text-left flex items-center gap-2 hover:opacity-90"
            data-ocid="notification.view.button"
          >
            <span className="text-xl">🔔</span>
            <span className="font-semibold text-sm md:text-base">
              Your quote request has been reviewed!
            </span>
            <span className="text-xs text-green-100 hidden md:inline">
              — {unseenQuote.serviceType} — Click to view
            </span>
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="text-white/70 hover:text-white text-xl font-bold leading-none px-2"
            aria-label="Dismiss notification"
            data-ocid="notification.close_button"
          >
            ×
          </button>
        </motion.div>
      </AnimatePresence>

      {/* Response Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[95] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)" }}
            data-ocid="notification.dialog"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">✅</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    Quote Response
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {unseenQuote.serviceType}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-5">
                <p className="text-gray-800 text-sm leading-relaxed">
                  {unseenQuote.response}
                </p>
              </div>

              <div className="flex gap-3">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-ocid="notification.whatsapp.button"
                  className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors"
                >
                  💬 Chat on WhatsApp
                </a>
                <button
                  type="button"
                  onClick={handleDismiss}
                  data-ocid="notification.dismiss.button"
                  className="flex-1 border border-gray-200 text-gray-700 font-semibold text-sm px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
