"use client";

/**
 * DhakaWatch AI Chatbot
 * =====================
 * Floating chatbot widget that appears on all pages.
 * Powered by Gemini AI with specialized environmental knowledge.
 * Page-aware: injects current page context into each query.
 */

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  ChevronDown,
  Loader2,
  HelpCircle,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { suggestedQuestions } from "@/lib/gemini";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Per-page context descriptions fed to the AI
const PAGE_CONTEXT: Record<string, { name: string; description: string }> = {
  "/": {
    name: "Live City Pulse",
    description:
      "The main DhakaWatch dashboard. Shows AQI, urban heat, waterlogging risk, canal health, and citizen reporting. Features a live city map with heat, blue-green, and flood layers plus a Tokyo comparison widget and AI workflow overview.",
  },
  "/pollution": {
    name: "Canal Health",
    description:
      "The canal and lake health page. Shows spectral fingerprints for solid waste buildup, turbidity, and water quality stress in Dhaka's canals and lakes. Users can inspect hotspots, upstream activity, and triage recommendations.",
  },
  "/encroachment": {
    name: "Drainage Encroachment",
    description:
      "The drainage encroachment monitoring page. Uses change detection to identify illegal buildings, land filling, and canal narrowing that reduce drainage capacity and raise flood risk.",
  },
  "/erosion": {
    name: "Waterlogging Risk",
    description:
      "The waterlogging risk page. Uses elevation-based flood modeling and drainage sink mapping to predict where roads and wards will submerge after short rain bursts.",
  },
  "/evidence": {
    name: "Citizen Reports",
    description:
      "The citizen ground-truth reporting platform. Users can upload geo-tagged photos of waste, broken drains, or encroachment. Gemini Vision AI analyzes each image and routes it into the daily mayor brief.",
  },
  "/analysis": {
    name: "City Analysis",
    description:
      "Historical trend analysis page showing Dhaka heat, AQI, canal health, waterlogging, and citizen complaints over time.",
  },
  "/datasets": {
    name: "Datasets",
    description:
      "The data sources page listing all satellite and ground datasets used by DhakaWatch: Sentinel-2, Sentinel-1, DEM, OpenStreetMap, and city operations data.",
  },
  "/about": {
    name: "About DhakaWatch",
    description:
      "About page for DhakaWatch - the Impact Dhaka 2026 city digital twin by Team AlphaVerse. Shows the architecture, workflow, and demo story.",
  },
};

export default function AIChatbot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Assalamu-'Alaikum! I'm DhakaWatch AI, your urban digital twin assistant for Dhaka. I can help with canal health, drainage encroachment, waterlogging risk, and citizen reports. How can I help today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const currentPage = PAGE_CONTEXT[pathname] || {
    name: "DhakaWatch",
    description:
      "A DhakaWatch page for urban monitoring and digital twin intelligence.",
  };

  const buildPageContext = () =>
    `User is currently viewing: "${currentPage.name}" (URL: ${pathname}). ` +
    `Page content: ${currentPage.description}. ` +
    `If the user asks about something on a DIFFERENT page, mention that page's name and suggest navigating there. ` +
    `Available pages: Dashboard (/), Pollution Monitor (/pollution), Encroachment Monitor (/encroachment), ` +
    `Erosion Monitor (/erosion), Evidence Submission (/evidence), Trend Analysis (/analysis), Datasets (/datasets), About (/about).`;

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          history: messages
            .filter((m) => m.id !== "1")
            .slice(-8)
            .map((m) => ({
              role: m.role === "assistant" ? "model" : "user",
              content: m.content,
            })),
          pageContext: buildPageContext(),
          currentPage: pathname,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.data.message,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const panelWidth = isExpanded ? "w-[600px]" : "w-[460px]";
  const messagesHeight = isExpanded ? "h-[520px]" : "h-[380px]";

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
          isOpen
            ? "bg-slate-700 hover:bg-slate-600 rotate-0"
            : "bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-400 hover:to-blue-400 animate-pulse"
        }`}
        aria-label={isOpen ? "Close chat" : "Open AI assistant"}
      >
        {isOpen ? (
          <ChevronDown className="w-6 h-6 text-white" />
        ) : (
          <div className="relative">
            <MessageSquare className="w-6 h-6 text-white" />
            <Sparkles className="w-3 h-3 text-yellow-300 absolute -top-1 -right-1" />
          </div>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div
          className={`fixed bottom-24 right-6 z-50 ${panelWidth} max-w-[calc(100vw-24px)] bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden animate-fadeIn transition-all duration-300`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-blue-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">DhakaWatch AI</h3>
                <p className="text-xs text-white/70 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                  {currentPage.name} · Page-aware
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                aria-label={isExpanded ? "Shrink chat" : "Expand chat"}
                title={isExpanded ? "Shrink" : "Expand"}
              >
                {isExpanded ? (
                  <Minimize2 className="w-4 h-4 text-white" />
                ) : (
                  <Maximize2 className="w-4 h-4 text-white" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                aria-label="Close chat"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Page context indicator */}
          <div className="px-4 py-2 bg-slate-800/60 border-b border-slate-700/40 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            <span className="text-[11px] text-slate-400">
              Viewing:{" "}
              <span className="text-teal-400 font-medium">
                {currentPage.name}
              </span>{" "}
              — Ask anything about this page or navigate to another
            </span>
          </div>

          {/* Messages */}
          <div
            className={`${messagesHeight} overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 transition-all duration-300`}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                    message.role === "user"
                      ? "bg-blue-600"
                      : "bg-gradient-to-br from-teal-500 to-blue-500"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                <div
                  className={`max-w-[78%] rounded-2xl px-4 py-2.5 ${
                    message.role === "user"
                      ? "bg-blue-600 text-white rounded-br-md"
                      : "bg-slate-800 text-slate-200 rounded-bl-md"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                  <p className="text-[10px] mt-1.5 opacity-40">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full flex-shrink-0 bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-slate-800 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Analyzing...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {showSuggestions && messages.length <= 1 && (
            <div className="px-4 pb-2">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                <HelpCircle className="w-3 h-3" />
                <span>Suggested questions</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.slice(0, 4).map((question, index) => (
                  <button
                    key={index}
                    onClick={() => sendMessage(question)}
                    className="text-xs px-3 py-1.5 rounded-full bg-slate-800 text-teal-400 hover:bg-slate-700 transition-colors border border-slate-700 hover:border-teal-500/40"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-slate-700/50">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Ask about ${currentPage.name.toLowerCase()}...`}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50"
                disabled={isLoading}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                className="p-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:from-teal-400 hover:to-blue-400 transition-all"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 text-center">
              Powered by Gemini AI · Context-aware · DhakaWatch v1.0
            </p>
          </div>
        </div>
      )}
    </>
  );
}
