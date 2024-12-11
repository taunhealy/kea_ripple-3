"use client";

import { useState } from "react";
import Link from "next/link";

export function UploadDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Upload
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
          <Link
            href="/dashboard/presets/p"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Upload Preset
          </Link>
        </div>
      )}
    </div>
  );
}
