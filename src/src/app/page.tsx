import Link from "next/link";
import {
  ArrowRight,
  Camera,
  MapPinned,
  MessageSquareText,
  Shield,
  ShieldAlert,
  Sparkles,
  TriangleAlert,
  Workflow,
  ThermometerSun,
  Trees,
} from "lucide-react";
import DashboardMap from "@/components/maps/DashboardMap";
import StatsCard from "@/components/StatsCard";
import AlertsPanel from "@/components/AlertsPanel";
import ComparisonSlider from "@/components/ComparisonSlider";
import {
  dhakaAlerts,
  dhakaCityLayers,
  dhakaPulseCards,
} from "@/data/dhakawatch";

export default function HomePage() {
  return (
    <div className="min-h-screen animate-fadeIn">
      <section className="relative overflow-hidden py-16 lg:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(6,214,160,0.12),_transparent_40%),radial-gradient(circle_at_right,_rgba(17,138,178,0.12),_transparent_35%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(8,12,24,1))]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.04]" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-300">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-semibold tracking-[0.28em] uppercase">
                Eco-Tech Hackathon 2026 • Team AlphaVerse
              </span>
            </div>

            <div className="space-y-5 max-w-4xl mx-auto">
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight text-white">
                NodiWatch
                <span className="block gradient-text mt-3">
                  AI River Surveillance System
                </span>
              </h1>
              <p className="text-lg lg:text-2xl text-slate-300 leading-relaxed max-w-3xl mx-auto">
                A satellite-powered platform that detects pollution, tracks
                encroachment, and monitors erosion across Bangladesh&apos;s rivers
                using spectral analysis, SAR, and AI-driven attribution.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="#river-dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 text-white font-semibold shadow-lg shadow-teal-500/20"
              >
                Explore River Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/evidence"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/8 text-white font-semibold border border-white/10 hover:bg-white/12 transition-colors"
              >
                <Camera className="w-4 h-4" />
                Citizen Reports
              </Link>
              <Link
                href="/analysis"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/8 text-white font-semibold border border-white/10 hover:bg-white/12 transition-colors"
              >
                <Workflow className="w-4 h-4" />
                Daily Briefing
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto pt-4">
              <div className="glass-card p-4 text-left">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500 mb-2">
                  Urgent
                </p>
                <p className="text-2xl font-bold text-white">87%</p>
                <p className="text-sm text-slate-400">
                  Average detection accuracy across satellite monitoring models
                </p>
              </div>
              <div className="glass-card p-4 text-left">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500 mb-2">
                  Today
                </p>
                <p className="text-2xl font-bold text-white">45</p>
                <p className="text-sm text-slate-400">
                  Industrial facilities tracked via OpenStreetMap Overpass API
                </p>
              </div>
              <div className="glass-card p-4 text-left">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500 mb-2">
                  Coverage
                </p>
                <p className="text-2xl font-bold text-white">6</p>
                <p className="text-sm text-slate-400">
                  Major rivers monitored — Buriganga, Turag, Shitalakshya, and more
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="river-dashboard" className="py-10 lg:py-14">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {dhakaPulseCards.map((card) => (
              <StatsCard key={card.title} {...card} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-4 lg:py-8">
        <div className="container mx-auto px-4">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <h2 className="text-xl font-semibold text-white">
                Satellite Monitoring Modules
              </h2>
              <span className="text-xs text-slate-400">
                Satellite layers powered by Google Earth Engine
              </span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Link
                href="/uhi-monitoring"
                className="rounded-xl border border-white/10 bg-slate-900/40 p-4 hover:bg-slate-900/60 transition-colors"
              >
                <ThermometerSun className="w-5 h-5 text-orange-300 mb-2" />
                <div className="text-white font-medium">UHI Heat Map</div>
                <div className="text-xs text-slate-400 mt-1">
                  Landsat LST + ward intervention queue
                </div>
              </Link>
              <Link
                href="/green-canopy-index"
                className="rounded-xl border border-white/10 bg-slate-900/40 p-4 hover:bg-slate-900/60 transition-colors"
              >
                <Trees className="w-5 h-5 text-green-300 mb-2" />
                <div className="text-white font-medium">Green Canopy Index</div>
                <div className="text-xs text-slate-400 mt-1">
                  Five-year NDVI change and riparian vegetation score
                </div>
              </Link>
              <Link
                href="/validation"
                className="rounded-xl border border-white/10 bg-slate-900/40 p-4 hover:bg-slate-900/60 transition-colors"
              >
                <Shield className="w-5 h-5 text-cyan-300 mb-2" />
                <div className="text-white font-medium">Validation</div>
                <div className="text-xs text-slate-400 mt-1">
                  Accuracy metrics and confusion matrix
                </div>
              </Link>
              <Link
                href="/evidence"
                className="rounded-xl border border-white/10 bg-slate-900/40 p-4 hover:bg-slate-900/60 transition-colors"
              >
                <Camera className="w-5 h-5 text-purple-300 mb-2" />
                <div className="text-white font-medium">Citizen Reports</div>
                <div className="text-xs text-slate-400 mt-1">
                  Geo-tagged photo evidence with Gemini AI analysis
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 lg:py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(340px,1fr)] items-start">
            <div className="space-y-4">
              <div className="glass-card p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-teal-300 mb-2">
                    Interactive Map
                  </p>
                  <h2 className="text-2xl font-bold text-white">
                    Live River Corridor View
                  </h2>
                  <p className="text-sm text-slate-400 mt-2 max-w-2xl">
                    Toggle pollution hotspots, encroachment boundaries, and
                    erosion zones to inspect river corridors.
                  </p>
                </div>
                <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
                  <MapPinned className="w-4 h-4 text-teal-300" />
                  Dhaka pilot wards
                </div>
              </div>

              <div className="h-[520px] rounded-3xl overflow-hidden border border-white/8 shadow-2xl shadow-black/30">
                <DashboardMap className="w-full h-full" />
              </div>
            </div>

            <div className="space-y-4">
              <AlertsPanel alerts={dhakaAlerts} maxHeight="250px" />

              <div className="glass-card p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-teal-300 mb-1">
                      River Monitoring Layers
                    </p>
                    <h3 className="text-lg font-semibold text-white">
                      Monitoring Signals
                    </h3>
                  </div>
                  <TriangleAlert className="w-5 h-5 text-orange-300" />
                </div>

                <div className="space-y-3">
                  {dhakaCityLayers.map((layer) => {
                    const Icon = layer.icon;
                    return (
                      <div
                        key={layer.title}
                        className={`rounded-2xl border border-white/8 bg-gradient-to-r ${layer.accent} p-4`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="rounded-xl bg-slate-900/70 p-2 text-teal-300">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">
                              {layer.title}
                            </h4>
                            <p className="text-sm text-slate-300 mt-1">
                              {layer.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16 bg-gradient-to-b from-transparent to-slate-950/40">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] items-center">
            <ComparisonSlider
              beforeImage="/assets/encroachment_comparison.png"
              afterImage="/assets/encroachment_comparison.png"
              beforeLabel="2020"
              afterLabel="2026"
              beforeYear="2020"
              afterYear="2026"
              title="Canal Narrowing Watch"
              description="Before and after imagery highlights where drainage space has been squeezed by land filling and construction."
            />

            <div className="space-y-4">
              <div className="glass-card p-6 space-y-4">
                <p className="text-xs uppercase tracking-[0.28em] text-teal-300">
                  Citizen Reporting Portal
                </p>
                <h3 className="text-2xl font-bold text-white">
                  Bangla-first evidence to action
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Citizens upload geo-tagged photos of waste, broken drains, and
                  encroachment. Gemini classifies the issue, then the system
                  bundles it into a daily mayor brief and a routing alert.
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    "Upload photo or voice note",
                    "AI tags waste, blockage, or encroachment",
                    "Bangla summary for planners",
                    "Mock SMS / WhatsApp alert",
                  ].map((step) => (
                    <div
                      key={step}
                      className="rounded-2xl bg-slate-900/60 border border-white/8 p-3 text-sm text-slate-300"
                    >
                      {step}
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6 space-y-3">
                <p className="text-xs uppercase tracking-[0.28em] text-teal-300">
                  Automation Loop
                </p>
                <h3 className="text-xl font-semibold text-white">
                  Automated Enforcement Alert Pipeline
                </h3>
                <p className="text-sm text-slate-400">
                  When flood risk crosses the threshold, the demo can trigger a
                  mock email to city traffic control and suggest route rerouting
                  for buses.
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="badge badge-blue">Satellite signal</span>
                  <span className="badge badge-yellow">n8n workflow</span>
                  <span className="badge badge-red">Urgent alert</span>
                </div>
                <Link
                  href="/analysis"
                  className="inline-flex items-center gap-2 text-teal-300 text-sm font-semibold hover:text-teal-200"
                >
                  See the briefing flow
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 lg:py-14">
        <div className="container mx-auto px-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="glass-card p-5">
              <MessageSquareText className="w-6 h-6 text-teal-300 mb-3" />
              <h4 className="text-white font-semibold mb-2">Mayor briefing</h4>
              <p className="text-sm text-slate-400">
                Hundreds of complaints can be condensed into one daily summary
                in Bangla or English.
              </p>
            </div>
            <div className="glass-card p-5">
              <ShieldAlert className="w-6 h-6 text-cyan-300 mb-3" />
              <h4 className="text-white font-semibold mb-2">Early warning</h4>
              <p className="text-sm text-slate-400">
                A route-level alert can warn that a road is likely to submerge
                in the next 30 minutes.
              </p>
            </div>
            <div className="glass-card p-5">
              <TriangleAlert className="w-6 h-6 text-orange-300 mb-3" />
              <h4 className="text-white font-semibold mb-2">Planner action</h4>
              <p className="text-sm text-slate-400">
                The dashboard stays action-oriented: detect, prioritize, notify,
                and verify.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
