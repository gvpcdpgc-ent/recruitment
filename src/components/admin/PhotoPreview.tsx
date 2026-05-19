'use client';

import { useState } from 'react';

export function PhotoPreview({ src, name }: { src: string; name: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} title="Click to preview">
        <img
          src={src}
          alt={name}
          className="w-10 h-12 object-cover rounded border shadow-sm hover:scale-110 transition-transform cursor-zoom-in"
        />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center"
          onClick={() => setOpen(false)}
        >
          <div className="relative max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
            <img src={src} alt={name} className="w-full rounded-xl shadow-2xl border" />
            <p className="text-center text-white mt-3 font-semibold text-sm">{name}</p>
            <button
              onClick={() => setOpen(false)}
              className="absolute top-2 right-2 bg-white/20 hover:bg-white/40 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs"
            >✕</button>
          </div>
        </div>
      )}
    </>
  );
}
