import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, MapPin, Phone, User, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { EventConfig } from "../types";
import { DocflixLogo, MankindLogo } from "./Logos";

interface RsvpPageProps {
  config: EventConfig;
  onAdminClick: () => void;
}

export default function RsvpPage({ config, onAdminClick }: RsvpPageProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    availability: config.availabilityOptions[0] || "Attending",
  });

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [submittedName, setSubmittedName] = useState("");
  const [attendingCount, setAttendingCount] = useState<number | null>(null);

  // Fetch the confirmed attending count on load
  useEffect(() => {
    const fetchAttendingCount = async () => {
      try {
        const response = await fetch("/api/rsvp/count");
        if (response.ok) {
          const data = await response.json();
          setAttendingCount(data.count);
        }
      } catch (err) {
        console.error("Error fetching attending count", err);
      }
    };
    fetchAttendingCount();
  }, [isSuccess]);

  // Countdown timer logic
  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = new Date(config.countdownTarget).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isOver: false });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [config.countdownTarget]);

  // Set default availability option if options change
  useEffect(() => {
    if (config.availabilityOptions.length > 0 && !config.availabilityOptions.includes(formData.availability)) {
      setFormData((prev) => ({ ...prev, availability: config.availabilityOptions[0] }));
    }
  }, [config.availabilityOptions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    if (!formData.name.trim()) {
      setErrorMsg("Please enter your name.");
      setIsSubmitting(false);
      return;
    }

    const cleanPhone = formData.phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      setErrorMsg("Please enter a valid 10-digit Indian phone number.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: cleanPhone,
          availability: formData.availability,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmittedName(formData.name);
        setIsSuccess(true);
        setFormData({ name: "", phone: "", availability: config.availabilityOptions[0] || "Attending" });
      } else {
        setErrorMsg(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setErrorMsg("Connection error. Please check your internet and try again.");
    } finally {
      setIsSubmitting(false);
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
      className="min-h-screen relative flex flex-col items-center justify-between text-white overflow-x-hidden selection:bg-[#D4AF37] selection:text-black py-8 px-4 font-sans"
      style={{
        background: `radial-gradient(circle at 30% 20%, ${config.primaryColor} 0%, ${config.secondaryColor} 70%)`,
      }}
    >
      {/* Repeating background watermark of series title */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0 opacity-[0.025]">
        <div className="absolute w-[200%] h-[200%] -top-1/2 -left-1/2 transform -rotate-12 flex flex-wrap gap-x-24 gap-y-16 justify-center items-center content-center text-4xl md:text-5xl font-extrabold uppercase tracking-widest font-oswald">
          {Array.from({ length: 40 }).map((_, i) => (
            <span key={i} className="whitespace-nowrap select-none">{config.series}</span>
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
        <svg viewBox="0 0 1000 180" preserveAspectRatio="none" className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
          <defs>
            <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFE07D" />
              <stop offset="25%" stopColor="#D4AF37" />
              <stop offset="50%" stopColor="#AA7C11" />
              <stop offset="75%" stopColor="#FFE07D" />
              <stop offset="100%" stopColor="#AA7C11" />
            </linearGradient>
            <linearGradient id="red-curtain-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1a0003" />
              <stop offset="30%" stopColor="#54050f" />
              <stop offset="50%" stopColor="#2c0106" />
              <stop offset="75%" stopColor="#690614" />
              <stop offset="100%" stopColor="#1a0003" />
            </linearGradient>
            <linearGradient id="blue-curtain-grad" x1="0%" y1="0%" x2="100%" y2="0%">
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
          <path d="M 100 0 L 100 130" stroke="#000" strokeWidth="2" opacity="0.4" />
          <path d="M 220 0 L 220 120" stroke="#000" strokeWidth="2" opacity="0.4" />
          <path d="M 320 0 L 320 110" stroke="#000" strokeWidth="2" opacity="0.4" />
          <path d="M 680 0 L 680 110" stroke="#000" strokeWidth="2" opacity="0.4" />
          <path d="M 780 0 L 780 120" stroke="#000" strokeWidth="2" opacity="0.4" />
          <path d="M 900 0 L 900 130" stroke="#000" strokeWidth="2" opacity="0.4" />

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
          <line x1="15" y1="135" x2="15" y2="140" stroke="url(#gold-grad)" strokeWidth="2" />
          <circle cx="985" cy="142" r="5" fill="url(#gold-grad)" />
          <line x1="985" y1="135" x2="985" y2="140" stroke="url(#gold-grad)" strokeWidth="2" />
        </svg>
      </div>

      {/* Side Curtains to frame the content on wide screens */}
      <div className="hidden lg:block absolute top-0 left-0 bottom-0 w-16 pointer-events-none z-10"
           style={{
             background: `linear-gradient(90deg, #110002 0%, ${config.primaryColor} 60%, rgba(0,0,0,0.8) 100%)`,
             boxShadow: "5px 0 15px rgba(0,0,0,0.5)"
           }}>
        <div className="w-full h-full opacity-20" style={{ background: "repeating-linear-gradient(90deg, transparent, transparent 10px, #000 10px, #000 20px)" }} />
      </div>
      <div className="hidden lg:block absolute top-0 right-0 bottom-0 w-16 pointer-events-none z-10"
           style={{
             background: `linear-gradient(270deg, #01040a 0%, ${config.secondaryColor} 60%, rgba(0,0,0,0.8) 100%)`,
             boxShadow: "-5px 0 15px rgba(0,0,0,0.5)"
           }}>
        <div className="w-full h-full opacity-20" style={{ background: "repeating-linear-gradient(90deg, transparent, transparent 10px, #000 10px, #000 20px)" }} />
      </div>

      {/* Header and Brand Indicator */}
      <header className="w-full max-w-lg flex flex-col items-center text-center z-10 mt-14 md:mt-18">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-black/40 border border-[#D4AF37]/30 rounded-full backdrop-blur-md mb-6 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse"></span>
          <span className="text-[10px] md:text-xs font-medium tracking-[0.25em] text-[#FFE07D] uppercase font-mono">Exclusive Doctor Premiere</span>
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
            {config.headline.split(" A GRAND PREMIERE")[0]}
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
            {config.series}
          </h1>

          {/* Gold divider flourish */}
          <div className="flex items-center justify-center gap-4 w-full max-w-[280px] mb-6">
            <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent to-[#D4AF37]"></div>
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#D4AF37] fill-current">
              <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm1,14.5a1,1,0,1,1-2,0v-5a1,1,0,0,1,2,0Zm-1-7.25a1.13,1.13,0,1,1,1.13-1.13A1.13,1.13,0,0,1,12,9.25Z" className="hidden" />
              {/* Classical flourish shape */}
              <path d="M12 2 C11.5 5, 9 7, 6 7 C9 7, 11 9, 11.5 12 C12 9, 14 7, 17 7 C14 7, 12.5 5, 12 2" />
            </svg>
            <div className="h-[1px] flex-grow bg-gradient-to-l from-transparent to-[#D4AF37]"></div>
          </div>

          {/* Tagline */}
          <p className="text-xs md:text-sm font-light text-gray-300 italic max-w-xs mb-3">
            {config.tagline}
          </p>

          {/* Honoree Name in Serif Elegant Italic */}
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-serif italic text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-tight tracking-wide mb-3 font-medium">
            {config.honoree}
          </h3>

          {/* Credentials */}
          <p className="text-xs md:text-sm font-normal text-gray-200 max-w-sm leading-relaxed tracking-wide mb-8">
            {config.honoreeCredentials}
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
                <h4 className="text-[10px] uppercase tracking-wider text-[#FFE07D] font-medium mb-0.5 font-mono">Date & Time</h4>
                <p className="text-xs md:text-sm text-gray-200 font-medium">{config.dateTime}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 border-t border-white/5 pt-3">
              <MapPin className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[10px] uppercase tracking-wider text-[#FFE07D] font-medium mb-0.5 font-mono">Venue</h4>
                <p className="text-xs md:text-sm text-gray-200 leading-relaxed">{config.venue}</p>
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
                src={`https://maps.google.com/maps?q=${encodeURIComponent(config.venue)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
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
                  <div key={idx} className="bg-black/40 border border-white/10 rounded-lg py-2.5 px-1 backdrop-blur-md shadow-[0_4px_8px_rgba(0,0,0,0.3)]">
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
                    <span className="text-[10px] text-[#D4AF37] font-normal lowercase italic">Rsvp in under 60 seconds</span>
                  </h3>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Live Confirmed Attending Counter */}
                    {attendingCount !== null && (
                      <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-lg p-3 flex items-center gap-2.5 text-xs text-[#FFE07D] font-mono shadow-inner">
                        <Sparkles className="w-4 h-4 text-[#D4AF37] animate-pulse shrink-0" />
                        {attendingCount > 0 ? (
                          <span className="leading-relaxed">
                            Join <strong className="text-white font-extrabold">{attendingCount}</strong> other legend{attendingCount > 1 ? 's' : ''} already attending!
                          </span>
                        ) : (
                          <span className="leading-relaxed">Be the first to secure your VIP seat!</span>
                        )}
                      </div>
                    )}

                    {/* Name Input */}
                    <div>
                      <label htmlFor="rsvp-name" className="block text-[11px] uppercase tracking-wider text-gray-400 font-medium mb-1.5 font-mono">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                        <input
                          id="rsvp-name"
                          type="text"
                          required
                          placeholder="Dr. Name Surname"
                          value={formData.name}
                          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-black/60 border border-white/15 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 transition-all outline-none"
                        />
                      </div>
                    </div>

                    {/* Phone Input */}
                    <div>
                      <label htmlFor="rsvp-phone" className="block text-[11px] uppercase tracking-wider text-gray-400 font-medium mb-1.5 font-mono">
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                        <input
                          id="rsvp-phone"
                          type="tel"
                          required
                          maxLength={15}
                          placeholder="10-digit mobile number"
                          value={formData.phone}
                          onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                          className="w-full bg-black/60 border border-white/15 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 transition-all outline-none"
                        />
                      </div>
                      <span className="text-[10px] text-gray-500 mt-1 block">Indian numbers only (e.g. 9876543210)</span>
                    </div>

                    {/* Attendance Radio Buttons */}
                    <div className="flex flex-col items-center justify-center">
                      <label className="block text-[11px] uppercase tracking-wider text-gray-400 font-medium mb-3 font-mono text-center">
                        Your Availability
                      </label>
                      <div className="flex justify-center gap-3 w-full">
                        {config.availabilityOptions.map((opt) => {
                          const isSelected = formData.availability === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setFormData((prev) => ({ ...prev, availability: opt }))}
                              className={`flex-1 py-3 px-4 text-xs font-bold rounded-xl text-center border transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-gradient-to-b from-[#FFE07D] to-[#AA7C11] text-black border-[#FFE07D] shadow-[0_4px_12px_rgba(212,175,55,0.4)] scale-[1.02]"
                                  : "bg-black/50 border-white/10 text-gray-300 hover:border-white/25 hover:bg-black/70"
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      id="submit-rsvp-btn"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-b from-[#FFE07D] via-[#D4AF37] to-[#AA7C11] hover:from-[#FFF0A0] hover:to-[#D4AF37] text-black font-semibold uppercase tracking-widest text-xs py-3.5 rounded-lg transition-all shadow-[0_4px_15px_rgba(212,175,55,0.3)] focus:outline-none focus:ring-2 focus:ring-yellow-300 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Clock className="w-4 h-4 animate-spin text-black" />
                          <span>Securing Seat...</span>
                        </>
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
                  <div className="w-16 h-16 bg-green-950/60 border border-green-500/30 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-wide mb-2 font-serif italic">Your Seat Awaits</h3>
                  <p className="text-xs text-green-400 font-medium font-mono uppercase tracking-widest mb-4">Reservation Secured</p>
                  <p className="text-sm text-gray-300 leading-relaxed max-w-xs mx-auto">
                    Thank you, <span className="font-semibold text-white">{submittedName}</span>. Your RSVP of <span className="text-[#D4AF37] font-semibold">"{formData.availability || "Attending"}"</span> has been locked into the grand guest ledger.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>

      {/* Footer Branding - Docflix & Mankind Logos side-by-side */}
      <footer className="w-full max-w-lg flex flex-col items-center z-10 mt-6 border-t border-white/5 pt-8">
        <div className="flex items-center justify-center gap-6 md:gap-10 mb-6">
          {/* Docflix Logo Slot */}
          <div className="flex flex-col items-center justify-center">
            {config.logoDocflix ? (
              <img
                src={config.logoDocflix}
                alt="Docflix Logo"
                className="h-10 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                referrerPolicy="no-referrer"
              />
            ) : (
              <DocflixLogo className="h-9 w-auto text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
            )}
          </div>

          {/* Thin partition */}
          <div className="h-8 w-[1px] bg-white/15"></div>

          {/* Mankind Logo Slot */}
          <div className="flex flex-col items-center justify-center">
            {config.logoMankind ? (
              <img
                src={config.logoMankind}
                alt="Mankind Logo"
                className="h-10 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                referrerPolicy="no-referrer"
              />
            ) : (
              <MankindLogo className="h-11 w-auto drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
            )}
          </div>
        </div>

        {/* Footer legalities */}
        <p className="text-[10px] md:text-xs tracking-wider text-gray-400 text-center font-mono uppercase mb-4">
          {config.footerLine}
        </p>

        {/* Admin Dashboard Entry Portal */}
        <button
          onClick={onAdminClick}
          className="text-[9px] uppercase tracking-widest text-gray-600 hover:text-white transition-colors cursor-pointer mt-2"
        >
          Admin Console
        </button>
      </footer>
    </div>
  );
}
