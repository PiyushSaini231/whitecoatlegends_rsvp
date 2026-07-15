import React, { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import RsvpPage from "./components/RsvpPage";
import AdminDashboard from "./components/AdminDashboard";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { fetchCampaignDetails } from "./store/slices/campaignSlice";
import { DEFAULT_CAMPAIGN_ID } from "./api/services/campaignService";
import { mapCampaignToEventConfig } from "./utils/mapCampaignToEventConfig";

export default function App() {
  const dispatch = useAppDispatch();
  const { isCampaignLoading, isCampaignError, campaignData, campaignError } =
    useAppSelector((state) => state.campaign);
  const [isAdminMode, setIsAdminMode] = React.useState(false);

  const loadCampaign = () => {
    dispatch(fetchCampaignDetails(DEFAULT_CAMPAIGN_ID));
  };

  useEffect(() => {
    loadCampaign();

    const handleHashChange = () => {
      const hash = window.location.hash;
      setIsAdminMode(hash === "#admin" || hash === "#/admin");
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [dispatch]);

  const handleToggleAdmin = (mode: boolean) => {
    window.location.hash = mode ? "admin" : "";
  };

  if (isCampaignLoading && !campaignData) {
    return (
      <div className="min-h-screen bg-[#070104] flex flex-col items-center justify-center text-white font-sans">
        <RefreshCw className="w-10 h-10 animate-spin text-[#D4AF37] mb-4" />
        <p className="text-sm tracking-wider uppercase font-mono text-[#FFE07D]">
          Curating Grand Premiere...
        </p>
      </div>
    );
  }

  if (isCampaignError || !campaignData) {
    return (
      <div className="min-h-screen bg-[#070104] flex flex-col items-center justify-center text-center p-6 text-white font-sans">
        <div className="w-16 h-16 bg-red-950/40 border border-red-900/30 text-red-400 rounded-full flex items-center justify-center mb-4">
          !
        </div>
        <h2 className="text-lg font-bold mb-2 font-serif italic">Invitation Unavailable</h2>
        <p className="text-xs text-gray-400 max-w-xs mb-6 leading-relaxed">
          {campaignError || "Server connection error. Please refresh or try again."}
        </p>
        <button
          onClick={loadCampaign}
          className="px-5 py-2.5 bg-gradient-to-r from-[#FFE07D] to-[#AA7C11] text-black font-semibold text-xs uppercase tracking-widest rounded-lg hover:from-[#FFF0A0] hover:to-[#D4AF37] transition-all cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const config = mapCampaignToEventConfig(campaignData);

  return (
    <>
      {isAdminMode ? (
        <AdminDashboard
          currentConfig={config}
          onConfigUpdate={(_updated) => loadCampaign()}
          onClose={() => handleToggleAdmin(false)}
        />
      ) : (
        <RsvpPage onAdminClick={() => handleToggleAdmin(true)} />
      )}
    </>
  );
}
