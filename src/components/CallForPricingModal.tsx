"use client";

import { Phone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CallForPricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  productTitle?: string;
}

export default function CallForPricingModal({
  isOpen,
  onClose,
  productTitle,
}: CallForPricingModalProps) {
  const phoneNumber = "423-310-9981";
  const telLink = `tel:${phoneNumber}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Phone className="h-5 w-5 text-primary" />
            Call for Pricing
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            {productTitle && (
              <span className="block font-medium text-foreground mb-3">
                {productTitle}
              </span>
            )}
            For pricing information on this item, please contact us at:
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          <a
            href={telLink}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-lg font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Phone className="h-5 w-5" />
            {phoneNumber}
          </a>

          <p className="text-sm text-muted-foreground text-center">
            Our team will be happy to provide you with detailed pricing and product information.
          </p>
        </div>

        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="rounded-md border px-6 py-2 text-sm font-medium hover:bg-accent"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
