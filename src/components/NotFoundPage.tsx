import { AlertCircle } from "lucide-react";

interface NotFoundPageProps {
  title?: string;
  message?: string;
  hint?: string;
}

export default function NotFoundPage({
  title = "Campaign Not Found",
  message = "The invitation link you're trying to access is invalid, expired, or the campaign has been removed.",
  hint = "Please verify the link or contact the campaign organizer for a new invitation.",
}: NotFoundPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#070104] via-[#12040B] to-[#070104] flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-8 text-center shadow-2xl">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
          <AlertCircle className="h-8 w-8 text-red-400" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>

        <p className="mt-4 text-sm leading-6 text-gray-400">{message}</p>

        <p className="mt-2 text-sm text-gray-500">{hint}</p>
      </div>
    </div>
  );
}
