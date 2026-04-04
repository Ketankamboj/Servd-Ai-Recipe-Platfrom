"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PricingSection from "./PricingSection";

export default function PricingModal({ subscriptionTier = "free", children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Only render Dialog on client to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Only allow opening if user is on free plan
  const canOpen = subscriptionTier === "free";

  // Show children without Dialog wrapper during SSR
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <Dialog open={isOpen} onOpenChange={canOpen ? setIsOpen : undefined}>
      <DialogTrigger asChild disabled={!canOpen}>
        {children}
      </DialogTrigger>

      <DialogContent className="p-8 pt-4 sm:max-w-4xl">
        <DialogTitle />
        <div>
          <PricingSection
            subscriptionTier={subscriptionTier}
            isModal={true}
            onClose={() => setIsOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
