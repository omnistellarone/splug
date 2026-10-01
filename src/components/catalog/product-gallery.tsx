"use client";

import * as React from "react";
import type { ProductImage } from "@/lib/types/database";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: ProductImage[];
  primaryImage?: string;
  productName: string;
}

export function ProductGallery({
  images,
  primaryImage,
  productName,
}: ProductGalleryProps) {
  const allImages = images.length > 0
    ? images.map((img) => img.storage_path)
    : primaryImage
    ? [primaryImage]
    : [];

  const [activeIndex, setActiveIndex] = React.useState(0);
  const activeImageUrl = allImages[activeIndex] || primaryImage;

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4 lg:gap-6">
      {/* Thumbnails (vertical on desktop, horizontal on mobile) */}
      {allImages.length > 1 && (
        <div className="flex lg:flex-col gap-2.5 overflow-x-auto lg:overflow-y-auto max-h-[500px] scrollbar-none">
          {allImages.map((imgUrl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={cn(
                "relative h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden bg-[var(--surface-subtle)] border p-1 transition-all shrink-0 cursor-pointer",
                activeIndex === idx
                  ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/20 shadow-sm"
                  : "border-[var(--border)] opacity-70 hover:opacity-100 hover:border-[var(--border-strong)]"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgUrl}
                alt={`${productName} thumbnail ${idx + 1}`}
                className="h-full w-full object-contain mix-blend-multiply dark:mix-blend-normal"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Large Image */}
      <div className="relative flex-1 aspect-square sm:aspect-[4/3] lg:aspect-square rounded-3xl bg-[var(--surface-subtle)] border border-[var(--border)] p-6 sm:p-10 flex items-center justify-center overflow-hidden liquid-glass">
        {activeImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={activeImageUrl}
            alt={productName}
            className="max-h-full max-w-full object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="text-[var(--text-muted)] text-sm">No image preview</div>
        )}

        {/* Counter Badge */}
        {allImages.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wider">
            {activeIndex + 1} / {allImages.length}
          </div>
        )}
      </div>
    </div>
  );
}
