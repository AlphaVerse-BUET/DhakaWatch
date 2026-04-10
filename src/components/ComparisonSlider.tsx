"use client";

/**
 * NodiWatch Image Comparison Slider
 * ===================================
 * Interactive before/after slider for visualizing environmental changes.
 * Uses react-compare-slider for smooth dragging experience.
 */

import {
  ReactCompareSlider,
  ReactCompareSliderImage,
  ReactCompareSliderHandle,
} from "react-compare-slider";
import { ArrowLeftRight, Calendar } from "lucide-react";

interface ComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  beforeYear?: string;
  afterYear?: string;
  title?: string;
  description?: string;
  className?: string;
  aspectRatio?: "video" | "square" | "portrait";
}

export default function ComparisonSlider({
  beforeImage,
  afterImage,
  beforeLabel = "Before",
  afterLabel = "After",
  beforeYear = "2016",
  afterYear = "2026",
  title,
  description,
  className = "",
  aspectRatio = "video",
}: ComparisonSliderProps) {
  const aspectRatioClasses = {
    video: "aspect-video",
    square: "aspect-square",
    portrait: "aspect-[3/4]",
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      {(title || description) && (
        <div className="space-y-2">
          {title && (
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <ArrowLeftRight className="w-5 h-5 text-teal-400" />
              {title}
            </h3>
          )}
          {description && (
            <p className="text-slate-400 text-sm">{description}</p>
          )}
        </div>
      )}

      {/* Slider Container */}
      <div
        className={`relative rounded-2xl overflow-hidden border border-slate-700/50 shadow-xl ${aspectRatioClasses[aspectRatio]}`}
      >
        <ReactCompareSlider
          itemOne={
            <ReactCompareSliderImage
              src={beforeImage}
              alt={beforeLabel}
              style={{ objectFit: "cover" }}
            />
          }
          itemTwo={
            <ReactCompareSliderImage
              src={afterImage}
              alt={afterLabel}
              style={{ objectFit: "cover" }}
            />
          }
          handle={
            <ReactCompareSliderHandle
              buttonStyle={{
                backdropFilter: "blur(8px)",
                backgroundColor: "rgba(6, 214, 160, 0.9)",
                border: "3px solid white",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                width: 48,
                height: 48,
              }}
              linesStyle={{
                width: 3,
                background:
                  "linear-gradient(to bottom, rgba(6, 214, 160, 0.8), rgba(17, 138, 178, 0.8))",
              }}
            />
          }
          position={50}
          style={{ width: "100%", height: "100%" }}
        />

        {/* Year Labels */}
        <div className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 backdrop-blur-sm border border-slate-700/50">
          <Calendar className="w-4 h-4 text-teal-400" />
          <span className="text-white font-bold">{beforeYear}</span>
        </div>

        <div className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 backdrop-blur-sm border border-slate-700/50">
          <Calendar className="w-4 h-4 text-orange-400" />
          <span className="text-white font-bold">{afterYear}</span>
        </div>

        {/* Side Labels */}
        <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg bg-teal-600/90 backdrop-blur-sm text-white text-sm font-medium">
          {beforeLabel}
        </div>

        <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg bg-orange-600/90 backdrop-blur-sm text-white text-sm font-medium">
          {afterLabel}
        </div>

        {/* Drag Hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 backdrop-blur-sm text-slate-400 text-xs">
          <ArrowLeftRight className="w-4 h-4" />
          <span>Drag to compare</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Side-by-side comparison (non-interactive alternative)
 */
export function SideBySideComparison({
  beforeImage,
  afterImage,
  beforeLabel = "Before",
  afterLabel = "After",
  beforeYear = "2016",
  afterYear = "2026",
  title,
  description,
  className = "",
}: ComparisonSliderProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      {(title || description) && (
        <div className="space-y-2">
          {title && <h3 className="text-xl font-bold text-white">{title}</h3>}
          {description && (
            <p className="text-slate-400 text-sm">{description}</p>
          )}
        </div>
      )}

      {/* Side by Side */}
      <div className="grid grid-cols-2 gap-4">
        {/* Before */}
        <div className="relative rounded-xl overflow-hidden border border-slate-700/50">
          <img
            src={beforeImage}
            alt={beforeLabel}
            className="w-full aspect-square object-cover"
          />
          <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-600/90 backdrop-blur-sm">
            <Calendar className="w-4 h-4 text-white" />
            <span className="text-white font-bold text-sm">{beforeYear}</span>
          </div>
          <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-slate-900/80 text-white text-sm">
            {beforeLabel}
          </div>
        </div>

        {/* After */}
        <div className="relative rounded-xl overflow-hidden border border-slate-700/50">
          <img
            src={afterImage}
            alt={afterLabel}
            className="w-full aspect-square object-cover"
          />
          <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-600/90 backdrop-blur-sm">
            <Calendar className="w-4 h-4 text-white" />
            <span className="text-white font-bold text-sm">{afterYear}</span>
          </div>
          <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-slate-900/80 text-white text-sm">
            {afterLabel}
          </div>
        </div>
      </div>
    </div>
  );
}
