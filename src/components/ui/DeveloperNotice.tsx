'use client';

interface DeveloperNoticeProps {
  isVisible: boolean;
}

export default function DeveloperNotice({ isVisible }: DeveloperNoticeProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 w-full z-[100] flex justify-center p-4 pointer-events-none">
      <div className="bg-[#FFF000] text-black p-5 max-w-md w-full shadow-[0_10px_40px_rgba(255,240,0,0.2)] pointer-events-auto">
        <p className="text-base leading-relaxed font-medium">
          This app uses a free hosting for now so it pauses in every 15 minutes of no use.
        </p>
        <p className="text-base leading-relaxed font-medium mt-2">
          so please wait for 30-60 seconds the app will load automatically
        </p>
      </div>
    </div>
  );
}