import { useEffect, useState } from "react";

export default function ImageLightbox({ src, alt = "", className = "" }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="cursor-zoom-in rounded-full focus:outline-none focus:ring-2 focus:ring-[#0093d1]"
        onClick={() => setOpen(true)}
        aria-label={`Zoom ${alt || "image"}`}
      >
        <img src={src} alt={alt} className={className} />
      </button>
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={alt || "Image preview"}
          onClick={() => setOpen(false)}
        >
          <img
            src={src}
            alt={alt}
            className="max-h-[90vh] max-w-[95vw] object-contain"
            onClick={(event) => event.stopPropagation()}
          />
          <button
            type="button"
            className="absolute right-5 top-5 rounded-full bg-white/90 px-3 py-2 text-xl text-gray-800"
            onClick={() => setOpen(false)}
            aria-label="Close image preview"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
