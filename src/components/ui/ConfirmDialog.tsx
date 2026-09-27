"use client";

import Button from "@/src/components/ui/Button";

interface ConfirmDialogProps {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      {/* 
        Using a very dark surface color to match your design. 
        Adjust bg-[#0A0E17] if your --surface variable is slightly different.
      */}
      <div className="bg-[#0A0E17] border border-border rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl transform transition-all">
        <h3 className="text-2xl font-bold text-white mb-8 tracking-wide">
          {title}
        </h3>

        <div className="flex items-center justify-center gap-4">
          <Button
            variant="primary"
            onClick={onCancel}
            className="px-8 py-2.5 rounded-xl text-base"
          >
            No
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="px-8 py-2.5 rounded-xl text-base bg-[#EF4444] hover:bg-[#DC2626] border-none text-white"
          >
            Yes
          </Button>
        </div>
      </div>
    </div>
  );
}
