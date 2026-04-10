"use client";

/**
 * NodiWatch Evidence Upload Component
 * =====================================
 * Drag-and-drop file upload with AI-powered image analysis.
 * Captures GPS coordinates and report metadata.
 */

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  Camera,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  X,
  Image as ImageIcon,
  Sparkles,
  FileText,
  Navigation,
} from "lucide-react";

interface AnalysisResult {
  analysis: string;
  severity: "low" | "medium" | "high" | "critical";
  confidence: number;
  detectedIssues: string[];
  recommendations: string[];
}

interface EvidenceUploadProps {
  onSubmit?: (data: {
    image: File;
    reportType: string;
    location: { lat: number; lng: number } | null;
    description: string;
    analysis: AnalysisResult | null;
  }) => void;
  className?: string;
}

export default function EvidenceUpload({
  onSubmit,
  className = "",
}: EvidenceUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [reportType, setReportType] = useState<
    "pollution" | "encroachment" | "erosion"
  >("pollution");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setAnalysis(null);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp", ".gif"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true,
  });

  const getLocation = async () => {
    setIsGettingLocation(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsGettingLocation(false);
      },
      (err) => {
        setError(`Location error: ${err.message}`);
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const analyzeImage = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("reportType", reportType);

      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setAnalysis(data.data);
      } else {
        throw new Error(data.error || "Analysis failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze image");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = () => {
    if (!file) return;

    onSubmit?.({
      image: file,
      reportType,
      location,
      description,
      analysis,
    });
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setAnalysis(null);
    setError(null);
  };

  const severityColors = {
    low: "text-green-400 bg-green-500/10 border-green-500/30",
    medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
    high: "text-orange-400 bg-orange-500/10 border-orange-500/30",
    critical: "text-red-400 bg-red-500/10 border-red-500/30",
  };

  const reportTypes = [
    {
      value: "pollution",
      label: "নদী দূষণ (Pollution)",
      icon: "🏭",
      color: "text-red-400",
    },
    {
      value: "encroachment",
      label: "নদী দখল (Encroachment)",
      icon: "🏗️",
      color: "text-yellow-400",
    },
    {
      value: "erosion",
      label: "নদী ভাঙন (Erosion)",
      icon: "🌊",
      color: "text-orange-400",
    },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Report Type Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">
          Report Type
        </label>
        <div className="grid grid-cols-3 gap-3">
          {reportTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setReportType(type.value as typeof reportType)}
              className={`p-4 rounded-xl border-2 transition-all text-center ${
                reportType === type.value
                  ? "border-teal-500 bg-teal-500/10"
                  : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
              }`}
            >
              <span className="text-2xl block mb-1">{type.icon}</span>
              <span
                className={`text-xs font-semibold block leading-snug ${reportType === type.value ? "text-teal-400" : "text-slate-300"}`}
              >
                {type.label.split(" (")[0]}
              </span>
              <span className="text-[10px] text-slate-500 capitalize block mt-0.5">
                {type.value}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Drop Zone */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">
          Evidence Image
        </label>

        {!file ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isDragActive
                ? "border-teal-500 bg-teal-500/10"
                : "border-slate-700 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/50"
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center">
                {isDragActive ? (
                  <Upload className="w-8 h-8 text-teal-400 animate-bounce" />
                ) : (
                  <Camera className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <div>
                <p className="text-slate-200 font-medium">
                  {isDragActive
                    ? "Drop image here"
                    : "Drag & drop or click to upload"}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  JPEG, PNG, WebP • Max 10MB
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative rounded-xl overflow-hidden bg-slate-800">
            <img
              src={preview!}
              alt="Preview"
              className="w-full h-64 object-cover"
            />
            <button
              onClick={clearFile}
              className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/80 hover:bg-slate-900 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <div className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 text-sm text-slate-300">
              <ImageIcon className="w-4 h-4" />
              {file.name}
            </div>
          </div>
        )}
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">
          Location
        </label>
        <div className="flex gap-3">
          <button
            onClick={getLocation}
            disabled={isGettingLocation}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all ${
              location
                ? "border-teal-500/50 bg-teal-500/10 text-teal-400"
                : "border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600"
            }`}
          >
            {isGettingLocation ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : location ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <Navigation className="w-5 h-5" />
            )}
            {location ? (
              <span className="text-sm">
                {location.lat.toFixed(4)}°N, {location.lng.toFixed(4)}°E
              </span>
            ) : (
              <span>Get Current Location</span>
            )}
          </button>
          <button className="px-4 py-3 rounded-xl border border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600 transition-all">
            <MapPin className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">
          Description (Optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what you observed..."
          rows={3}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 resize-none"
        />
      </div>

      {/* AI Analysis Button */}
      {file && !analysis && (
        <button
          onClick={analyzeImage}
          disabled={isAnalyzing}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing with Gemini AI...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Analyze with AI</span>
            </>
          )}
        </button>
      )}

      {/* Error Display */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center gap-2 text-teal-400">
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">AI Analysis Complete</span>
          </div>

          {/* Severity Badge */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${severityColors[analysis.severity]}`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium capitalize">
              {analysis.severity} Severity
            </span>
            <span className="text-sm opacity-70">
              ({Math.round(analysis.confidence * 100)}% confidence)
            </span>
          </div>

          {/* Analysis Text */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <h4 className="text-sm font-medium text-slate-300 mb-2">
              Analysis
            </h4>
            <p className="text-slate-200 text-sm leading-relaxed">
              {analysis.analysis}
            </p>
          </div>

          {/* Detected Issues */}
          {analysis.detectedIssues.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
              <h4 className="text-sm font-medium text-slate-300 mb-3">
                Detected Issues
              </h4>
              <ul className="space-y-2">
                {analysis.detectedIssues.map((issue, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-slate-200"
                  >
                    <span className="text-red-400 mt-1">•</span>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {analysis.recommendations.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
              <h4 className="text-sm font-medium text-slate-300 mb-3">
                Recommendations
              </h4>
              <ul className="space-y-2">
                {analysis.recommendations.map((rec, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-slate-200"
                  >
                    <span className="text-teal-400 mt-1">→</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Submit Button */}
      {file && analysis && (
        <button
          onClick={handleSubmit}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 text-white font-semibold hover:from-teal-500 hover:to-blue-500 transition-all"
        >
          <FileText className="w-5 h-5" />
          <span>Submit Evidence Report</span>
        </button>
      )}
    </div>
  );
}
