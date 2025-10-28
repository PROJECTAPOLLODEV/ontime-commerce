"use client";

import { useState } from "react";

interface ProductImageGalleryProps {
  images: string[];
  title: string;
}

export default function ProductImageGallery({ images, title }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="group relative aspect-square overflow-hidden rounded-xl border-2 bg-muted">
        <img
          src={images[selectedImage]}
          alt={`${title} - Image ${selectedImage + 1}`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {images.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={() => setSelectedImage((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-background/90 shadow-lg transition-colors hover:bg-background"
              aria-label="Previous image"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setSelectedImage((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-background/90 shadow-lg transition-colors hover:bg-background"
              aria-label="Next image"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === selectedImage
                    ? "w-8 bg-primary"
                    : "w-2 bg-background/60 hover:bg-background/80"
                }`}
                aria-label={`View image ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail Grid */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.slice(0, 4).map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(idx)}
              className={`group relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                idx === selectedImage
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-transparent hover:border-muted-foreground/30"
              }`}
            >
              <img
                src={img}
                alt={`${title} - Thumbnail ${idx + 1}`}
                className="h-full w-full object-cover transition-transform group-hover:scale-110"
              />
              {idx === 3 && images.length > 4 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm font-semibold text-white">
                  +{images.length - 4}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
