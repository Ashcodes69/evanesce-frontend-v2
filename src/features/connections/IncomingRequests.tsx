import  Button  from "@/src/components/ui/Button";

interface RequestItem {
  connection_id: number;
  sender_id: number;
  sender_username: string;
}

interface IncomingRequestsProps {
  requests: RequestItem[];
  onAccept: (connectionId: number, userId: number) => void;
  onDecline: (connectionId: number) => void;
  actionLoadingId: number | null;
}

export default function IncomingRequests({ requests, onAccept, onDecline, actionLoadingId }: IncomingRequestsProps) {
  if (requests.length === 0) {
    return <p className="text-text-muted text-sm text-center py-4">No new chat requests.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {requests.map((req) => (
        <div key={req.connection_id} className="flex items-center justify-between p-4 rounded-xl bg-surface border border-border">
          <span className="text-text-main font-medium">@{req.sender_username}</span>
          <div className="flex gap-2">
            <Button 
              variant="destructive" 
              onClick={() => onDecline(req.connection_id)}
              disabled={actionLoadingId === req.connection_id}
              className="px-4 py-1.5 text-xs bg-transparent text-text-muted hover:text-white border border-border"
            >
              Decline
            </Button>
            <Button 
              variant="primary" 
              onClick={() => onAccept(req.connection_id, req.sender_id)}
              disabled={actionLoadingId === req.connection_id}
              className="px-4 py-1.5 text-xs"
            >
              Accept
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}