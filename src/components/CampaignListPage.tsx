import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Eye,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Palette,
  Plus,
  RefreshCw,
  Share2,
  Sparkles,
  Trash2,
  Upload,
  Users,
  X,
  Copy,
  CircleHelp,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { PUBLIC_APP_URL } from "../store/config";
import {
  createCampaign,
  fetchCampaignsList,
  restoreCampaignsListPage,
} from "../store/slices/campaignSlice";
import type {
  CampaignListItem,
  CampaignsListResponse,
} from "../types/campaign";

const MASTER_PASSWORD = "wsl_docflix@123";
const ADMIN_SESSION_KEY = "docflix_admin_authenticated";
const ADMIN_AUTH_CHANNEL = "docflix_admin_auth";

/** Current local date/time as `YYYY-MM-DDTHH:mm` for datetime-local `min`. */
const getLocalDateTimeMin = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
};

const inputClass =
  "w-full bg-black border border-zinc-800 focus:border-[#D4AF37] rounded-lg py-2.5 px-4 text-xs text-white placeholder-zinc-700 outline-none transition-all";

interface CreateFormState {
  headline: string;
  series: string;
  tagline: string;
  honoree: string;
  honoreeCredentials: string;
  dateTime: string;
  venue: string;
  footerLine: string;
  availabilityOptions: string[];
  accentColor: string;
  primaryColor: string;
  secondaryColor: string;
  logoDocflix: string;
  logoMankind: string;
  countdownTarget: string;
}

const defaultCreateForm = (): CreateFormState => ({
  headline: "",
  series: "Docflix WCL",
  tagline: "",
  honoree: "",
  honoreeCredentials: "",
  dateTime: "",
  venue: "",
  footerLine: "By invitation only",
  availabilityOptions: ["Not interested", "Interested"],
  accentColor: "#D4AF37",
  primaryColor: "#7a0c1e",
  secondaryColor: "#0a192f",
  logoDocflix: "",
  logoMankind: "",
  countdownTarget: "",
});

const getCampaignShareUrl = (campaignId: string) =>
  `${PUBLIC_APP_URL}/${campaignId}`;

export default function CampaignListPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {
    campaignsList,
    isCampaignsListLoading,
    campaignsListError,
    isCreatingCampaign,
    createCampaignError,
  } = useAppSelector((state) => state.campaign);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] =
    useState<CreateFormState>(defaultCreateForm);
  const [newOptionInput, setNewOptionInput] = useState("");
  const [localCreateError, setLocalCreateError] = useState("");
  const [shareCampaign, setShareCampaign] = useState<CampaignListItem | null>(
    null,
  );
  const [shareSuccess, setShareSuccess] = useState(false);
  const [pageCache, setPageCache] = useState<CampaignsListResponse[]>([]);

  const campaigns = campaignsList?.items ?? [];
  const nextCursor = campaignsList?.nextCursor ?? null;
  const hasMore = campaignsList?.hasMore ?? false;

  const loadCampaigns = () => {
    setPageCache([]);
    dispatch(fetchCampaignsList());
  };

  const handleNextPage = () => {
    if (!nextCursor || !campaignsList) return;

    setPageCache((prev) => [...prev, campaignsList]);
    dispatch(fetchCampaignsList({ cursor: nextCursor }));
  };

  const handlePreviousPage = () => {
    if (pageCache.length === 0) return;

    const previousPages = [...pageCache];
    const previousPage = previousPages.pop()!;
    setPageCache(previousPages);
    dispatch(restoreCampaignsListPage(previousPage));
  };

  useEffect(() => {
    if (sessionStorage.getItem(ADMIN_SESSION_KEY) === "true") {
      setIsAuthenticated(true);
      loadCampaigns();
    }
  }, [dispatch]);

  const verifyPassword = (pass: string) => {
    if (pass === MASTER_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
      setLoginError("");
      loadCampaigns();
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
  };

  const openCreateModal = () => {
    setCreateForm(defaultCreateForm());
    setNewOptionInput("");
    setLocalCreateError("");
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    if (isCreatingCampaign) return;
    setShowCreateModal(false);
    setLocalCreateError("");
  };

  const openShareModal = (campaign: CampaignListItem) => {
    setShareCampaign(campaign);
    setShareSuccess(false);
  };

  const closeShareModal = () => {
    setShareCampaign(null);
    setShareSuccess(false);
  };

  const shareUrl = shareCampaign ? getCampaignShareUrl(shareCampaign.id) : "";

  const handleWhatsAppShare = () => {
    if (!shareUrl) return;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareUrl)}`,
      "_blank",
      "noopener,noreferrer",
    );
    setShareSuccess(true);
  };

  const updateForm = <K extends keyof CreateFormState>(
    key: K,
    value: CreateFormState[K],
  ) => {
    setCreateForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddOption = () => {
    const trimmed = newOptionInput.trim();
    if (!trimmed || createForm.availabilityOptions.includes(trimmed)) return;
    updateForm("availabilityOptions", [
      ...createForm.availabilityOptions,
      trimmed,
    ]);
    setNewOptionInput("");
  };

  const handleRemoveOption = (opt: string) => {
    if (createForm.availabilityOptions.length <= 1) return;
    updateForm(
      "availabilityOptions",
      createForm.availabilityOptions.filter((o) => o !== opt),
    );
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
      updateForm(slot, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalCreateError("");

    if (
      !createForm.headline.trim() ||
      !createForm.series.trim() ||
      !createForm.honoree.trim() ||
      !createForm.dateTime.trim() ||
      !createForm.venue.trim() ||
      !createForm.countdownTarget.trim()
    ) {
      setLocalCreateError("Please fill in all required fields.");
      return;
    }

    const availabilityOptions = createForm.availabilityOptions.reduce<
      Record<string, string>
    >((acc, opt, index) => {
      acc[String(index)] = opt;
      return acc;
    }, {});

    const countdownTarget = createForm.countdownTarget.includes("T")
      ? createForm.countdownTarget.length === 16
        ? `${createForm.countdownTarget}:00`
        : createForm.countdownTarget
      : createForm.countdownTarget;

    try {
      const campaign = await dispatch(
        createCampaign({
          headline: createForm.headline.trim(),
          series: createForm.series.trim(),
          tagline: createForm.tagline.trim(),
          honoree: createForm.honoree.trim(),
          honoreeCredentials: createForm.honoreeCredentials.trim(),
          dateTime: createForm.dateTime.trim(),
          venue: createForm.venue.trim(),
          footerLine: createForm.footerLine.trim(),
          availabilityOptions,
          accentColor: createForm.accentColor,
          primaryColor: createForm.primaryColor,
          secondaryColor: createForm.secondaryColor,
          logoDocflix: createForm.logoDocflix,
          logoMankind: createForm.logoMankind,
          countdownTarget,
        }),
      ).unwrap();

      setShowCreateModal(false);
      loadCampaigns();
      navigate(`/admin/campaign/${campaign.id}`);
    } catch {
      // Error is stored in Redux state.
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 text-white font-sans">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center border border-[#D4AF37]/30 text-[#D4AF37] mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold font-sans tracking-wide">
              Docflix Admin Console
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Please enter the master password to view campaigns.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="campaign-list-password"
                className="block text-xs uppercase tracking-widest text-gray-400 font-mono mb-2"
              >
                Master Password
              </label>
              <input
                id="campaign-list-password"
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
              type="button"
              onClick={() => navigate("/")}
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <header className="sticky top-0 z-40 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800/80 px-4 py-4 md:px-8 shadow-md">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-800 border border-[#D4AF37]/20 rounded-lg flex items-center justify-center font-cinzel font-black text-white text-base">
              DC
            </div>
            <div>
              <h1 className="text-base font-bold tracking-wide">
                Docflix Campaigns
              </h1>
              <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                Select a campaign to manage
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLogout}
              className="px-3.5 py-1.5 bg-red-950/40 hover:bg-red-900/40 text-red-400 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 border border-red-900/20 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-8 mt-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-zinc-400 text-sm">
            <Users className="w-4 h-4" />
            <span>All Campaigns</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openCreateModal}
              className="px-3 py-1.5 bg-gradient-to-r from-[#FFE07D] to-[#AA7C11] hover:from-[#FFF0A0] hover:to-[#D4AF37] text-black text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              New Campaign
            </button>
            <button
              type="button"
              onClick={loadCampaigns}
              disabled={isCampaignsListLoading}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 border border-zinc-700 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isCampaignsListLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {campaignsListError && (
          <div className="mb-6 text-red-400 text-sm text-center font-medium py-3 bg-red-950/20 border border-red-900/30 rounded-lg">
            {campaignsListError}
          </div>
        )}

        {isCampaignsListLoading && !campaignsList ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
            <RefreshCw className="w-8 h-8 animate-spin text-[#D4AF37] mb-3" />
            <p className="text-sm">Loading campaigns...</p>
          </div>
        ) : (
          <div className="space-y-3 pb-16">
            {campaigns.map((campaign) => (
              <button
                key={campaign.id}
                type="button"
                onClick={() => navigate(`/admin/campaign/${campaign.id}`)}
                className="w-full text-left bg-zinc-900 border border-zinc-800 hover:border-[#D4AF37]/40 rounded-xl p-5 transition-all group cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-lg font-bold text-white truncate">
                        {campaign.headline}
                      </h2>
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase shrink-0 ${
                          campaign.enabled
                            ? "bg-emerald-950/40 border border-emerald-800/40 text-emerald-400"
                            : "bg-zinc-800 border border-zinc-700 text-zinc-400"
                        }`}
                      >
                        {campaign.enabled ? "Active" : "Disabled"}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mb-3">
                      {campaign.series}
                    </p>
                    <p className="text-sm text-zinc-300 mb-3">
                      {campaign.honoree}
                    </p>
                    <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {campaign.dateTime}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {campaign.venue}
                      </span>
                      <span className="flex items-center gap-1.5 text-[#FFE07D]">
                        <Sparkles className="w-3.5 h-3.5" />
                        {campaign.interestedCount} interested
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openShareModal(campaign);
                      }}
                      className="p-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-[#FFE07D] rounded-lg transition-colors cursor-pointer"
                      title="Share campaign"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-[#D4AF37] mt-1 transition-colors" />
                  </div>
                </div>
              </button>
            ))}
            {campaigns.length === 0 && !isCampaignsListLoading && (
              <p className="text-center text-zinc-500 py-12 text-sm">
                No campaigns found.
              </p>
            )}

            {/* Pagination */}
            {(campaigns.length > 0 || pageCache.length > 0 || hasMore) && (
              <div className="pt-2 flex items-center justify-between">
                <p className="text-xs text-zinc-400">
                  {campaigns.length > 0
                    ? `Showing ${campaigns.length} campaign${campaigns.length === 1 ? "" : "s"}`
                    : "No campaigns"}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handlePreviousPage}
                    disabled={pageCache.length === 0 || isCampaignsListLoading}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold rounded-lg transition-colors border border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={handleNextPage}
                    disabled={!hasMore || isCampaignsListLoading}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold rounded-lg transition-colors border border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-hide bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold text-white">
                  Create New Campaign
                </h2>
                <a
                  href="/guides/campaign-form-guide.pdf"
                  download="campaign-form-guide.pdf"
                  title="Download the PDF guide explaining each form field"
                  aria-label="Download campaign form field guide (PDF)"
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-[#D4AF37]/40 rounded-lg text-[10px] font-semibold uppercase tracking-wider text-zinc-300 hover:text-[#FFE07D] transition-colors cursor-pointer"
                >
                  <CircleHelp className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Field Guide
                </a>
              </div>
              <button
                type="button"
                onClick={closeCreateModal}
                disabled={isCreatingCampaign}
                className="p-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Headline *">
                  <input
                    type="text"
                    placeholder="e.g. We cordially invite you to"
                    value={createForm.headline}
                    onChange={(e) => updateForm("headline", e.target.value)}
                    className={inputClass}
                    required
                  />
                </Field>
                <Field label="Series *">
                  <input
                    type="text"
                    placeholder="e.g. WHITE COAT LEGENDS"
                    value={createForm.series}
                    onChange={(e) => updateForm("series", e.target.value)}
                    className={inputClass}
                    required
                  />
                </Field>
                <Field label="Tagline">
                  <input
                    type="text"
                    placeholder="e.g. A documentary honoring the visionary journey of"
                    value={createForm.tagline}
                    onChange={(e) => updateForm("tagline", e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Footer Line">
                  <input
                    type="text"
                    placeholder="e.g. By invitation only"
                    value={createForm.footerLine}
                    onChange={(e) => updateForm("footerLine", e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Honoree *">
                  <input
                    type="text"
                    placeholder="e.g. Dr. Milind V. Kirtane"
                    value={createForm.honoree}
                    onChange={(e) => updateForm("honoree", e.target.value)}
                    className={inputClass}
                    required
                  />
                </Field>
                <Field label="Honoree Credentials">
                  <input
                    type="text"
                    placeholder="e.g. Padma Shri Awardee, Consultant ENT Surgeon"
                    value={createForm.honoreeCredentials}
                    onChange={(e) =>
                      updateForm("honoreeCredentials", e.target.value)
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Date & Time Text *">
                  <input
                    type="text"
                    placeholder="e.g. Saturday, 1st August, 07:00 PM onwards"
                    value={createForm.dateTime}
                    onChange={(e) => updateForm("dateTime", e.target.value)}
                    className={inputClass}
                    required
                  />
                </Field>
                <Field label="Countdown Target *">
                  <input
                    type="datetime-local"
                    min={getLocalDateTimeMin()}
                    value={createForm.countdownTarget}
                    onChange={(e) =>
                      updateForm("countdownTarget", e.target.value)
                    }
                    className={`${inputClass} cursor-pointer`}
                    required
                  />
                </Field>
                <Field label="Venue *" className="md:col-span-2">
                  <input
                    type="text"
                    placeholder="e.g. Grand Ballroom, JW Marriott Sahar, Mumbai"
                    value={createForm.venue}
                    onChange={(e) => updateForm("venue", e.target.value)}
                    className={inputClass}
                    required
                  />
                </Field>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3">
                <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#D4AF37]" /> Theme Palette
                </h3>
                <ColorField
                  label="Accent / Gold Highlight"
                  value={createForm.accentColor}
                  onChange={(value) => updateForm("accentColor", value)}
                />
                <ColorField
                  label="Left Gradient (Primary Deep Crimson)"
                  value={createForm.primaryColor}
                  onChange={(value) => updateForm("primaryColor", value)}
                />
                <ColorField
                  label="Right Gradient (Secondary Deep Navy)"
                  value={createForm.secondaryColor}
                  onChange={(value) => updateForm("secondaryColor", value)}
                />
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3">
                <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#D4AF37]" /> Availability
                  Options
                </h3>
                <div className="flex flex-wrap gap-2">
                  {createForm.availabilityOptions.map((opt) => (
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
                    placeholder="e.g. Tentative, Maybe"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LogoField
                  label="Docflix Logo"
                  value={createForm.logoDocflix}
                  onUpload={(e) => handleLogoUpload(e, "logoDocflix")}
                  onRemove={() => updateForm("logoDocflix", "")}
                />
                <LogoField
                  label="Mankind Logo"
                  value={createForm.logoMankind}
                  onUpload={(e) => handleLogoUpload(e, "logoMankind")}
                  onRemove={() => updateForm("logoMankind", "")}
                />
              </div>

              {(localCreateError || createCampaignError) && (
                <div className="text-red-400 text-xs text-center font-medium py-2 bg-red-950/20 border border-red-900/30 rounded-lg">
                  {localCreateError || createCampaignError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  disabled={isCreatingCampaign}
                  className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold rounded-lg transition-colors border border-zinc-700 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingCampaign}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#FFE07D] to-[#AA7C11] hover:from-[#FFF0A0] hover:to-[#D4AF37] text-black text-xs font-semibold uppercase tracking-widest rounded-lg transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isCreatingCampaign ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Campaign"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {shareCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <ShareCampaignModal
            shareCampaign={shareCampaign}
            shareUrl={shareUrl}
            shareSuccess={shareSuccess}
            onClose={closeShareModal}
            onWhatsAppShare={handleWhatsAppShare}
            onEmailShare={() => setShareSuccess(true)}
          />
        </div>
      )}
    </div>
  );
}

function ShareCampaignModal({
  shareCampaign,
  shareUrl,
  shareSuccess,
  onClose,
  onWhatsAppShare,
  onEmailShare,
}: {
  shareCampaign: CampaignListItem;
  shareUrl: string;
  shareSuccess: boolean;
  onClose: () => void;
  onWhatsAppShare: () => void;
  onEmailShare: () => void;
}) {
  // const subject = `${shareCampaign.headline} - RSVP Invitation`;
  // const body = `You're invited! RSVP here:\n\n${shareUrl}`;
  const subject = `Invitation to ${shareCampaign.headline} | RSVP`;

  const body = `Hello dear,

You are cordially invited to attend "${shareCampaign.headline}".

Please confirm your attendance by completing your RSVP using the link below:

${shareUrl}

We look forward to your presence.

Best regards,
Docflix Team`;
  const gmailHref = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl">
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <h2 className="text-base font-bold text-white">Share Campaign</h2>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 space-y-5">
        <div>
          <p className="text-sm font-semibold text-white mb-1">
            {shareCampaign.headline}
          </p>
          <p className="text-xs text-zinc-400">{shareCampaign.honoree}</p>
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-widest font-mono text-zinc-400 mb-2">
            Campaign Link
          </label>

          <div className="relative">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="w-full bg-black border border-zinc-800 rounded-lg py-2.5 pl-4 pr-12 text-xs text-zinc-300 font-mono"
            />

            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(shareUrl)}
              className="absolute inset-y-0 right-3 flex items-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Copy Link"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        {shareSuccess && (
          <div className="text-emerald-400 text-xs text-center font-medium py-2.5 bg-emerald-950/20 border border-emerald-900/30 rounded-lg flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Campaign link shared successfully!
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onWhatsAppShare}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            Share on WhatsApp
          </button>
          <a
            href={gmailHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onEmailShare}
            className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 border border-zinc-700 cursor-pointer"
          >
            <Mail className="w-4 h-4" />
            Share via Email
          </a>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-[11px] uppercase tracking-widest font-mono text-zinc-400 mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-widest font-mono text-zinc-400 mb-1.5">
        {label}
      </label>
      <div className="flex gap-2 items-center">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded border border-zinc-800 bg-transparent cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-grow bg-black border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
        />
      </div>
    </div>
  );
}

function LogoField({
  label,
  value,
  onUpload,
  onRemove,
}: {
  label: string;
  value: string;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2">
      <span className="block text-[11px] uppercase tracking-widest font-mono text-zinc-400">
        {label}
      </span>
      {value ? (
        <div className="p-3 bg-black/60 rounded-lg border border-zinc-800 flex items-center justify-between">
          <img
            src={value}
            alt={label}
            className="h-8 max-w-[120px] object-contain"
          />
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors border border-zinc-800 rounded cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-lg py-4 bg-black/20 hover:bg-black/40 transition-all cursor-pointer text-center px-4">
          <Upload className="w-4 h-4 text-zinc-500 mb-1" />
          <span className="text-[9px] text-zinc-400 font-semibold uppercase tracking-wider">
            Upload Logo
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={onUpload}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}
