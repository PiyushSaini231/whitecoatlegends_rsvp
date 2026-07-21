import { Routes, Route } from "react-router-dom";
import AdminDashboard from "./components/AdminDashboard";
import CampaignListPage from "./components/CampaignListPage";
import CampaignRsvpRoute from "./components/CampaignRsvpRoute";
import NotFoundPage from "./components/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route path="/admin/campaign" element={<CampaignListPage />} />
      <Route path="/admin/campaign/:campaignId" element={<AdminDashboard />} />
      <Route
        path="/preview/:campaignId"
        element={<CampaignRsvpRoute isPreview />}
      />
      <Route path="/:campaignId" element={<CampaignRsvpRoute />} />
      <Route path="/" element={<NotFoundPage />} />

      {/* <Route path="/" element={<CampaignRsvpRoute />} /> */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
