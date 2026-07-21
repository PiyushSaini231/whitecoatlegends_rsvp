import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calendar,
  MapPin,
  Phone,
  User,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { submitRsvp } from "../store/slices/rsvpSlice";
import {
  DEFAULT_DOCFLIX_LOGO,
  DEFAULT_MANKIND_LOGO,
  isUsableLogo,
} from "../utils/mapCampaignToEventConfig";

interface RsvpPageProps {
  onAdminClick: () => void;
  isPreview?: boolean;
}

export default function RsvpPage({
  onAdminClick,
  isPreview = false,
}: RsvpPageProps) {
  const dispatch = useAppDispatch();
  const campaignData = useAppSelector((state) => state.campaign.campaignData);
  const isRsvpLoading = useAppSelector((state) => state.rsvp.isRsvpLoading);

  const availabilityOptions = useMemo(() => {
    const opts = campaignData?.availabilityOptions ?? {};
    // Positive option (key "1") first, then the rest in key order
    return Object.entries(opts).sort(([a], [b]) => {
      if (a === "1") return -1;
      if (b === "1") return 1;
      return Number(a) - Number(b);
    });
  }, [campaignData?.availabilityOptions]);

  const defaultAvailabilityKey =
    availabilityOptions.find(([key]) => key === "1")?.[0] ??
    availabilityOptions[0]?.[0] ??
    "1";

  // Function to display the webinar page for users expected to attend.
  // const attendingCount = useMemo(() => {
  //   const actual = campaignData?.interestedCount;

  //   if (actual == null) return null;

  //   const DISPLAY_KEY = "attending_display";
  //   const ACTUAL_KEY = "attending_actual";

  //   const storedDisplay = parseInt(
  //     localStorage.getItem(DISPLAY_KEY) || "0",
  //     10,
  //   );
  //   const storedActual = parseInt(localStorage.getItem(ACTUAL_KEY) || "-1", 10);

  //   let display = storedDisplay;

  //   // First time
  //   if (storedActual === -1) {
  //     const random = Math.floor(Math.random() * 10) + 45; // 45-54

  //     display = actual < 50 ? actual + random : actual + random;
  //   } else if (actual > storedActual) {
  //     // Backend count increased
  //     display = storedDisplay + (actual - storedActual);
  //   } else if (actual > display) {
  //     // Safety: never show less than backend
  //     display = actual + 5;
  //   }

  //   localStorage.setItem(DISPLAY_KEY, String(display));
  //   localStorage.setItem(ACTUAL_KEY, String(actual));

  //   return display;
  // }, [campaignData?.interestedCount]);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    availability: defaultAvailabilityKey,
  });

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isOver: false,
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [submittedName, setSubmittedName] = useState("");
  const [submittedAvailability, setSubmittedAvailability] = useState("");

  useEffect(() => {
    if (!isSuccess) return;
    const timer = setTimeout(() => setIsSuccess(false), 5000);
    return () => clearTimeout(timer);
  }, [isSuccess]);

  useEffect(() => {
    if (!campaignData?.countdownTarget) return;

    const calculateTimeLeft = () => {
      const target = new Date(campaignData.countdownTarget).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft((prev) =>
          prev.isOver
            ? prev
            : { days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true },
        );
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft((prev) => {
        if (
          prev.days === days &&
          prev.hours === hours &&
          prev.minutes === minutes &&
          prev.seconds === seconds &&
          !prev.isOver
        ) {
          return prev;
        }
        return { days, hours, minutes, seconds, isOver: false };
      });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!campaignData) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPreview) return;
    setErrorMsg("");

    const name = formData.name.trim();
    if (!name || !/^[a-zA-Z\s]+$/.test(name)) {
      setErrorMsg("Full name can contain only alphabets and spaces.");
      return;
    }

    const cleanPhone = formData.phone.replace(/\D/g, "");

    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      setErrorMsg("Phone number must be between 10 and 15 digits.");
      return;
    }

    // Reject numbers like 0000000000, 1111111111, etc.
    if (/^(\d)\1+$/.test(cleanPhone)) {
      setErrorMsg("Please enter a valid phone number.");
      return;
    }

    try {
      const selectedLabel =
        campaignData.availabilityOptions[formData.availability] ??
        formData.availability;

      const data = await dispatch(
        submitRsvp({
          name,
          phone: cleanPhone,
          availability: Number(formData.availability),
          campaignId: campaignData.id,
        }),
      ).unwrap();

      if (data.success) {
        setSubmittedName(formData.name);
        setSubmittedAvailability(selectedLabel);
        setIsSuccess(true);
        setFormData({
          name: "",
          phone: "",
          availability: defaultAvailabilityKey,
        });
      } else {
        setErrorMsg(data.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setErrorMsg(
        typeof err === "string"
          ? err
          : "Connection error. Please check your internet and try again.",
      );
    }
  };

  // Sparkles generator for theater background effect
  const sparkles = [
    { id: 1, top: "15%", left: "12%", delay: 0, scale: 0.6 },
    { id: 2, top: "25%", left: "85%", delay: 1.5, scale: 0.8 },
    { id: 3, top: "45%", left: "5%", delay: 0.8, scale: 0.5 },
    { id: 4, top: "60%", left: "90%", delay: 2.2, scale: 0.7 },
    { id: 5, top: "75%", left: "15%", delay: 1.1, scale: 0.6 },
    { id: 6, top: "85%", left: "80%", delay: 1.9, scale: 0.5 },
    { id: 7, top: "10%", left: "70%", delay: 2.5, scale: 0.8 },
    { id: 8, top: "50%", left: "50%", delay: 3.0, scale: 0.4 },
  ];

  return (
    <div
      id="public-rsvp-root"
      className={`min-h-screen relative flex flex-col items-center justify-between text-white overflow-x-hidden selection:bg-[#D4AF37] selection:text-black px-4 font-sans ${
        isPreview ? "pt-14 pb-8" : "py-8"
      }`}
      style={{
        background: `radial-gradient(circle at 30% 20%, ${campaignData.primaryColor} 0%, ${campaignData.secondaryColor} 70%)`,
      }}
    >
      {isPreview && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 border-b border-[#D4AF37]/40 px-4 py-2 text-center backdrop-blur-sm">
          <p className="text-[11px] uppercase tracking-widest font-mono text-[#FFE07D]">
            Admin Preview — RSVP submissions are disabled
          </p>
        </div>
      )}

      {/* Repeating background watermark of series title */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0 opacity-[0.025]">
        <div className="absolute w-[200%] h-[200%] -top-1/2 -left-1/2 transform -rotate-12 flex flex-wrap gap-x-24 gap-y-16 justify-center items-center content-center text-4xl md:text-5xl font-extrabold uppercase tracking-widest font-oswald">
          {Array.from({ length: 40 }).map((_, i) => (
            <span key={i} className="whitespace-nowrap select-none">
              {campaignData.series}
            </span>
          ))}
        </div>
      </div>

      {/* Elegant Sparkles Twinkling */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {sparkles.map((sp) => (
          <motion.div
            key={sp.id}
            className="absolute text-yellow-300 opacity-60"
            style={{ top: sp.top, left: sp.left }}
            animate={{
              scale: [0, sp.scale, 0],
              opacity: [0, 0.7, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: sp.delay,
              ease: "easeInOut",
            }}
          >
            <Sparkles className="w-5 h-5 fill-current text-[#FFE07D]" />
          </motion.div>
        ))}
      </div>

      {/* Curtains Frame and Gold Ribbon SVG */}
      <div className="absolute top-0 left-0 right-0 h-40 md:h-48 pointer-events-none z-10 overflow-hidden">
        <svg
          viewBox="0 0 1000 180"
          preserveAspectRatio="none"
          className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
        >
          <defs>
            <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFE07D" />
              <stop offset="25%" stopColor="#D4AF37" />
              <stop offset="50%" stopColor="#AA7C11" />
              <stop offset="75%" stopColor="#FFE07D" />
              <stop offset="100%" stopColor="#AA7C11" />
            </linearGradient>
            <linearGradient
              id="red-curtain-grad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#1a0003" />
              <stop offset="30%" stopColor="#54050f" />
              <stop offset="50%" stopColor="#2c0106" />
              <stop offset="75%" stopColor="#690614" />
              <stop offset="100%" stopColor="#1a0003" />
            </linearGradient>
            <linearGradient
              id="blue-curtain-grad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#020914" />
              <stop offset="30%" stopColor="#102d54" />
              <stop offset="50%" stopColor="#041226" />
              <stop offset="75%" stopColor="#184275" />
              <stop offset="100%" stopColor="#020914" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Left Curtain Drape (Red Velvet Folds) */}
          <path
            d="M 0 0 L 0 140 Q 150 160 300 110 Q 420 80 500 90 L 500 0 Z"
            fill="url(#red-curtain-grad)"
          />
          {/* Right Curtain Drape (Blue Velvet Folds) */}
          <path
            d="M 500 0 L 500 90 Q 580 80 700 110 Q 850 160 1000 140 L 1000 0 Z"
            fill="url(#blue-curtain-grad)"
          />

          {/* Subtle Vertical fold lines */}
          <path
            d="M 100 0 L 100 130"
            stroke="#000"
            strokeWidth="2"
            opacity="0.4"
          />
          <path
            d="M 220 0 L 220 120"
            stroke="#000"
            strokeWidth="2"
            opacity="0.4"
          />
          <path
            d="M 320 0 L 320 110"
            stroke="#000"
            strokeWidth="2"
            opacity="0.4"
          />
          <path
            d="M 680 0 L 680 110"
            stroke="#000"
            strokeWidth="2"
            opacity="0.4"
          />
          <path
            d="M 780 0 L 780 120"
            stroke="#000"
            strokeWidth="2"
            opacity="0.4"
          />
          <path
            d="M 900 0 L 900 130"
            stroke="#000"
            strokeWidth="2"
            opacity="0.4"
          />

          {/* Golden Ribbon Swirl Path 1 */}
          <path
            d="M -10 60 C 80 50, 150 150, 240 100 C 330 50, 420 140, 500 90 C 580 40, 670 140, 760 100 C 850 60, 920 150, 1010 60"
            fill="none"
            stroke="url(#gold-grad)"
            strokeWidth="6"
            filter="url(#glow)"
          />
          {/* Golden Ribbon Swirl Path 2 (Behind/Offset) */}
          <path
            d="M -20 80 C 70 80, 140 120, 250 80 C 350 40, 430 110, 500 70 C 570 110, 650 40, 750 80 C 860 120, 930 80, 1020 80"
            fill="none"
            stroke="url(#gold-grad)"
            strokeWidth="3.5"
            opacity="0.8"
          />

          {/* Hanging Gold Tassels left and right */}
          <circle cx="15" cy="142" r="5" fill="url(#gold-grad)" />
          <line
            x1="15"
            y1="135"
            x2="15"
            y2="140"
            stroke="url(#gold-grad)"
            strokeWidth="2"
          />
          <circle cx="985" cy="142" r="5" fill="url(#gold-grad)" />
          <line
            x1="985"
            y1="135"
            x2="985"
            y2="140"
            stroke="url(#gold-grad)"
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* Side Curtains to frame the content on wide screens */}
      <div
        className="hidden lg:block absolute top-0 left-0 bottom-0 w-16 pointer-events-none z-10"
        style={{
          background: `linear-gradient(90deg, #110002 0%, ${campaignData.primaryColor} 60%, rgba(0,0,0,0.8) 100%)`,
          boxShadow: "5px 0 15px rgba(0,0,0,0.5)",
        }}
      >
        <div
          className="w-full h-full opacity-20"
          style={{
            background:
              "repeating-linear-gradient(90deg, transparent, transparent 10px, #000 10px, #000 20px)",
          }}
        />
      </div>
      <div
        className="hidden lg:block absolute top-0 right-0 bottom-0 w-16 pointer-events-none z-10"
        style={{
          background: `linear-gradient(270deg, #01040a 0%, ${campaignData.secondaryColor} 60%, rgba(0,0,0,0.8) 100%)`,
          boxShadow: "-5px 0 15px rgba(0,0,0,0.5)",
        }}
      >
        <div
          className="w-full h-full opacity-20"
          style={{
            background:
              "repeating-linear-gradient(90deg, transparent, transparent 10px, #000 10px, #000 20px)",
          }}
        />
      </div>

      {/* Header and Brand Indicator */}
      <header className="w-full max-w-lg flex flex-col items-center text-center z-10 mt-14 md:mt-18">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-black/40 border border-[#D4AF37]/30 rounded-full backdrop-blur-md mb-6 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse"></span>
          <span className="text-[10px] md:text-xs font-medium tracking-[0.25em] text-[#FFE07D] uppercase font-mono">
            Exclusive Doctor Premiere
          </span>
        </div>
      </header>

      {/* Invitation Content Card - Portrait aspect & gorgeous typography */}
      <main className="w-full max-w-lg flex flex-col items-center z-10 my-4">
        <motion.div
          id="invitation-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="w-full flex flex-col items-center text-center px-6 py-8 md:px-8 md:py-10 rounded-2xl relative"
        >
          {/* Small intro line */}
          <p className="text-[11px] md:text-[13px] tracking-[0.25em] text-[#FFFDD0] font-light uppercase opacity-90 mb-2">
            {campaignData.headline.split(" A GRAND PREMIERE")[0]}
          </p>

          {/* Headline - "A GRAND PREMIERE" */}
          <h2 className="text-xl md:text-2xl font-bold tracking-[0.3em] text-white uppercase mb-5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            A GRAND PREMIERE
          </h2>

          {/* Series title - art-deco / marquee gold gradient text */}
          <h1
            id="series-title"
            className="text-4xl sm:text-5xl md:text-[5.5rem] font-black leading-none uppercase tracking-wider font-oswald text-transparent bg-clip-text bg-gradient-to-b from-[#FFFDD0] via-[#D4AF37] to-[#805C00] drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] mb-6 select-none"
            style={{
              fontStretch: "condensed",
            }}
          >
            {campaignData.series}
          </h1>

          {/* Gold divider flourish */}
          <div className="flex items-center justify-center gap-4 w-full max-w-[280px] mb-6">
            <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent to-[#D4AF37]"></div>
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 text-[#D4AF37] fill-current"
            >
              <path
                d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm1,14.5a1,1,0,1,1-2,0v-5a1,1,0,0,1,2,0Zm-1-7.25a1.13,1.13,0,1,1,1.13-1.13A1.13,1.13,0,0,1,12,9.25Z"
                className="hidden"
              />
              {/* Classical flourish shape */}
              <path d="M12 2 C11.5 5, 9 7, 6 7 C9 7, 11 9, 11.5 12 C12 9, 14 7, 17 7 C14 7, 12.5 5, 12 2" />
            </svg>
            <div className="h-[1px] flex-grow bg-gradient-to-l from-transparent to-[#D4AF37]"></div>
          </div>

          {/* Tagline */}
          <p className="text-xs md:text-sm font-light text-gray-300 italic max-w-xs mb-3">
            {campaignData.tagline}
          </p>

          {/* Honoree Name in Serif Elegant Italic */}
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-serif italic text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-tight tracking-wide mb-3 font-medium">
            {campaignData.honoree.trim().toLowerCase().startsWith("dr.")
              ? campaignData.honoree
              : `Dr. ${campaignData.honoree}`}
          </h3>

          {/* Credentials */}
          <p className="text-xs md:text-sm font-normal text-gray-200 max-w-sm leading-relaxed tracking-wide mb-8">
            {campaignData.honoreeCredentials}
          </p>

          {/* Gold divider flourish 2 */}
          <div className="flex items-center justify-center gap-4 w-full max-w-[120px] mb-8">
            <div className="h-[1px] flex-grow bg-[#D4AF37]/50"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></div>
            <div className="h-[1px] flex-grow bg-[#D4AF37]/50"></div>
          </div>

          {/* Event Metadata (Date / Venue) & Map */}
          <div className="w-full grid grid-cols-1 gap-4 text-left max-w-sm bg-black/35 border border-white/5 p-5 rounded-xl backdrop-blur-md mb-8 shadow-inner">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[10px] uppercase tracking-wider text-[#FFE07D] font-medium mb-0.5 font-mono">
                  Date & Time
                </h4>
                <p className="text-xs md:text-sm text-gray-200 font-medium">
                  {campaignData.dateTime}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 border-t border-white/5 pt-3">
              <MapPin className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[10px] uppercase tracking-wider text-[#FFE07D] font-medium mb-0.5 font-mono">
                  Venue
                </h4>
                <p className="text-xs md:text-sm text-gray-200 leading-relaxed">
                  {campaignData.venue}
                </p>
              </div>
            </div>

            {/* Embedded interactive map with gold accents */}
            <div className="mt-2 border border-[#D4AF37]/20 rounded-lg overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
              <iframe
                title="Google Maps Venue Location Pin"
                width="100%"
                height="150"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={`https://maps.google.com/maps?q=${encodeURIComponent(campaignData.venue)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                className="opacity-90 hover:opacity-100 transition-opacity"
              ></iframe>
            </div>
          </div>

          {/* Countdown timer display */}
          <div className="mb-8 w-full max-w-sm">
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#FFE07D]/80 font-mono text-center mb-3">
              COUNTDOWN TO PREMIERE
            </h4>
            {timeLeft.isOver ? (
              <div className="py-2.5 px-4 bg-black/40 border border-[#D4AF37]/40 rounded-lg text-center backdrop-blur-sm">
                <span className="text-xs md:text-sm font-semibold text-[#FFE07D] uppercase tracking-wider animate-pulse">
                  Premiere Commenced &bull; Event is Live
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { label: "DAYS", val: timeLeft.days },
                  { label: "HRS", val: timeLeft.hours },
                  { label: "MINS", val: timeLeft.minutes },
                  { label: "SECS", val: timeLeft.seconds },
                ].map((col, idx) => (
                  <div
                    key={idx}
                    className="bg-black/40 border border-white/10 rounded-lg py-2.5 px-1 backdrop-blur-md shadow-[0_4px_8px_rgba(0,0,0,0.3)]"
                  >
                    <span className="block text-lg md:text-2xl font-bold font-mono text-white leading-none">
                      {String(col.val).padStart(2, "0")}
                    </span>
                    <span className="text-[9px] tracking-wider text-[#FFE07D] block mt-1 font-mono font-medium">
                      {col.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Interactive RSVP Card Container */}
          <div className="w-full max-w-sm relative z-20">
            <AnimatePresence mode="wait">
              {!isSuccess ? (
                <motion.div
                  key="rsvp-form-container"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="bg-gradient-to-b from-[#1c1214] to-[#120f18] p-6 rounded-xl border border-[#D4AF37]/40 shadow-[0_15px_30px_rgba(0,0,0,0.8)] text-left"
                >
                  <h3 className="text-base font-semibold uppercase tracking-wider text-white border-b border-white/10 pb-3 mb-5 flex items-center justify-between font-mono">
                    <span>Confirm Attendance</span>
                    <span className="text-[10px] text-[#D4AF37] font-normal lowercase italic">
                      Rsvp in under 60 seconds
                    </span>
                  </h3>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Live Confirmed Attending Counter */}
                    {campaignData?.interestedCount !== null && (
                      <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-lg p-3 flex items-center gap-2.5 text-xs text-[#FFE07D] font-mono shadow-inner">
                        <Sparkles className="w-4 h-4 text-[#D4AF37] animate-pulse shrink-0" />
                        {(campaignData?.interestedCount ?? 0) > 0 ? (
                          <span className="leading-relaxed">
                            Join{" "}
                            <strong className="text-white font-extrabold">
                              {campaignData?.interestedCount}
                            </strong>{" "}
                            other legend
                            {(campaignData?.interestedCount ?? 0) > 1
                              ? "s"
                              : ""}{" "}
                            already attending!
                          </span>
                        ) : (
                          <span className="leading-relaxed">
                            Be the first to secure your VIP seat!
                          </span>
                        )}
                      </div>
                    )}

                    {/* Name Input */}
                    <div>
                      <label
                        htmlFor="rsvp-name"
                        className="block text-[11px] uppercase tracking-wider text-gray-400 font-medium mb-1.5 font-mono"
                      >
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                        <input
                          id="rsvp-name"
                          type="text"
                          required
                          placeholder="Name Surname"
                          value={formData.name}
                          disabled={isPreview}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              name: e.target.value.replace(/[^a-zA-Z\s]/g, ""),
                            }))
                          }
                          className="w-full bg-black/60 border border-white/15 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 transition-all outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* Phone Input */}
                    <div>
                      <label
                        htmlFor="rsvp-phone"
                        className="block text-[11px] uppercase tracking-wider text-gray-400 font-medium mb-1.5 font-mono"
                      >
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                        <input
                          id="rsvp-phone"
                          type="tel"
                          required
                          placeholder="Phone number"
                          value={formData.phone}
                          disabled={isPreview}
                          onChange={(e) => {
                            const cleaned = e.target.value.replace(
                              /[^\d\s]/g,
                              "",
                            );
                            if (cleaned.replace(/\D/g, "").length <= 15) {
                              setFormData((prev) => ({
                                ...prev,
                                phone: cleaned,
                              }));
                            }
                          }}
                          className="w-full bg-black/60 border border-white/15 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 transition-all outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* Attendance Radio Buttons */}
                    <div className="flex flex-col items-center justify-center">
                      <label className="block text-[11px] uppercase tracking-wider text-gray-400 font-medium mb-3 font-mono text-center">
                        Your Availability
                      </label>
                      <div className="flex justify-center gap-2 w-full">
                        {availabilityOptions.map(([key, label]) => {
                          const isSelected = formData.availability === key;
                          return (
                            <button
                              key={key}
                              type="button"
                              disabled={isPreview}
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  availability: key,
                                }))
                              }
                              className={`flex-1 min-w-0 py-3 px-2 text-xs font-bold rounded-xl text-center border transition-all cursor-pointer disabled:cursor-not-allowed ${
                                isSelected
                                  ? "bg-gradient-to-b from-[#FFE07D] to-[#AA7C11] text-black border-[#FFE07D] shadow-[0_4px_12px_rgba(212,175,55,0.4)] scale-[1.02]"
                                  : "bg-black/50 border-white/10 text-gray-300 hover:border-white/25 hover:bg-black/70"
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      id="submit-rsvp-btn"
                      type="submit"
                      disabled={isPreview || isRsvpLoading}
                      className="w-full bg-gradient-to-b from-[#FFE07D] via-[#D4AF37] to-[#AA7C11] hover:from-[#FFF0A0] hover:to-[#D4AF37] text-black font-semibold uppercase tracking-widest text-xs py-3.5 rounded-lg transition-all shadow-[0_4px_15px_rgba(212,175,55,0.3)] focus:outline-none focus:ring-2 focus:ring-yellow-300 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                    >
                      {isRsvpLoading ? (
                        <>
                          <Clock className="w-4 h-4 animate-spin text-black" />
                          <span>Securing Seat...</span>
                        </>
                      ) : isPreview ? (
                        <span>Preview Only</span>
                      ) : (
                        <span>Submit RSVP</span>
                      )}
                    </button>

                    {/* Form Error Indicator */}
                    {errorMsg && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-xs font-medium bg-red-950/40 border border-red-900/40 px-3 py-2.5 rounded-lg text-center"
                      >
                        {errorMsg}
                      </motion.div>
                    )}
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="rsvp-success-container"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="bg-gradient-to-b from-[#121c15] to-[#0f1418] p-8 rounded-xl border border-green-500/40 shadow-[0_15px_30px_rgba(0,0,0,0.8)] text-center"
                >
                  {!submittedAvailability.toLowerCase().includes("not") && (
                    <>
                      <div className="w-16 h-16 bg-green-950/60 border border-green-500/30 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>

                      <h3 className="text-xl font-bold text-white tracking-wide mb-2 font-serif italic">
                        Your Seat Awaits
                      </h3>

                      <p className="text-xs text-green-400 font-medium font-mono uppercase tracking-widest mb-4">
                        Reservation Secured
                      </p>
                    </>
                  )}
                  <p className="text-sm text-gray-300 leading-relaxed max-w-xs mx-auto">
                    {submittedAvailability.toLowerCase().includes("not") ? (
                      <>
                        Thank you,{" "}
                        <span className="font-semibold text-white">
                          {submittedName}
                        </span>
                        . for letting us know. We appreciate your response. We
                        hope to see you at a future event.
                      </>
                    ) : (
                      <>
                        Thank you,{" "}
                        <span className="font-semibold text-white">
                          {submittedName}
                        </span>
                        . Your RSVP of{" "}
                        <span className="text-[#D4AF37] font-semibold">
                          "{submittedAvailability || "Attending"}"
                        </span>{" "}
                        has been locked into the grand guest ledger.
                      </>
                    )}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>

      {/* Footer Branding - Docflix & Mankind Logos side-by-side */}
      <footer className="w-full max-w-lg flex flex-col items-center z-10 mt-6 border-t border-white/5 pt-8">
        <div className="flex items-center justify-center gap-8">
          {/* Docflix */}
          <div className="flex h-14 items-center justify-center">
            <img
              src={
                isUsableLogo(campaignData.logoDocflix)
                  ? campaignData.logoDocflix
                  : DEFAULT_DOCFLIX_LOGO
              }
              alt="Docflix"
              className="h-6 w-auto object-contain"
              onError={(e) => {
                e.currentTarget.src = DEFAULT_DOCFLIX_LOGO;
              }}
            />
          </div>

          {/* Divider */}
          <div className="h-12 w-px bg-white/15" />

          {/* Mankind */}
          <div className="flex h-14 items-center justify-center rounded-lg px-3 py-2 shadow-sm">
            <img
              src={
                isUsableLogo(campaignData.logoMankind)
                  ? campaignData.logoMankind
                  : DEFAULT_MANKIND_LOGO
              }
              alt="Mankind"
              className="h-12 w-auto object-contain"
              onError={(e) => {
                e.currentTarget.src = DEFAULT_MANKIND_LOGO;
              }}
            />
          </div>
        </div>

        {/* Admin Dashboard Entry Portal */}
        <button
          onClick={onAdminClick}
          className="text-[9px] uppercase tracking-widest text-gray-600 hover:text-white transition-colors cursor-pointer mt-6"
        >
          Admin Console
        </button>
      </footer>
    </div>
  );
}
