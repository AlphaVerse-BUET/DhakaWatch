"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Factory, AlertTriangle } from "lucide-react";
import factoriesData from "@/data/factories.json";

interface FactoryAttributionChartProps {
  className?: string;
  hotspotId?: string;
}

const COLORS: Record<string, string> = {
  textile: "#7b2ff7",
  tannery: "#ef476f",
  industrial: "#ffd166",
  garment: "#06d6a0",
  chemical: "#ff6b6b",
  food: "#4ecdc4",
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;

  return (
    <div className="glass-card p-3 border border-white/10">
      <p className="text-white font-medium">{data.name}</p>
      <p className="text-sm text-gray-400">Type: {data.type}</p>
      <p className="text-sm text-gray-400">
        Attribution:{" "}
        <span className="text-white font-bold">{data.attribution}%</span>
      </p>
      <p className="text-sm text-gray-400">Violations: {data.violations}</p>
    </div>
  );
};

export default function FactoryAttributionChart({
  className = "",
  hotspotId,
}: FactoryAttributionChartProps) {
  // Get factories for the hotspot, or top polluters if no hotspot selected
  const factories = hotspotId
    ? factoriesData.factories.filter((f) => f.hotspot === hotspotId)
    : factoriesData.factories.filter((f) => f.attribution > 60).slice(0, 6);

  const pieData = factories.map((f) => ({
    name: f.name,
    value: f.attribution,
    type: f.type,
    violations: f.violations,
    attribution: f.attribution,
    status: f.status,
  }));

  // Stats summary
  const totalViolations = factories.reduce((sum, f) => sum + f.violations, 0);
  const flaggedCount = factories.filter((f) => f.status === "flagged").length;

  return (
    <div className={`glass-card p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-purple-500/20">
          <Factory size={20} className="text-purple-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Factory Attribution</h3>
          <p className="text-sm text-gray-400">
            {hotspotId
              ? `Sources for ${hotspotId}`
              : "Top Pollution Contributors"}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Pie Chart */}
        <div className="h-[200px] flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      COLORS[entry.type as keyof typeof COLORS] || "#118ab2"
                    }
                    stroke="rgba(0,0,0,0.3)"
                    strokeWidth={1}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Factory List */}
        <div className="flex-1 space-y-2">
          {factories.map((factory, index) => (
            <div
              key={factory.id}
              className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: COLORS[factory.type as keyof typeof COLORS],
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white truncate">
                  {factory.name}
                </div>
                <div className="text-xs text-gray-400">{factory.type}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-white">
                  {factory.attribution}%
                </div>
                {factory.status === "flagged" && (
                  <AlertTriangle size={12} className="text-red-400 ml-auto" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-white">
            {factories.length}
          </div>
          <div className="text-xs text-gray-400">Factories</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-red-400">
            {totalViolations}
          </div>
          <div className="text-xs text-gray-400">Violations</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-yellow-400">
            {flaggedCount}
          </div>
          <div className="text-xs text-gray-400">Flagged</div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center">
        {Object.entries(COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2 text-xs">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-gray-300 capitalize">{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
