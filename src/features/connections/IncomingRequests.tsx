"use client";
import Button from "@/src/components/ui/Button";

export interface ConnectionRequest {
  id: string;
  fullName: string;
  username: string;
}

interface IncommingRequestProps {
  requests: ConnectionRequest[];
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}

export default function IncomingRequests({
  requests,
  onAccept,
  onDecline,
}: IncommingRequestProps) {
  if (requests.length == 0) {
    return (
      <div className="text-center py-8 border border-dashed rounded-lg bg-surface/50">
        <p className="text-text-muted text-sm">No new requests</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {requests.map((req) => (
        <li
          key={req.id}
          className="flex items-center justify-between p-4 bg-surface border border-border rounded-xl transition-all hover:border-text-muted/30"
        >
          <div className="flex flex-col">
            <span className="text-text-main font-semibold tracking-wide">
              {req.fullName}
            </span>
            <span className="text-text-muted text-sm">@{req.username}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              className="px-4 py-1.5 text-sm"
              onClick={() => onAccept?.(req.id)}
            >
              Accept
            </Button>

            <Button
              variant="destructive"
              className="px-4 py-1.5 text-sm"
              onClick={() => onDecline?.(req.id)}
            >
              Decline
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
