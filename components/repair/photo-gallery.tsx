"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { RepairPhoto } from "@/lib/db/schema";
import type { PhotoType } from "@/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PhotoGalleryProps {
  photos: RepairPhoto[];
}

const TAB_CONFIG: { value: PhotoType; label: string }[] = [
  { value: "before", label: "Before" },
  { value: "during", label: "During" },
  { value: "after", label: "After" },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-12 text-center">
      <ImageIcon className="text-muted-foreground size-10" />
      <p className="text-muted-foreground text-sm">
        No {label.toLowerCase()} photos yet
      </p>
    </div>
  );
}

function PhotoGrid({
  photos,
  onPhotoClick,
}: {
  photos: RepairPhoto[];
  onPhotoClick: (index: number) => void;
}) {
  if (photos.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {photos.map((photo, idx) => (
        <button
          key={photo.id}
          type="button"
          className={cn(
            "group relative aspect-square overflow-hidden rounded-lg border transition-shadow",
            "hover:ring-2 hover:ring-primary hover:ring-offset-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none",
          )}
          onClick={() => onPhotoClick(idx)}
        >
          <Image
            src={photo.url}
            alt={photo.originalFilename}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
          />
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxTab, setLightboxTab] = useState<PhotoType>("before");
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Group photos by type
  const grouped: Record<PhotoType, RepairPhoto[]> = {
    before: [],
    during: [],
    after: [],
  };

  for (const photo of photos) {
    grouped[photo.photoType].push(photo);
  }

  const openLightbox = (tab: PhotoType, index: number) => {
    setLightboxTab(tab);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const currentPhotos = grouped[lightboxTab];
  const currentPhoto = currentPhotos[lightboxIndex];

  const goNext = () => {
    if (lightboxIndex < currentPhotos.length - 1) {
      setLightboxIndex((i) => i + 1);
    }
  };

  const goPrev = () => {
    if (lightboxIndex > 0) {
      setLightboxIndex((i) => i - 1);
    }
  };

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-16 text-center">
        <ImageIcon className="text-muted-foreground size-12" />
        <p className="text-muted-foreground text-sm">No photos uploaded yet</p>
      </div>
    );
  }

  return (
    <>
      <Tabs defaultValue="before">
        <TabsList>
          {TAB_CONFIG.map(({ value, label }) => (
            <TabsTrigger key={value} value={value}>
              {label}
              {grouped[value].length > 0 && (
                <span className="text-muted-foreground ml-1 text-xs">
                  ({grouped[value].length})
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {TAB_CONFIG.map(({ value, label }) => (
          <TabsContent key={value} value={value}>
            {grouped[value].length === 0 ? (
              <EmptyState label={label} />
            ) : (
              <PhotoGrid
                photos={grouped[value]}
                onPhotoClick={(idx) => openLightbox(value, idx)}
              />
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Lightbox modal */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>
              {lightboxTab.charAt(0).toUpperCase() + lightboxTab.slice(1)} Photo
              {currentPhotos.length > 1 && (
                <span className="text-muted-foreground ml-2 text-sm font-normal">
                  {lightboxIndex + 1} of {currentPhotos.length}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          {currentPhoto && (
            <div className="relative flex items-center justify-center bg-black/5 dark:bg-black/20">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={currentPhoto.url}
                  alt={currentPhoto.originalFilename}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 768px"
                  priority
                />
              </div>

              {/* Navigation arrows */}
              {currentPhotos.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background"
                    onClick={goPrev}
                    disabled={lightboxIndex === 0}
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="size-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background"
                    onClick={goNext}
                    disabled={lightboxIndex === currentPhotos.length - 1}
                    aria-label="Next photo"
                  >
                    <ChevronRight className="size-5" />
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Photo details */}
          {currentPhoto && (
            <div className="text-muted-foreground px-6 pb-4 text-xs">
              {currentPhoto.originalFilename}
              {currentPhoto.sizeBytes > 0 && (
                <> · {(currentPhoto.sizeBytes / (1024 * 1024)).toFixed(1)} MB</>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
