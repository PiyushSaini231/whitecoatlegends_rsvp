import React, { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import RsvpPage from "./components/RsvpPage";
import AdminDashboard from "./components/AdminDashboard";
import { EventConfig } from "./types";

export default function App() {
  const [config, setConfig] = useState<EventConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdminMode, setIsAdminMode] = useState(false);

  const fetchConfig = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/config");
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      } else {
        setError("Failed to load invitation details. Please check back later.");
      }
    } catch (err) {
      setError("Server connection error. Please refresh or try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();

    // Support Hash-based Routing (e.g., #/admin or #admin)
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === "#admin" || hash === "#/admin") {
        setIsAdminMode(true);
      } else {
        setIsAdminMode(false);
      }
    };

    // Run once on load
    handleHashChange();

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleToggleAdmin = (mode: boolean) => {
    if (mode) {
      window.location.hash = "admin";
    } else {
      window.location.hash = "";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070104] flex flex-col items-center justify-center text-white font-sans">
        <RefreshCw className="w-10 h-10 animate-spin text-[#D4AF37] mb-4" />
        <p className="text-sm tracking-wider uppercase font-mono text-[#FFE07D]">Curating Grand Premiere...</p>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="min-h-screen bg-[#070104] flex flex-col items-center justify-center text-center p-6 text-white font-sans">
        <div className="w-16 h-16 bg-red-950/40 border border-red-900/30 text-red-400 rounded-full flex items-center justify-center mb-4">
          !
        </div>
        <h2 className="text-lg font-bold mb-2 font-serif italic">Invitation Unavailable</h2>
        <p className="text-xs text-gray-400 max-w-xs mb-6 leading-relaxed">{error || "Failed to load event configuration."}</p>
        <button
          onClick={fetchConfig}
          className="px-5 py-2.5 bg-gradient-to-r from-[#FFE07D] to-[#AA7C11] text-black font-semibold text-xs uppercase tracking-widest rounded-lg hover:from-[#FFF0A0] hover:to-[#D4AF37] transition-all cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <>
      {isAdminMode ? (
        <AdminDashboard
          currentConfig={config}
          onConfigUpdate={(updated) => setConfig(updated)}
          onClose={() => handleToggleAdmin(false)}
        />
      ) : (
        <RsvpPage
          config={config}
          onAdminClick={() => handleToggleAdmin(true)}
        />
      )}
    </>
  );
}
