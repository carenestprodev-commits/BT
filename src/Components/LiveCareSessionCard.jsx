import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Hourglass, Wallet, Clock, MessageSquare, CheckCircle } from "lucide-react";

export default function LiveCareSessionCard({
  bookingId,
  counterpartName,
  counterpartProfileImageUrl,
  counterpartId,
  serviceCategory,
  startTimeIso,
  hourlyRate,
  currencySymbol = "",
  conversationId,
  userType, // 'seeker' or 'provider'
}) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const startTime = new Date(startTimeIso);
    
    const updateTimer = () => {
      const now = new Date();
      const diffMs = Math.max(0, now - startTime);
      setElapsedSeconds(Math.floor(diffMs / 1000));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startTimeIso]);

  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;

  const hoursStr = String(hours).padStart(2, "0");
  const minutesStr = String(minutes).padStart(2, "0");
  const secondsStr = String(seconds).padStart(2, "0");

  const hoursUsedDecimal = elapsedSeconds / 3600.0;
  const estimatedCost = hoursUsedDecimal * hourlyRate;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat().format(Math.round(val));
  };

  const resolveAvatar = (url, name) => {
    if (!url) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=E5E7EB&color=374151&size=100`;
    }
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${import.meta.env.VITE_API_BASE_URL || ""}${url}`;
  };

  const chatLink = userType === "seeker" 
    ? `/careseekers/dashboard/message/${conversationId}`
    : `/careproviders/dashboard/message/${conversationId}`;

  // Progress for the circle indicator (seconds portion of the minute)
  const progressPercent = (seconds / 60) * 100;
  const strokeDashoffset = 113 - (113 * progressPercent) / 100; // 2 * pi * r (r=18)

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 md:p-6 shadow-sm w-full mb-6 mt-4">
      {/* Header counterpart profile */}
      <div className="flex items-center gap-3.5 mb-5">
        <div className="relative">
          <img
            src={resolveAvatar(counterpartProfileImageUrl, counterpartName)}
            alt={counterpartName}
            className="w-12 h-12 rounded-full object-cover bg-gray-100"
          />
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-base font-bold text-gray-900 truncate">
              {counterpartName}
            </h4>
            <CheckCircle className="w-4 h-4 text-blue-500 fill-blue-500" />
            
            {/* Live Badge */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Live care session
            </span>
          </div>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            {serviceCategory}
          </p>
        </div>
      </div>

      {/* Green Timer Banner */}
      <div className="bg-gradient-to-br from-[#023618] to-[#065A2C] rounded-xl p-4 md:p-5 flex items-center gap-5 text-white mb-5 shadow-inner">
        {/* Circle Progress with Hourglass */}
        <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
          <svg className="absolute w-full h-full transform -rotate-90">
            <circle
              cx="24"
              cy="24"
              r="18"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="3.5"
              fill="transparent"
            />
            <circle
              cx="24"
              cy="24"
              r="18"
              stroke="#00C853"
              strokeWidth="3.5"
              fill="transparent"
              strokeDasharray="113"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          </svg>
          <Hourglass className="w-5 h-5 text-white relative z-10" />
        </div>

        {/* Time counter values */}
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-green-200">
            Session duration
          </span>
          <div className="flex items-baseline gap-1 mt-1 font-mono">
            <div className="text-2xl font-black">{hoursStr}</div>
            <div className="text-xs text-green-300 font-semibold">h</div>
            <div className="text-2xl font-black">:</div>
            <div className="text-2xl font-black">{minutesStr}</div>
            <div className="text-xs text-green-300 font-semibold">m</div>
            <div className="text-2xl font-black">:</div>
            <div className="text-2xl font-black">{secondsStr}</div>
            <div className="text-xs text-green-300 font-semibold">s</div>
          </div>
        </div>
      </div>

      {/* Costing and Rate info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex items-center gap-3">
          <Wallet className="w-6 h-6 text-sky-500" />
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Estimated Cost
            </p>
            <p className="text-lg font-black text-sky-600 mt-0.5">
              {currencySymbol}{formatCurrency(estimatedCost)}
            </p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex items-center gap-3">
          <Clock className="w-6 h-6 text-gray-500" />
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              {hoursUsedDecimal.toFixed(1)} hours used
            </p>
            <p className="text-lg font-black text-gray-800 mt-0.5">
              {currencySymbol}{formatCurrency(hourlyRate)}/hr
            </p>
          </div>
        </div>
      </div>

      {/* Action Chat link */}
      {conversationId && (
        <Link
          to={chatLink}
          className="w-full flex items-center justify-center gap-2 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl transition shadow-sm hover:shadow"
        >
          <MessageSquare className="w-5 h-5" />
          Message
        </Link>
      )}
    </div>
  );
}
