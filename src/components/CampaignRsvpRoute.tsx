import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import RsvpPage from "./RsvpPage";
import NotFoundPage from "./NotFoundPage";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchCampaignDetails } from "../store/slices/campaignSlice";

const ADMIN_SESSION_KEY = "docflix_admin_authenticated";
const ADMIN_AUTH_CHANNEL = "docflix_admin_auth";

export default function CampaignRsvpRoute({
  isPreview = false,
}: {
  isPreview?: boolean;
}) {
  const { campaignId } = useParams<{ campaignId: string }>();

  // const { campaignId: routeCampaignId } = useParams<{ campaignId: string }>();
  // const campaignId = routeCampaignId ?? "V3eMmpPLejNCn2S1EDbrJ";

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isCampaignLoading, isCampaignError, campaignData } = useAppSelector(
    (state) => state.campaign,
  );
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(
    () => sessionStorage.getItem(ADMIN_SESSION_KEY) === "true",
  );

  useEffect(() => {
    if (!isPreview) return;

    const channel = new BroadcastChannel(ADMIN_AUTH_CHANNEL);
    channel.onmessage = (event) => {
      if (event.data?.type === "logout") {
        sessionStorage.removeItem(ADMIN_SESSION_KEY);
        setIsAdminAuthenticated(false);
      }
    };

    return () => channel.close();
  }, [isPreview]);

  useEffect(() => {
    if (!campaignId) return;
    if (isPreview && !isAdminAuthenticated) return;
    dispatch(fetchCampaignDetails(campaignId));
  }, [campaignId, dispatch, isPreview, isAdminAuthenticated]);

  if (isPreview && !isAdminAuthenticated) {
    return <Navigate to="/admin/campaign" replace />;
  }

  if (!campaignId) {
    return <NotFoundPage />;
  }

  if (isCampaignLoading && (!campaignData || campaignData.id !== campaignId)) {
    return (
      <div className="min-h-screen bg-[#070104] flex flex-col items-center justify-center text-white font-sans">
        <RefreshCw className="w-10 h-10 animate-spin text-[#D4AF37] mb-4" />
        <p className="text-sm tracking-wider uppercase font-mono text-[#FFE07D]">
          Curating Grand Premiere...
        </p>
      </div>
    );
  }

  if (isCampaignError || !campaignData || campaignData.id !== campaignId) {
    return <NotFoundPage />;
  }

  if (!isPreview && !campaignData.enabled) {
    return (
      <NotFoundPage
        title="Campaign Not Available"
        message="This campaign is currently disabled and is not accepting RSVPs."
        hint="Please contact the admin."
      />
    );
  }

  return (
    <RsvpPage
      isPreview={isPreview}
      onAdminClick={() => navigate("/admin/campaign")}
    />
  );
}
