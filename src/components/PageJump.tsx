"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface PageJumpProps {
  currentPage: number;
  totalPages: number;
}

export default function PageJump({ currentPage, totalPages }: PageJumpProps) {
  const [pageValue, setPageValue] = useState(currentPage.toString());
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleJump = () => {
    const val = parseInt(pageValue);
    if (val >= 1 && val <= totalPages) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", val.toString());
      router.push(`/shop?${params.toString()}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleJump();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="page-jump" className="text-sm font-medium">
        Jump to page:
      </label>
      <input
        id="page-jump"
        type="number"
        min="1"
        max={totalPages}
        value={pageValue}
        onChange={(e) => setPageValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-20 rounded-md border bg-background px-3 py-2 text-sm"
      />
      <button
        onClick={handleJump}
        className="rounded-md border bg-card px-4 py-2 text-sm font-medium hover:bg-accent"
      >
        Go
      </button>
    </div>
  );
}
