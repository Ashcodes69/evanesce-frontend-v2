'use client';

interface DeveloperNoticeProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function DeveloperNotice({ isVisible, onClose }: DeveloperNoticeProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 w-full z-[100] flex justify-center p-4 pointer-events-none">
      <div className="relative bg-[#FFF000] text-black p-5 max-w-md w-full shadow-[0_10px_40px_rgba(255,240,0,0.2)] pointer-events-auto">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 p-1 text-black/50 hover:text-black transition-colors hover: cursor-pointer"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <p className="text-base leading-relaxed font-medium pr-6">
          This app uses a free hosting for now so it pauses in every 15 minutes of no use.
        </p>
        <p className="text-base leading-relaxed font-medium mt-2 pr-6">
          so please wait for 30-60 seconds the app will load automatically
        </p>
      </div>
    </div>
  );
}