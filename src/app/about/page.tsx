"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Users,
  Target,
  Lightbulb,
  Shield,
  ExternalLink,
  Github,
  Linkedin,
  Mail,
  Satellite,
  Brain,
  Database,
  Globe,
  Camera,
  CheckCircle2,
  Award,
  Sparkles,
  Layers,
  Cpu,
} from "lucide-react";

const team = [
  {
    name: "Ahmmad Nur Swapnil",
    role: "AI/ML Lead",
    bio: "Engineered spectral index classification and Random Forest models for pollution and encroachment detection. Developed MNDWI/NDTI analysis algorithms and GEE processing pipeline. Built erosion monitoring system using historical satellite data.",
    avatar: "/team/swapnil.jpg",
    github: "https://github.com/an-swapnil",
    linkedin: "https://www.linkedin.com/in/an-swapnil/",
  },
  {
    name: "Tamim Hasan Saad",
    role: "Full-Stack Developer",
    bio: "Built React/Next.js dashboard with near-real-time monitoring. Integrated PostGIS for spatial queries. Developed Green Banking API for carbon credits. Implemented alert system with SMS/email notifications.",
    avatar: "/team/tamim.jpg",
    github: "https://github.com/tamim-hasan-saad",
    linkedin: "https://www.linkedin.com/in/tamim-hasan-saad/",
  },
  {
    name: "Ekramul Haque Amin",
    role: "Backend + Signal Processing Expert",
    bio: "Architected Google Earth Engine workflows for satellite data processing. Developed SAR analysis tools for erosion monitoring. Built backend infrastructure and data pipelines for automated geospatial analysis.",
    avatar: "/team/amin.jpg",
    github: "https://github.com/ekramul-haque-amin",
    linkedin: "https://www.linkedin.com/in/ekramul-haque-amin22/",
  },
  {
    name: "Habiba Rafique",
    role: "AI/ML + Database Expert",
    bio: "Trained machine learning models for threat classification. Optimized PostGIS database for spatial queries. Built data ingestion pipeline for processing satellite imagery and sensor data at scale.",
    avatar: "/team/habiba.jpg",
    github: "https://github.com/habiba-rafique",
    linkedin: "https://www.linkedin.com/in/habiba-rafique/",
  },
  {
    name: "Sonia Khatun",
    role: "Full-Stack Developer",
    bio: "Developed frontend components with React/Next.js for data visualization. Implemented UI/UX features for evidence submission system. Integrated API endpoints for automated alerts and monitoring dashboard.",
    avatar: "/team/sonia.jpg",
    github: "https://github.com/sonia-khatun",
    linkedin: "https://www.linkedin.com/in/most-sonia-khatun-b92717363/",
  },
];

const stakeholders = [
  "Department of Environment (DoE)",
  "Bangladesh Water Development Board (BWDB)",
  "Bangladesh Inland Water Transport Authority (BIWTA)",
  "Environmental Courts",
  "Research Organizations",
  "NGOs & Civil Society",
];

const technologies = [
  {
    name: "Sentinel-2",
    desc: "High-resolution optical imagery",
    icon: Satellite,
  },
  {
    name: "Sentinel-1 SAR",
    desc: "All-weather radar monitoring",
    icon: Satellite,
  },
  {
    name: "Google Earth Engine",
    desc: "Cloud-based analysis platform",
    icon: Globe,
  },
  { name: "TensorFlow", desc: "Machine learning framework", icon: Brain },
  { name: "Gemini AI", desc: "Vision & chat capabilities", icon: Sparkles },
  { name: "Next.js 14", desc: "React framework for the web", icon: Layers },
];

const capabilities = [
  {
    title: "Spectral Fingerprinting",
    description:
      "Identify pollution types from spectral signatures at 10m resolution",
    accuracy: "MNDWI-based",
  },
  {
    title: "Water Segmentation",
    description:
      "MNDWI-based river boundary detection with temporal differencing",
    accuracy: "82-96%",
  },
  {
    title: "Factory Attribution",
    description:
      "Bayesian inference links discharge events to industrial sources",
    accuracy: "78%",
  },
  {
    title: "Erosion Forecasting",
    description:
      "SAR coherence analysis predicts bank stability 72h in advance",
    accuracy: "83%",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen animate-fadeIn">
      {/* Hero */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal/10 via-transparent to-purple-900/20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal/10 border border-teal/30 mb-6">
              <Award size={16} className="text-teal" />
              <span className="text-teal text-sm font-medium">
                Eco-Tech Hackathon 2026 • Team AlphaVerse
              </span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              <span className="gradient-text">About NodiWatch</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              An AI-powered satellite surveillance system for protecting
              Bangladesh&apos;s <span className="text-red-400">1,400+ rivers</span>{" "}
              from pollution, encroachment, and erosion.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <div className="glass-card p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-teal/20">
                <Target size={24} className="text-teal" />
              </div>
              <h2 className="text-2xl font-bold text-white">Our Mission</h2>
            </div>
            <p className="text-gray-300">
              To leverage cutting-edge satellite technology and artificial
              intelligence to create an automated, transparent, and actionable
              monitoring system that empowers authorities to protect
              Bangladesh&apos;s vital river ecosystems.
            </p>
          </div>

          <div className="glass-card p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-purple-500/20">
                <Lightbulb size={24} className="text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Our Vision</h2>
            </div>
            <p className="text-gray-300">
              A future where every river in Bangladesh is continuously
              monitored, violations are detected through automated satellite
              surveillance, and environmental
              accountability is strengthened through satellite-based evidence.
            </p>
          </div>
        </div>

        {/* Problem & Solution */}
        <div className="glass-card p-8 mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">
            The Problem We&apos;re Solving
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-4 bg-red-500/10 rounded-lg">
              <h3 className="text-white font-medium mb-2">
                Industrial Pollution
              </h3>
              <p className="text-sm text-gray-400">
                Untreated industrial effluent from textile and tannery
                industries turns rivers toxic. Published studies report dissolved
                oxygen dropping below 0.5 mg/L — lethal for aquatic life.
              </p>
            </div>
            <div className="p-4 bg-purple-500/10 rounded-lg">
              <h3 className="text-white font-medium mb-2">
                River Encroachment
              </h3>
              <p className="text-sm text-gray-400">
                Illegal land filling has shrunk river widths by up to 60% in
                some areas, displacing communities and increasing flood risk.
              </p>
            </div>
            <div className="p-4 bg-orange-500/10 rounded-lg">
              <h3 className="text-white font-medium mb-2">Bank Erosion</h3>
              <p className="text-sm text-gray-400">
                Riverbank erosion accelerating at 15m/year in critical zones,
                putting thousands of structures and lives at risk.
              </p>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <Users size={24} className="text-teal" />
            <h2 className="text-2xl font-bold text-white">Meet the Team</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {team.map((member) => (
              <div key={member.name} className="glass-card p-6 text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal to-blue mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white">
                  {member.name[0]}
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  {member.name}
                </h3>
                <p className="text-sm text-teal mb-3">{member.role}</p>
                <p className="text-sm text-gray-400 mb-4">{member.bio}</p>
                <div className="flex justify-center gap-3">
                  <a
                    href={member.github}
                    className="p-2 rounded-lg bg-slate-800/50 text-gray-400 hover:text-white transition-colors"
                  >
                    <Github size={18} />
                  </a>
                  <a
                    href={member.linkedin}
                    className="p-2 rounded-lg bg-slate-800/50 text-gray-400 hover:text-white transition-colors"
                  >
                    <Linkedin size={18} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technology Stack */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">
            Technology Stack
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {technologies.map((tech) => (
              <div
                key={tech.name}
                className="glass-card p-4 text-center group hover:border-teal/30 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center mx-auto mb-3">
                  <tech.icon size={20} className="text-teal" />
                </div>
                <div className="text-white font-medium mb-1">{tech.name}</div>
                <div className="text-xs text-gray-400">{tech.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* System Architecture */}
        <div className="glass-card p-8 mb-16">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 mb-4">
              <Cpu size={14} className="text-purple-400" />
              <span className="text-purple-400 text-xs font-medium">
                System Architecture
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              How NodiWatch Works
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              End-to-end pipeline from satellite acquisition to actionable
              intelligence
            </p>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-slate-700/50">
            <img
              src="/assets/architecture_diagram.png"
              alt="NodiWatch System Architecture"
              className="w-full"
            />
          </div>

          <div className="grid md:grid-cols-4 gap-4 mt-8">
            {capabilities.map((cap, idx) => (
              <div key={idx} className="p-4 bg-slate-800/30 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-white text-sm">
                    {cap.title}
                  </h4>
                  <span className="text-teal font-bold">{cap.accuracy}</span>
                </div>
                <p className="text-xs text-gray-400">{cap.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Citizen Ground Truth */}
        <div className="glass-card p-8 mb-16 bg-gradient-to-r from-purple-900/20 to-transparent">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 mb-4">
                <Camera size={14} className="text-purple-400" />
                <span className="text-purple-400 text-xs font-medium">
                  Citizen Science
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Community Ground-Truth
              </h2>
              <p className="text-gray-300 mb-6 leading-relaxed">
                NodiWatch empowers citizens to become environmental monitors.
                Upload photos from your smartphone and our Gemini AI instantly
                analyzes them to validate satellite observations and create
                legally-admissible evidence.
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-gray-300">
                  <CheckCircle2 size={18} className="text-green-400" />
                  <span>AI-powered image analysis in seconds</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <CheckCircle2 size={18} className="text-green-400" />
                  <span>GPS-tagged evidence with timestamp verification</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <CheckCircle2 size={18} className="text-green-400" />
                  <span>Community validation for increased reliability</span>
                </div>
              </div>

              <Link
                href="/evidence"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-500 transition-colors"
              >
                <Camera size={18} />
                Submit Evidence
              </Link>
            </div>

            <div className="relative">
              <img
                src="/assets/citizen_ground_truth.png"
                alt="Citizen Ground Truth Mobile App"
                className="rounded-xl shadow-2xl border border-slate-700/50"
              />
            </div>
          </div>
        </div>

        {/* Stakeholders */}
        <div className="glass-card p-8 mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Shield size={24} className="text-teal" />
            <h2 className="text-2xl font-bold text-white">
              Target Stakeholders
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {stakeholders.map((stakeholder, i) => (
              <span
                key={i}
                className="px-4 py-2 rounded-lg bg-slate-800/50 text-gray-300"
              >
                {stakeholder}
              </span>
            ))}
          </div>
        </div>

        {/* Competition Info */}
        <div className="glass-card p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Eco-Tech Hackathon 2026
          </h2>
          <p className="text-gray-300 mb-6">
            NodiWatch is developed as part of Phase 2 of the Eco-Tech Hackathon
            2026, focusing on innovative solutions for environmental monitoring
            and protection.
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="#"
              className="px-6 py-3 bg-teal text-slate-900 rounded-lg font-semibold hover:bg-teal/90 transition-colors flex items-center gap-2"
            >
              <ExternalLink size={18} />
              View Project Page
            </a>
            <a
              href="mailto:team@nodiwatch.com"
              className="px-6 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors flex items-center gap-2"
            >
              <Mail size={18} />
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
