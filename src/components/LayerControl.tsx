"use client";

import { useState } from "react";
import { Factory, LandPlot, Mountain, Layers } from "lucide-react";

export type LayerType = "all" | "pollution" | "encroachment" | "erosion";

interface LayerControlProps {
  activeLayer: LayerType;
  onLayerChange: (layer: LayerType) => void;
}

const layers = [
  { id: "all" as LayerType, label: "All Layers", icon: Layers, color: "teal" },
  {
    id: "pollution" as LayerType,
    label: "Pollution",
    icon: Factory,
    color: "red",
  },
  {
    id: "encroachment" as LayerType,
    label: "Encroachment",
    icon: LandPlot,
    color: "yellow",
  },
  {
    id: "erosion" as LayerType,
    label: "Erosion",
    icon: Mountain,
    color: "blue",
  },
];

export default function LayerControl({
  activeLayer,
  onLayerChange,
}: LayerControlProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {layers.map((layer) => {
        const Icon = layer.icon;
        const isActive = activeLayer === layer.id;

        return (
          <button
            key={layer.id}
            onClick={() => onLayerChange(layer.id)}
            className={`layer-toggle flex items-center gap-2 ${
              isActive
                ? `active-${layer.color === "teal" ? "" : layer.color}`
                : ""
            } ${isActive && layer.color === "teal" ? "active" : ""}`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                layer.color === "teal"
                  ? "bg-teal"
                  : layer.color === "red"
                    ? "bg-red"
                    : layer.color === "yellow"
                      ? "bg-yellow"
                      : "bg-blue"
              }`}
            />
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{layer.label}</span>
          </button>
        );
      })}
    </div>
  );
}
