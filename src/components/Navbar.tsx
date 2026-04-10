"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Waves,
  LayoutDashboard,
  Factory,
  LandPlot,
  Mountain,
  Database,
  Info,
  FileText,
  BarChart3,
  Menu,
  X,
  Camera,
  Sparkles,
  Shield,
  ThermometerSun,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pollution", label: "Canals", icon: Factory },
  { href: "/encroachment", label: "Drainage", icon: LandPlot },
  { href: "/erosion", label: "Flood Risk", icon: Mountain },
  { href: "/uhi-monitoring", label: "UHI", icon: ThermometerSun },
  { href: "/analysis", label: "Analysis", icon: BarChart3 },
  { href: "/evidence", label: "Reports", icon: Camera },
  { href: "/validation", label: "Validation", icon: Shield },
  { href: "/datasets", label: "Datasets", icon: Database },
  { href: "/about", label: "About", icon: Info },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-teal/20 blur-xl rounded-full group-hover:bg-teal/30 transition-all" />
              <Waves className="w-8 h-8 text-teal relative z-10" />
            </div>
            <div>
              <h1 className="text-lg font-bold">
                <span className="gradient-text">Dhaka</span>
                <span className="text-white">Watch</span>
              </h1>
              <p className="text-[10px] text-slate-400 -mt-0.5 hidden sm:block">
                Urban Digital Twin
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-teal/10 text-teal border border-teal/30"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Status Indicator */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-purple-500/10 border border-purple-500/30">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span className="text-xs text-purple-400 font-medium">
                AI Powered
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-teal rounded-full pulse-glow" />
              <span className="text-xs text-slate-400">Near-real-time city pulse</span>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-slate-400" />
            ) : (
              <Menu className="w-6 h-6 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden glass-card border-t border-white/5 animate-fade-in">
          <div className="px-4 py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-teal/10 text-teal border border-teal/30"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
