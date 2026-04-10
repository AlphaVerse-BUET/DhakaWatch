"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, Droplets, Activity } from "lucide-react";
import { riverTrends, RiverTrendData } from "@/data/trends";

interface TrendChartProps {
  className?: string;
  metric?: "pollution" | "encroachment" | "erosion" | "water_quality";
}

const metricConfigs = {
  pollution: {
    key: "pollution_index",
    label: "Pollution Index",
    color: "#ef476f",
    gradient: ["#ef476f", "#ff8c00"],
    icon: Droplets,
    unit: "",
    higher_is_worse: true,
  },
  encroachment: {
    key: "encroachment_area_km2",
    label: "Encroachment Area",
    color: "#7b2ff7",
    gradient: ["#7b2ff7", "#a855f7"],
    icon: TrendingUp,
    unit: " km²",
    higher_is_worse: true,
  },
  erosion: {
    key: "erosion_rate_m_year",
    label: "Erosion Rate",
    color: "#ff8c00",
    gradient: ["#ff8c00", "#ffd166"],
    icon: TrendingDown,
    unit: " m/yr",
    higher_is_worse: true,
  },
  water_quality: {
    key: "water_quality_index",
    label: "Water Quality Index",
    color: "#06d6a0",
    gradient: ["#118ab2", "#06d6a0"],
    icon: Activity,
    unit: "",
    higher_is_worse: false,
  },
};

const CustomTooltip = ({ active, payload, label, metric }: any) => {
  if (!active || !payload?.length) return null;

  const config = metricConfigs[metric as keyof typeof metricConfigs];

  return (
    <div className="glass-card p-3 border border-white/10">
      <p className="text-white font-medium mb-2">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 text-sm">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-300">{entry.name}:</span>
          <span className="text-white font-medium">
            {entry.value}
            {config?.unit || ""}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function TrendChart({
  className = "",
  metric = "pollution",
}: TrendChartProps) {
  const [selectedRivers, setSelectedRivers] = useState<string[]>([
    "Buriganga",
    "Turag",
    "Balu",
  ]);
  const [chartType, setChartType] = useState<"line" | "area" | "bar">("area");

  const config = metricConfigs[metric];
  const Icon = config.icon;

  // Prepare data for chart
  const chartData = riverTrends[0].yearlyData.map((_, index) => {
    const point: any = { year: riverTrends[0].yearlyData[index].year };
    riverTrends.forEach((river) => {
      if (selectedRivers.includes(river.river)) {
        point[river.river] =
          river.yearlyData[index][
            config.key as keyof (typeof river.yearlyData)[0]
          ];
      }
    });
    return point;
  });

  const riverColors: Record<string, string> = {
    Buriganga: "#ef476f",
    Turag: "#ffd166",
    Balu: "#7b2ff7",
    Shitalakshya: "#118ab2",
    Dhaleshwari: "#06d6a0",
  };

  const toggleRiver = (river: string) => {
    setSelectedRivers((prev) =>
      prev.includes(river) ? prev.filter((r) => r !== river) : [...prev, river],
    );
  };

  return (
    <div className={`glass-card p-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${config.color}20` }}
          >
            <Icon size={20} style={{ color: config.color }} />
          </div>
          <div>
            <h3 className="font-semibold text-white">{config.label}</h3>
            <p className="text-sm text-gray-400">
              10-Year Trend Analysis (2016-2025)
            </p>
          </div>
        </div>

        {/* Chart Type Toggle */}
        <div className="flex gap-1 bg-slate-800/50 rounded-lg p-1">
          {(["line", "area", "bar"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setChartType(type)}
              className={`px-3 py-1.5 rounded text-sm capitalize transition-colors ${
                chartType === type
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* River Selection */}
      <div className="flex flex-wrap gap-2 mb-6">
        {riverTrends.map((river) => (
          <button
            key={river.river}
            onClick={() => toggleRiver(river.river)}
            className={`px-3 py-1.5 rounded-full text-sm transition-all ${
              selectedRivers.includes(river.river)
                ? "text-white"
                : "bg-slate-700/50 text-gray-400 hover:text-white"
            }`}
            style={{
              backgroundColor: selectedRivers.includes(river.river)
                ? `${riverColors[river.river]}30`
                : undefined,
              borderColor: selectedRivers.includes(river.river)
                ? riverColors[river.river]
                : "transparent",
              borderWidth: "1px",
              borderStyle: "solid",
            }}
          >
            <span
              className="inline-block w-2 h-2 rounded-full mr-2"
              style={{ backgroundColor: riverColors[river.river] }}
            />
            {river.river}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "line" ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="year"
                stroke="#94a3b8"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />
              <YAxis
                stroke="#94a3b8"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip metric={metric} />} />
              <Legend />
              {selectedRivers.map((river) => (
                <Line
                  key={river}
                  type="monotone"
                  dataKey={river}
                  stroke={riverColors[river]}
                  strokeWidth={2}
                  dot={{ fill: riverColors[river], strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              ))}
            </LineChart>
          ) : chartType === "area" ? (
            <AreaChart data={chartData}>
              <defs>
                {selectedRivers.map((river) => (
                  <linearGradient
                    key={river}
                    id={`gradient-${river}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={riverColors[river]}
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor={riverColors[river]}
                      stopOpacity={0}
                    />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="year"
                stroke="#94a3b8"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />
              <YAxis
                stroke="#94a3b8"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip metric={metric} />} />
              <Legend />
              {selectedRivers.map((river) => (
                <Area
                  key={river}
                  type="monotone"
                  dataKey={river}
                  stroke={riverColors[river]}
                  strokeWidth={2}
                  fill={`url(#gradient-${river})`}
                />
              ))}
            </AreaChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="year"
                stroke="#94a3b8"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />
              <YAxis
                stroke="#94a3b8"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip metric={metric} />} />
              <Legend />
              {selectedRivers.map((river) => (
                <Bar
                  key={river}
                  dataKey={river}
                  fill={riverColors[river]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4">
        {selectedRivers.slice(0, 4).map((river) => {
          const riverData = riverTrends.find((r) => r.river === river);
          if (!riverData) return null;

          const firstVal = riverData.yearlyData[0][
            config.key as keyof (typeof riverData.yearlyData)[0]
          ] as number;
          const lastVal = riverData.yearlyData[riverData.yearlyData.length - 1][
            config.key as keyof (typeof riverData.yearlyData)[0]
          ] as number;
          const change = (((lastVal - firstVal) / firstVal) * 100).toFixed(1);
          const isWorse = config.higher_is_worse
            ? Number(change) > 0
            : Number(change) < 0;

          return (
            <div key={river} className="text-center">
              <div className="text-xs text-gray-400 mb-1">{river}</div>
              <div
                className="text-lg font-bold"
                style={{ color: riverColors[river] }}
              >
                {lastVal}
                {config.unit}
              </div>
              <div
                className={`text-xs ${isWorse ? "text-red-400" : "text-green-400"}`}
              >
                {isWorse ? "↑" : "↓"} {Math.abs(Number(change))}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
