"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

// A persistent mobile-only CTA bar that appears once the actual
// registration form scrolls out of view, so signing up stays one tap away
// without scrolling back up. Hidden again once the real form is back in the
// viewport.
export function MobileStickyReserve({ targetId, label }: { targetId: string; label: string }) {
  const [isFormVisible, setIsFormVisible] = useState(true);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => setIsFormVisible(entry.isIntersecting));
    observer.observe(target);
    return () => observer.disconnect();
  }, [targetId]);

  const handleClick = () => {
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  if (isFormVisible) return null;

  return (
    // The Google Maps iframe on this page can otherwise intercept taps meant
    // for this fixed bar (a known browser quirk where iframes can "win" over
    // same-position fixed elements) — forcing this onto its own compositor
    // layer via transform keeps it reliably on top and tappable.
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-divider bg-white p-4 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] sm:hidden"
      style={{ transform: "translateZ(0)" }}
    >
      <Button
        type="button"
        variant="secondary"
        className="w-full justify-center"
        onClick={handleClick}
      >
        {label}
      </Button>
    </div>
  );
}
