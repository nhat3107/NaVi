import { useEffect } from "react";

export const CallEndedView = ({ reason, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 10000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getEndInfo = () => {
    switch (reason) {
      case "timeout":
      case "no-answer":
        return {
          icon: "📞",
          title: "No Answer",
          message: "Your call was not answered",
          color: "text-orange-600",
          bgColor: "bg-orange-100 dark:bg-orange-900/20",
        };
      case "declined":
        return {
          icon: "📵",
          title: "Call Declined",
          message: "The recipient declined your call",
          color: "text-red-600",
          bgColor: "bg-red-100 dark:bg-red-900/20",
        };
      case "busy":
        return {
          icon: "🚫",
          title: "User Busy",
          message: "The recipient is in another call",
          color: "text-yellow-600",
          bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
        };
      case "ended":
        return {
          icon: "✅",
          title: "Call Ended",
          message: "Call ended successfully",
          color: "text-green-600",
          bgColor: "bg-green-100 dark:bg-green-900/20",
        };
      default:
        return {
          icon: "📞",
          title: "Call Ended",
          message: "The call has ended",
          color: "text-gray-600",
          bgColor: "bg-gray-100 dark:bg-gray-900/20",
        };
    }
  };

  const endInfo = getEndInfo();

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl top-1/4 left-1/4 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl bottom-1/4 right-1/4 animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center p-8 max-w-md">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse"></div>
          <div className={`relative w-32 h-32 rounded-full ${endInfo.bgColor} flex items-center justify-center border-4 border-white/20 shadow-2xl`}>
            <span className="text-6xl">{endInfo.icon}</span>
          </div>
        </div>

        <h1 className={`text-3xl font-bold mb-3 ${endInfo.color} text-center`}>
          {endInfo.title}
        </h1>

        <p className="text-gray-400 text-center mb-8 text-lg">
          {endInfo.message}
        </p>

        <button
          onClick={onClose}
          className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-indigo-500/50"
        >
          <span className="flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Close Window
          </span>
        </button>

        <p className="text-gray-500 text-sm mt-4 text-center">
          Window will close automatically in 10 seconds
        </p>
      </div>
    </div>
  );
};

export default CallEndedView;

