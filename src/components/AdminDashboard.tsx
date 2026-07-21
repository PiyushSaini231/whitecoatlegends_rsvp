import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "motion/react";
import {
  Download,
  Settings,
  Users,
  Plus,
  Trash2,
  RefreshCw,
  LogOut,
  Save,
  ChevronRight,
  ArrowLeft,
  Eye,
  Calendar,
  MapPin,
  Palette,
  Upload,
  Sparkles,
  Search,
  Lock,
  ChevronDown,
  X,
} from "lucide-react";
import { EventConfig } from "../types";
import type { Campaign } from "../types/campaign";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { API_BASE_URL } from "../store/config";
import { fetchCampaignAnalytics } from "../store/slices/analyticsSlice";
import { updateCampaign } from "../store/slices/campaignSlice";
import { exportCampaignData } from "../store/slices/exportSlice";
import {
  fetchSubmissions,
  restoreSubmissionsPage,
} from "../store/slices/submissionsSlice";
import {
  disableCampaign,
  enableCampaign,
  resetCampaignStatus,
  setCampaignEnabled,
} from "../store/slices/campaignStatusSlice";
import {
  DEFAULT_DOCFLIX_LOGO,
  DEFAULT_MANKIND_LOGO,
  isUsableLogo,
  mapCampaignToEventConfig,
  mapEventConfigToCampaignPayload,
} from "../utils/mapCampaignToEventConfig";

const MASTER_PASSWORD = "wsl_docflix@123";
const ADMIN_SESSION_KEY = "docflix_admin_authenticated";
const ADMIN_AUTH_CHANNEL = "docflix_admin_auth";

/** Current local date/time as `YYYY-MM-DDTHH:mm` for datetime-local `min`. */
const getLocalDateTimeMin = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
};

const EMPTY_CONFIG: EventConfig = {
  headline: "",
  series: "",
  tagline: "",
  honoree: "",
  honoreeCredentials: "",
  dateTime: "",
  venue: "",
  footerLine: "",
  availabilityOptions: [],
  accentColor: "#D4AF37",
  primaryColor: "#7a0c1e",
  secondaryColor: "#0a192f",
  logoDocflix: "",
  logoMankind: "",
  countdownTarget: "",
};

export default function AdminDashboard() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { analyticsData, isAnalyticsLoading } = useAppSelector(
    (state) => state.analytics,
  );
  const { isExporting } = useAppSelector((state) => state.export);
  const { isUpdatingCampaign } = useAppSelector((state) => state.campaign);
  const { enabled, isToggling, toggleError } = useAppSelector(
    (state) => state.campaignStatus,
  );
  const {
    submissions,
    isLoading: isSubmissionsLoading,
    nextCursor,
    hasMore,
  } = useAppSelector((state) => state.submissions);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState<"rsvps" | "editor">("rsvps");
  const [submissionSearch, setSubmissionSearch] = useState("");
  const [submissionFilter, setSubmissionFilter] = useState("all");

  const [editableConfig, setEditableConfig] = useState<EventConfig>({
    ...EMPTY_CONFIG,
  });
  const [savedConfig, setSavedConfig] = useState<EventConfig>({
    ...EMPTY_CONFIG,
  });
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [newOptionInput, setNewOptionInput] = useState("");
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [pageCache, setPageCache] = useState<
    Array<{
      submissions: typeof submissions;
      nextCursor: string | null;
      hasMore: boolean;
    }>
  >([]);

  const hasUnsavedChanges =
    JSON.stringify(editableConfig) !== JSON.stringify(savedConfig);

  useEffect(() => {
    if (!saveSuccess) return;
    const timer = setTimeout(() => setSaveSuccess(false), 5000);
    return () => clearTimeout(timer);
  }, [saveSuccess]);

  const loadDashboardData = () => {
    if (campaignId) {
      setPageCache([]);
      dispatch(
        fetchSubmissions({ campaignId, adminPassword: MASTER_PASSWORD }),
      );
      dispatch(fetchCampaignAnalytics(campaignId));
    }
  };

  useEffect(() => {
    const wasAuthenticated =
      sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
    if (wasAuthenticated) {
      setIsAuthenticated(true);
      loadDashboardData();
    }
  }, [campaignId, dispatch]);

  useEffect(() => {
    dispatch(resetCampaignStatus());
  }, [campaignId, dispatch]);

  useEffect(() => {
    if (!campaignId || !isAuthenticated) return;

    let cancelled = false;
    axios
      .get<Campaign>(
        `${API_BASE_URL}/api/v1/campaigns/${encodeURIComponent(campaignId)}`,
      )
      .then(({ data }) => {
        if (!cancelled) {
          const config = mapCampaignToEventConfig(data);
          setEditableConfig(config);
          setSavedConfig(config);
          dispatch(setCampaignEnabled(data.enabled));
        }
      })
      .catch(() => {
        // Keep the current config if the campaign fetch fails.
      });

    return () => {
      cancelled = true;
    };
  }, [campaignId, isAuthenticated]);

  const openPublicView = () => {
    if (campaignId) navigate(`/${campaignId}`);
  };

  const openPreviewCampaign = () => {
    if (!campaignId) return;
    const previewUrl = `/preview/${encodeURIComponent(campaignId)}`;
    const previewWindow = window.open("about:blank", "_blank");
    if (!previewWindow) return;
    previewWindow.sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
    previewWindow.location.href = previewUrl;
  };

  const goToCampaignList = () => {
    navigate("/admin/campaign");
  };

  const openStatusConfirm = () => {
    if (!campaignId || isToggling || enabled === null) return;
    setShowStatusConfirm(true);
  };

  const closeStatusConfirm = () => {
    if (isToggling) return;
    setShowStatusConfirm(false);
  };

  const handleConfirmToggleStatus = async () => {
    if (!campaignId || isToggling || enabled === null) return;

    if (enabled) {
      await dispatch(disableCampaign(campaignId));
    } else {
      await dispatch(enableCampaign(campaignId));
    }
    setShowStatusConfirm(false);
  };

  const verifyPassword = (pass: string) => {
    if (pass === MASTER_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
      setLoginError("");
      loadDashboardData();
    } else {
      setLoginError("Incorrect password.");
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    if (!passwordInput) {
      setLoginError("Please enter password.");
      return;
    }
    verifyPassword(passwordInput);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPasswordInput("");
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    const channel = new BroadcastChannel(ADMIN_AUTH_CHANNEL);
    channel.postMessage({ type: "logout" });
    channel.close();
    navigate("/admin/campaign", { replace: true });
  };

  const handleNextPage = () => {
    if (!nextCursor || !campaignId) return;

    setPageCache((prev) => [
      ...prev,
      {
        submissions,
        nextCursor,
        hasMore,
      },
    ]);

    dispatch(
      fetchSubmissions({
        campaignId,
        adminPassword: MASTER_PASSWORD,
        cursor: nextCursor,
      }),
    );
  };

  const handlePreviousPage = () => {
    if (pageCache.length === 0) return;

    const previousPages = [...pageCache];
    const previousPage = previousPages.pop()!;
    setPageCache(previousPages);

    dispatch(restoreSubmissionsPage(previousPage));
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError("");
    setSaveSuccess(false);

    if (!hasUnsavedChanges || isUpdatingCampaign) return;

    if (!campaignId) {
      setSaveError("Campaign ID not found.");
      return;
    }

    if (
      !editableConfig.headline.trim() ||
      !editableConfig.series.trim() ||
      !editableConfig.honoree.trim() ||
      !editableConfig.dateTime.trim() ||
      !editableConfig.venue.trim() ||
      !editableConfig.countdownTarget.trim()
    ) {
      setSaveError("Please fill in all required fields before saving.");
      return;
    }

    try {
      const updated = await dispatch(
        updateCampaign({
          campaignId,
          payload: mapEventConfigToCampaignPayload(editableConfig),
        }),
      ).unwrap();

      const config = mapCampaignToEventConfig(updated);
      setEditableConfig(config);
      setSavedConfig(config);
      setSaveSuccess(true);
    } catch (error) {
      setSaveError(
        typeof error === "string" ? error : "Failed to update campaign.",
      );
    }
  };

  const handleResetEvent = () => {
    alert(
      "Event archival is managed by the Docflix campaign API and is not available from this panel.",
    );
  };

  const handleDownloadExcel = async () => {
    if (!campaignId) {
      alert("Campaign ID not found.");
      return;
    }
    try {
      await dispatch(
        exportCampaignData({ campaignId, adminPassword: MASTER_PASSWORD }),
      ).unwrap();
    } catch (error) {
      alert(`Export failed: ${error}`);
    }
  };

  const handleLogoUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    slot: "logoDocflix" | "logoMankind",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image is too large. Please select a logo file under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditableConfig((prev) => ({
        ...prev,
        [slot]: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = (slot: "logoDocflix" | "logoMankind") => {
    setEditableConfig((prev) => ({
      ...prev,
      [slot]: "",
    }));
  };

  // Add / Remove Availability options
  const handleAddOption = () => {
    const trimmed = newOptionInput.trim();
    if (!trimmed) return;
    if (editableConfig.availabilityOptions.includes(trimmed)) {
      alert("This option already exists.");
      return;
    }
    setEditableConfig((prev) => ({
      ...prev,
      availabilityOptions: [...prev.availabilityOptions, trimmed],
    }));
    setNewOptionInput("");
  };

  const handleRemoveOption = (opt: string) => {
    if (editableConfig.availabilityOptions.length <= 1) {
      alert("You must have at least one availability option.");
      return;
    }
    setEditableConfig((prev) => ({
      ...prev,
      availabilityOptions: prev.availabilityOptions.filter((o) => o !== opt),
    }));
  };

  // Filtered submissions list
  const filteredSubmissions = submissions.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(submissionSearch.toLowerCase()) ||
      s.phone.includes(submissionSearch);
    const matchesFilter =
      submissionFilter === "all" ||
      (submissionFilter === "Attending" ? s.availability : !s.availability);
    return matchesSearch && matchesFilter;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 text-white font-sans">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle gold line accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>

          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center border border-[#D4AF37]/30 text-[#D4AF37] mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold font-sans tracking-wide">
              Docflix Admin Console
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Please enter the master password to access the guest list and
              settings.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs uppercase tracking-widest text-gray-400 font-mono mb-2"
              >
                Master Password
              </label>
              <input
                id="admin-password"
                type="password"
                placeholder="Enter password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-black border border-zinc-800 focus:border-[#D4AF37] rounded-lg py-2.5 px-4 text-sm text-white placeholder-zinc-600 transition-all outline-none"
              />
            </div>

            {loginError && (
              <div className="text-red-400 text-xs text-center font-medium py-2 bg-red-950/20 border border-red-900/30 rounded-lg">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#FFE07D] to-[#AA7C11] hover:from-[#FFF0A0] hover:to-[#D4AF37] text-black font-semibold uppercase tracking-widest text-xs py-3 rounded-lg transition-all shadow-lg shadow-[#D4AF37]/10 cursor-pointer"
            >
              Enter Console
            </button>
          </form>

          {/* <div className="mt-8 text-center border-t border-zinc-800/60 pt-4">
            <button
              onClick={openPublicView}
              className="text-xs text-zinc-500 hover:text-white transition-colors flex items-center gap-1.5 mx-auto cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" /> Back to Invitation Site
            </button>
          </div> */}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-16">
      {/* Top Bar Navigation */}
      <header className="sticky top-0 z-40 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800/80 px-4 py-4 md:px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-800 border border-[#D4AF37]/20 rounded-lg flex items-center justify-center font-cinzel font-black text-white text-base">
              DF
            </div>
            <div>
              <h1 className="text-base font-bold tracking-wide flex items-center gap-2">
                <span>Docflix Event Console</span>
                {/* <span className="text-[9px] font-mono px-2 py-0.5 bg-zinc-800 border border-zinc-700 text-[#FFE07D] rounded-full uppercase">
                  Full Stack
                </span> */}
              </h1>
              <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                {editableConfig.series}
                {/* &bull; Admin Management */}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              onClick={goToCampaignList}
              className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 border border-zinc-700 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <label className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={enabled === true}
                disabled={isToggling || enabled === null || showStatusConfirm}
                onChange={openStatusConfirm}
                className="w-4 h-4 accent-[#D4AF37] cursor-pointer disabled:opacity-50"
              />
              <span className="text-xs font-semibold text-zinc-200">
                {enabled === null
                  ? "Loading..."
                  : isToggling
                    ? "Updating..."
                    : enabled
                      ? "Published"
                      : "Unpublished"}
              </span>
            </label>
            <button
              onClick={openPreviewCampaign}
              className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 border border-zinc-700 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" /> Preview Campaign
            </button>
            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 bg-red-950/40 hover:bg-red-900/40 text-red-400 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 border border-red-900/20 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </header>

      {toggleError && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-4">
          <p className="text-red-400 text-xs font-medium py-2 px-3 bg-red-950/20 border border-red-900/30 rounded-lg">
            {toggleError}
          </p>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-800 mb-8 gap-4">
          <button
            onClick={() => setActiveTab("rsvps")}
            className={`pb-4 px-2 text-sm font-semibold tracking-wide border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "rsvps"
                ? "border-[#D4AF37] text-white"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" /> Guest Ledger ({submissions.length})
          </button>
          <button
            onClick={() => setActiveTab("editor")}
            className={`pb-4 px-2 text-sm font-semibold tracking-wide border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "editor"
                ? "border-[#D4AF37] text-white"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            <Settings className="w-4 h-4" /> Invitation Site Editor
          </button>
        </div>

        {/* Tab 1: Guest List */}
        {activeTab === "rsvps" && (
          <div className="space-y-6">
            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm">
                <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">
                  Total RSVPs
                </span>
                <p className="text-3xl font-extrabold text-white mt-1.5 font-mono">
                  {isAnalyticsLoading
                    ? "..."
                    : (analyticsData?.totalSubmissions ?? 0)}
                </p>
              </div>

              <div className="bg-zinc-900 border border-[#D4AF37]/50 shadow-[0_4px_15px_rgba(212,175,55,0.15)] ring-1 ring-[#D4AF37]/20 rounded-xl p-5 shadow-sm">
                <span className="text-[10px] uppercase tracking-widest font-mono flex items-center gap-1.5 text-[#FFE07D] font-bold">
                  <span>Interested</span>
                  <Sparkles className="w-3 h-3 text-[#D4AF37] animate-pulse" />
                </span>
                <p className="text-3xl font-extrabold mt-1.5 font-mono text-[#FFE07D]">
                  {isAnalyticsLoading
                    ? "..."
                    : (analyticsData?.interested ?? 0)}
                </p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm">
                <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">
                  Not Interested
                </span>
                <p className="text-3xl font-extrabold text-white mt-1.5 font-mono">
                  {isAnalyticsLoading
                    ? "..."
                    : (analyticsData?.notInterested ?? 0)}
                </p>
              </div>
            </div>

            {/* Table & Filtering */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-md">
              <div className="p-5 border-b border-zinc-800 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  {/* Search bar */}
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Search name or mobile..."
                      value={submissionSearch}
                      onChange={(e) => setSubmissionSearch(e.target.value)}
                      className="w-full bg-black border border-zinc-800 pl-9 pr-4 py-2 text-xs rounded-lg text-white placeholder-zinc-500 outline-none focus:border-zinc-700"
                    />
                  </div>

                  {/* Filter Select */}
                  <div className="relative">
                    <select
                      value={submissionFilter}
                      onChange={(e) => setSubmissionFilter(e.target.value)}
                      className="bg-black border border-zinc-800 rounded-lg text-xs py-2 px-3 pr-8 text-white outline-none focus:border-zinc-700 cursor-pointer appearance-none"
                    >
                      <option value="all">All Responses</option>
                      <option value="Attending">Attending</option>
                      <option value="Not Attending">Not Attending</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>

                <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
                  <button
                    onClick={() => loadDashboardData()}
                    disabled={isSubmissionsLoading}
                    className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold rounded-lg transition-colors border border-zinc-700 flex items-center gap-2 cursor-pointer"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${isSubmissionsLoading ? "animate-spin" : ""}`}
                    />{" "}
                    Refresh
                  </button>

                  <button
                    onClick={handleDownloadExcel}
                    disabled={isExporting}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-emerald-950/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download
                      className={`w-3.5 h-3.5 ${isExporting ? "animate-spin" : ""}`}
                    />{" "}
                    {isExporting ? "Exporting..." : "Download Excel"}
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-950 text-zinc-400 border-b border-zinc-800 text-[10px] uppercase tracking-wider font-mono">
                      <th className="py-4 px-6 font-medium">Timestamp</th>
                      <th className="py-4 px-6 font-medium">Name</th>
                      <th className="py-4 px-6 font-medium">Phone Number</th>
                      <th className="py-4 px-6 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 text-xs">
                    {isSubmissionsLoading ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-12 text-center text-zinc-500 font-mono"
                        >
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#D4AF37]" />{" "}
                          Loading submissions...
                        </td>
                      </tr>
                    ) : filteredSubmissions.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-12 text-center text-zinc-500 font-mono"
                        >
                          No submissions found matching the filters.
                        </td>
                      </tr>
                    ) : (
                      filteredSubmissions.map((s, idx) => (
                        <tr
                          key={`${s.phone}-${idx}`}
                          className="hover:bg-zinc-800/40 transition-colors"
                        >
                          <td className="py-4 px-6 text-zinc-400 font-mono">
                            {new Date(s.createdAt).toLocaleString("en-IN", {
                              timeZone: "Asia/Kolkata",
                            })}
                          </td>
                          <td className="py-4 px-6 font-semibold text-white">
                            {s.name}
                          </td>
                          <td className="py-4 px-6 font-mono text-zinc-300">
                            {s.phone}
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                                s.availability
                                  ? "bg-green-950/30 text-green-400 border-green-900/30"
                                  : "bg-red-950/30 text-red-400 border-red-900/30"
                              }`}
                            >
                              {s.availability ? "Attending" : "Not Attending"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-zinc-800 flex items-center justify-between">
                <p className="text-xs text-zinc-400">
                  {submissions.length > 0
                    ? `Showing ${filteredSubmissions.length} of ${submissions.length}`
                    : "No submissions"}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handlePreviousPage}
                    disabled={pageCache.length === 0}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold rounded-lg transition-colors border border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={!hasMore}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold rounded-lg transition-colors border border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>

            {/* Danger Zone: Archiving */}
            {/* <div className="bg-red-950/10 border border-red-900/20 rounded-xl p-6 shadow-sm mt-8">
              <h3 className="text-red-400 font-semibold text-sm uppercase tracking-wider mb-2">
                Event Archival Operations
              </h3>
              <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed mb-4">
                Ready to launch a new episode premiere? Clicking the button
                below will securely package and archive all active RSVPs,
                clearing out the guest ledger table so you can configure and run
                the next invite microsite.
              </p>
              <button
                onClick={handleResetEvent}
                className="px-4 py-2.5 bg-red-900 hover:bg-red-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Archive Current & Launch
                New Event
              </button>
            </div> */}
          </div>
        )}

        {/* Tab 2: Site Editor Form */}
        {activeTab === "editor" && (
          <form onSubmit={handleSaveConfig} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Form Settings */}
              <div className="lg:col-span-2 space-y-6">
                {/* 1. Header Typography */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm space-y-4">
                  <h3 className="text-white font-semibold text-sm border-b border-zinc-800 pb-3 mb-1 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-[#D4AF37]" /> Title &
                    Typography Setup
                  </h3>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-mono text-zinc-400 mb-2">
                        Headline Prefix
                      </label>
                      <input
                        type="text"
                        value={editableConfig.headline}
                        onChange={(e) =>
                          setEditableConfig((prev) => ({
                            ...prev,
                            headline: e.target.value,
                          }))
                        }
                        className="w-full bg-black border border-zinc-800 focus:border-[#D4AF37] rounded-lg py-2.5 px-4 text-xs text-white placeholder-zinc-700 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-mono text-zinc-400 mb-2">
                        Series Title
                      </label>
                      <input
                        type="text"
                        value={editableConfig.series}
                        onChange={(e) =>
                          setEditableConfig((prev) => ({
                            ...prev,
                            series: e.target.value,
                          }))
                        }
                        className="w-full bg-black border border-zinc-800 focus:border-[#D4AF37] rounded-lg py-2.5 px-4 text-xs text-white placeholder-zinc-700 outline-none transition-all font-semibold"
                      />
                      <span className="text-[10px] text-zinc-500 mt-1 block">
                        Displayed in high-contrast golden condensed typeface and
                        used for the faint diagonal background watermark.
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-mono text-zinc-400 mb-2">
                        Tagline / Subheading
                      </label>
                      <input
                        type="text"
                        value={editableConfig.tagline}
                        onChange={(e) =>
                          setEditableConfig((prev) => ({
                            ...prev,
                            tagline: e.target.value,
                          }))
                        }
                        className="w-full bg-black border border-zinc-800 focus:border-[#D4AF37] rounded-lg py-2.5 px-4 text-xs text-white placeholder-zinc-700 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Honoree Details */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm space-y-4">
                  <h3 className="text-white font-semibold text-sm border-b border-zinc-800 pb-3 mb-1 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-[#D4AF37]" /> Honoree
                    Information
                  </h3>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-mono text-zinc-400 mb-2">
                        Honoree Name & Title
                      </label>
                      <input
                        type="text"
                        value={editableConfig.honoree}
                        onChange={(e) =>
                          setEditableConfig((prev) => ({
                            ...prev,
                            honoree: e.target.value,
                          }))
                        }
                        className="w-full bg-black border border-zinc-800 focus:border-[#D4AF37] rounded-lg py-2.5 px-4 text-xs text-white placeholder-zinc-700 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-mono text-zinc-400 mb-2">
                        Credentials & Subtitles
                      </label>
                      <textarea
                        rows={2}
                        value={editableConfig.honoreeCredentials}
                        onChange={(e) =>
                          setEditableConfig((prev) => ({
                            ...prev,
                            honoreeCredentials: e.target.value,
                          }))
                        }
                        className="w-full bg-black border border-zinc-800 focus:border-[#D4AF37] rounded-lg py-2.5 px-4 text-xs text-white placeholder-zinc-700 outline-none transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Event Logistics */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm space-y-4">
                  <h3 className="text-white font-semibold text-sm border-b border-zinc-800 pb-3 mb-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#D4AF37]" /> Logistics &
                    Date Selector
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-mono text-zinc-400 mb-2">
                        Date & Time Text (Formatted)
                      </label>
                      <input
                        type="text"
                        value={editableConfig.dateTime}
                        onChange={(e) =>
                          setEditableConfig((prev) => ({
                            ...prev,
                            dateTime: e.target.value,
                          }))
                        }
                        className="w-full bg-black border border-zinc-800 focus:border-[#D4AF37] rounded-lg py-2.5 px-4 text-xs text-white placeholder-zinc-700 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-mono text-zinc-400 mb-2">
                        Countdown Target Date/Time
                      </label>
                      <input
                        type="datetime-local"
                        min={getLocalDateTimeMin()}
                        value={editableConfig.countdownTarget.slice(0, 16)}
                        onChange={(e) =>
                          setEditableConfig((prev) => ({
                            ...prev,
                            countdownTarget: e.target.value,
                          }))
                        }
                        className="w-full bg-black border border-zinc-800 focus:border-[#D4AF37] rounded-lg py-2.5 px-4 text-xs text-white placeholder-zinc-700 outline-none transition-all cursor-pointer"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[11px] uppercase tracking-widest font-mono text-zinc-400 mb-2">
                        Venue
                      </label>
                      <input
                        type="text"
                        value={editableConfig.venue}
                        onChange={(e) =>
                          setEditableConfig((prev) => ({
                            ...prev,
                            venue: e.target.value,
                          }))
                        }
                        className="w-full bg-black border border-zinc-800 focus:border-[#D4AF37] rounded-lg py-2.5 px-4 text-xs text-white placeholder-zinc-700 outline-none transition-all"
                      />

                      {/* Map Preview inside the dashboard editor */}
                      <div className="mt-3 border border-zinc-800 rounded-lg overflow-hidden">
                        <div className="bg-zinc-950 px-3 py-1.5 border-b border-zinc-800 flex items-center justify-between">
                          <span className="text-[9px] font-mono uppercase tracking-wider text-[#FFE07D] font-bold">
                            Interactive Map Preview
                          </span>
                          <span className="text-[8px] font-mono text-zinc-500">
                            Auto-pinned to address
                          </span>
                        </div>
                        <iframe
                          title="Admin Venue Map Preview"
                          width="100%"
                          height="130"
                          style={{ border: 0 }}
                          loading="lazy"
                          src={`https://maps.google.com/maps?q=${encodeURIComponent(editableConfig.venue)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                          className="opacity-80"
                        ></iframe>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Form Availability Options */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm space-y-4">
                  <h3 className="text-white font-semibold text-sm border-b border-zinc-800 pb-3 mb-1 flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#D4AF37]" /> Form Options
                    Manager
                  </h3>

                  <div>
                    <label className="block text-[11px] uppercase tracking-widest font-mono text-zinc-400 mb-3">
                      Current Availability Tags
                    </label>

                    <div className="flex flex-wrap gap-2.5 mb-4">
                      {editableConfig.availabilityOptions.map((opt) => (
                        <div
                          key={opt}
                          className="flex items-center gap-2 py-1.5 px-3 bg-zinc-800 border border-zinc-700 rounded-lg text-xs font-semibold text-white"
                        >
                          <span>{opt}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(opt)}
                            className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 max-w-sm">
                      <input
                        type="text"
                        placeholder="Add option (e.g. Tentative)"
                        value={newOptionInput}
                        onChange={(e) => setNewOptionInput(e.target.value)}
                        className="flex-grow bg-black border border-zinc-800 focus:border-[#D4AF37] rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={handleAddOption}
                        className="p-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded-lg transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Theming, Logos, and Password */}
              <div className="space-y-6">
                {/* Visual Accent Customizer */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm space-y-4">
                  <h3 className="text-white font-semibold text-sm border-b border-zinc-800 pb-3 mb-1 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-[#D4AF37]" /> Theme Palette
                    (Color Picker)
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-mono text-zinc-400 mb-1.5">
                        Accent / Gold Highlight
                      </label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={editableConfig.accentColor}
                          onChange={(e) =>
                            setEditableConfig((prev) => ({
                              ...prev,
                              accentColor: e.target.value,
                            }))
                          }
                          className="w-8 h-8 rounded border border-zinc-800 bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          value={editableConfig.accentColor}
                          onChange={(e) =>
                            setEditableConfig((prev) => ({
                              ...prev,
                              accentColor: e.target.value,
                            }))
                          }
                          className="flex-grow bg-black border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-mono text-zinc-400 mb-1.5">
                        Left Gradient (Primary Deep Crimson)
                      </label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={editableConfig.primaryColor}
                          onChange={(e) =>
                            setEditableConfig((prev) => ({
                              ...prev,
                              primaryColor: e.target.value,
                            }))
                          }
                          className="w-8 h-8 rounded border border-zinc-800 bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          value={editableConfig.primaryColor}
                          onChange={(e) =>
                            setEditableConfig((prev) => ({
                              ...prev,
                              primaryColor: e.target.value,
                            }))
                          }
                          className="flex-grow bg-black border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-mono text-zinc-400 mb-1.5">
                        Right Gradient (Secondary Deep Navy)
                      </label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={editableConfig.secondaryColor}
                          onChange={(e) =>
                            setEditableConfig((prev) => ({
                              ...prev,
                              secondaryColor: e.target.value,
                            }))
                          }
                          className="w-8 h-8 rounded border border-zinc-800 bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          value={editableConfig.secondaryColor}
                          onChange={(e) =>
                            setEditableConfig((prev) => ({
                              ...prev,
                              secondaryColor: e.target.value,
                            }))
                          }
                          className="flex-grow bg-black border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer and Brand Logos slots */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm space-y-4">
                  <h3 className="text-white font-semibold text-sm border-b border-zinc-800 pb-3 mb-1 flex items-center gap-2">
                    <Upload className="w-4 h-4 text-[#D4AF37]" /> Brand Logo
                    Uploads
                  </h3>

                  {/* Docflix logo slot */}
                  <div className="space-y-2">
                    <span className="block text-[11px] uppercase tracking-widest font-mono text-zinc-400">
                      Docflix Logo Slot
                    </span>
                    {isUsableLogo(editableConfig.logoDocflix) ? (
                      <div className="p-3 bg-black/60 rounded-lg border border-zinc-800 flex items-center justify-between">
                        <img
                          src={editableConfig.logoDocflix}
                          alt="Docflix preview"
                          className="h-8 max-w-[120px] object-contain"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_DOCFLIX_LOGO;
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeLogo("logoDocflix")}
                          className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors border border-zinc-800 rounded cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="p-3 bg-black/40 rounded-lg border border-zinc-800/60 flex items-center justify-between">
                          <img
                            src={DEFAULT_DOCFLIX_LOGO}
                            alt="Docflix"
                            className="h-6 w-auto object-contain"
                          />
                          <span className="text-[9px] font-mono text-zinc-500 italic">
                            Active Default
                          </span>
                        </div>
                        <label className="flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-lg py-4 bg-black/20 hover:bg-black/40 transition-all cursor-pointer text-center px-4">
                          <Upload className="w-4 h-4 text-zinc-500 mb-1" />
                          <span className="text-[9px] text-zinc-400 font-semibold uppercase tracking-wider">
                            Upload Custom Docflix Logo
                          </span>
                          <span className="text-[8px] text-zinc-500">
                            PNG, SVG or JPEG under 2MB
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleLogoUpload(e, "logoDocflix")}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Mankind logo slot */}
                  <div className="space-y-2 pt-2 border-t border-zinc-800/60">
                    <span className="block text-[11px] uppercase tracking-widest font-mono text-zinc-400">
                      Mankind Logo Slot
                    </span>
                    {isUsableLogo(editableConfig.logoMankind) ? (
                      <div className="p-3 bg-black/60 rounded-lg border border-zinc-800 flex items-center justify-between">
                        <img
                          src={editableConfig.logoMankind}
                          alt="Mankind preview"
                          className="h-8 max-w-[120px] object-contain"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_MANKIND_LOGO;
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeLogo("logoMankind")}
                          className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors border border-zinc-800 rounded cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="p-3 bg-black/40 rounded-lg border border-zinc-800/60 flex items-center justify-between">
                          <img
                            src={DEFAULT_MANKIND_LOGO}
                            alt="Mankind"
                            className="h-8 w-auto object-contain"
                          />
                          <span className="text-[9px] font-mono text-zinc-500 italic">
                            Active Default
                          </span>
                        </div>
                        <label className="flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-lg py-4 bg-black/20 hover:bg-black/40 transition-all cursor-pointer text-center px-4">
                          <Upload className="w-4 h-4 text-zinc-500 mb-1" />
                          <span className="text-[9px] text-zinc-400 font-semibold uppercase tracking-wider">
                            Upload Custom Mankind Logo
                          </span>
                          <span className="text-[8px] text-zinc-500">
                            PNG, SVG or JPEG under 2MB
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleLogoUpload(e, "logoMankind")}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Footer Line */}
                  <div className="pt-2 border-t border-zinc-800/60">
                    <label className="block text-[11px] uppercase tracking-widest font-mono text-zinc-400 mb-2">
                      Footer Subtitle Line
                    </label>
                    <input
                      type="text"
                      value={editableConfig.footerLine}
                      onChange={(e) =>
                        setEditableConfig((prev) => ({
                          ...prev,
                          footerLine: e.target.value,
                        }))
                      }
                      className="w-full bg-black border border-zinc-800 focus:border-[#D4AF37] rounded-lg py-2.5 px-4 text-xs text-white placeholder-zinc-700 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Status Panel & Form Controls */}
            <div className="sticky bottom-0 z-30 bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div>
                {saveError ? (
                  <p className="text-red-400 text-xs font-semibold bg-red-950/20 border border-red-900/30 py-1.5 px-3 rounded-lg">
                    {saveError}
                  </p>
                ) : saveSuccess ? (
                  <p className="text-emerald-400 text-xs font-semibold bg-emerald-950/20 border border-emerald-900/30 py-1.5 px-3 rounded-lg">
                    Campaign updated successfully.
                  </p>
                ) : (
                  <p className="text-zinc-400 text-xs font-mono">
                    Edit campaign details and click Update Campaign to update.
                  </p>
                )}
              </div>

              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setEditableConfig({ ...savedConfig });
                    setSaveError("");
                    setSaveSuccess(false);
                  }}
                  disabled={isUpdatingCampaign || !hasUnsavedChanges}
                  className="w-full sm:w-auto px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold rounded-lg transition-colors border border-zinc-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingCampaign || !hasUnsavedChanges}
                  className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-[#FFE07D] to-[#AA7C11] hover:from-[#FFF0A0] hover:to-[#D4AF37] text-black font-semibold uppercase tracking-widest text-xs rounded-lg transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdatingCampaign ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 text-black animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5 text-black" />
                      <span>Update Campaign</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </main>

      {showStatusConfirm && enabled !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={closeStatusConfirm}
        >
          <div
            className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="status-confirm-title"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <h2
                id="status-confirm-title"
                className="text-base font-bold text-white"
              >
                {enabled ? "Unpublish Campaign" : "Publish Campaign"}
              </h2>
              <button
                type="button"
                onClick={closeStatusConfirm}
                disabled={isToggling}
                className="p-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <p className="text-sm text-zinc-300 leading-relaxed">
                {enabled
                  ? "Are you sure you want to unpublish this campaign? Once unpublished, it will be hidden from all users."
                  : "Are you sure you want to publish this campaign? Once published, it will be visible to all users."}
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeStatusConfirm}
                  disabled={isToggling}
                  className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold rounded-lg transition-colors border border-zinc-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmToggleStatus}
                  disabled={isToggling}
                  className={`flex-1 px-4 py-2.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 ${
                    enabled
                      ? "bg-red-900 hover:bg-red-800 text-white border border-red-800/50"
                      : "bg-gradient-to-r from-[#FFE07D] to-[#AA7C11] hover:from-[#FFF0A0] hover:to-[#D4AF37] text-black"
                  }`}
                >
                  {isToggling ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    "Yes"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
