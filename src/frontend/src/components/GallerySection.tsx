import { Loader2, Settings, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useGetAllGalleryItems, useIsCallerAdmin } from "../hooks/useQueries";

const STATIC_GALLERY = [
  {
    id: "s1",
    title: "Logo Design Portfolio",
    image: "/assets/generated/gallery-logo-design.dim_600x400.jpg",
  },
  {
    id: "s2",
    title: "Flex Banner Printing",
    image: "/assets/generated/gallery-flex-banner.dim_600x400.jpg",
  },
  {
    id: "s3",
    title: "Premium Business Cards",
    image: "/assets/generated/gallery-business-cards.dim_600x400.jpg",
  },
  {
    id: "s4",
    title: "Custom Sticker Designs",
    image: "/assets/generated/gallery-stickers.dim_600x400.jpg",
  },
  {
    id: "s5",
    title: "T-Shirt Printing (DTF)",
    image: "/assets/generated/gallery-tshirts.dim_600x400.jpg",
  },
  {
    id: "s6",
    title: "Custom Packaging",
    image: "/assets/generated/gallery-packaging.dim_600x400.jpg",
  },
  {
    id: "s7",
    title: "Print Studio",
    image: "/assets/generated/gallery-print-shop.dim_600x400.jpg",
  },
];

export default function GallerySection() {
  const { data: backendItems = [], isLoading } = useGetAllGalleryItems();
  const { data: isAdmin } = useIsCallerAdmin();
  const [lightbox, setLightbox] = useState<{
    src: string;
    title: string;
  } | null>(null);

  const galleryItems = [
    ...STATIC_GALLERY.map((s) => ({
      id: s.id,
      title: s.title,
      imageUrl: s.image,
    })),
    ...backendItems.map((b) => ({
      id: b.id,
      title: b.title,
      imageUrl: b.image.getDirectURL(),
    })),
  ];

  return (
    <section id="gallery" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="section-title">OUR WORK</h2>
          <div className="flex justify-center mb-4">
            <span className="inline-block w-16 h-1 bg-brand-red rounded-full" />
          </div>
          <p className="section-subtitle max-w-xl mx-auto">
            A showcase of our finest printing work. Quality and precision in
            every project.
          </p>
          {isAdmin && (
            <a
              href="/admin"
              data-ocid="gallery.manage.button"
              className="inline-flex items-center gap-1.5 mt-2 text-sm text-brand-red font-semibold hover:underline"
            >
              <Settings size={14} /> Manage Gallery
            </a>
          )}
        </motion.div>

        {isLoading ? (
          <div
            className="flex justify-center py-16"
            data-ocid="gallery.loading_state"
          >
            <Loader2 className="animate-spin text-brand-red" size={32} />
          </div>
        ) : galleryItems.length === 0 ? (
          <div
            className="text-center py-16 text-gray-400"
            data-ocid="gallery.empty_state"
          >
            Gallery coming soon — check back shortly!
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryItems.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                data-ocid={`gallery.item.${idx + 1}`}
                className="relative bg-gray-100 rounded-xl overflow-hidden cursor-pointer group shadow-card hover:shadow-lg transition-shadow aspect-[3/2]"
                onClick={() =>
                  setLightbox({ src: item.imageUrl, title: item.title })
                }
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end">
                  <p className="translate-y-full group-hover:translate-y-0 transition-transform duration-300 w-full bg-gradient-to-t from-black/70 to-transparent text-white text-sm font-medium px-3 py-3">
                    {item.title}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
            data-ocid="gallery.lightbox.modal"
          >
            <button
              type="button"
              className="absolute top-4 right-4 text-white hover:text-gray-300"
              onClick={() => setLightbox(null)}
              data-ocid="gallery.lightbox.close_button"
            >
              <X size={28} />
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={lightbox.src}
              alt={lightbox.title}
              className="max-w-full max-h-[85vh] rounded-xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
