import Link from "next/link";
import  Button  from "@/src/components/ui/Button";

interface UserResult {
  id: number;
  username: string;
  full_name: string;
  connection_status: "none" | "pending_sent" | "pending_received" | "accepted";
}

interface SearchResultProps {
  user: UserResult | null;
  onSendRequest: () => void;
  actionLoading: boolean;
}

export default function SearchResult({ user, onSendRequest, actionLoading }: SearchResultProps) {
  if (!user) return null;

  const renderAction = () => {
    switch (user.connection_status) {
      case "accepted":
        return (
          <Link href={`/messages/${user.id}`} className="w-full sm:w-auto">
            <Button variant="primary" className="w-full sm:w-auto px-8 py-2">Message {user.username}</Button>
          </Link>
        );
      case "pending_sent":
        return (
          <Button disabled className="w-full sm:w-auto px-8 py-2 bg-transparent border border-border text-text-muted cursor-not-allowed">
            Request sent — waiting
          </Button>
        );
      case "pending_received":
        return (
          <p className="text-text-muted text-sm text-center">
            They already sent you a request. Check below.
          </p>
        );
      case "none":
      default:
        return (
          <Button 
            variant="primary" 
            onClick={onSendRequest} 
            disabled={actionLoading} 
            className="w-full sm:w-auto px-8 py-2"
          >
            {actionLoading ? "Sending..." : `Send request to ${user.username}`}
          </Button>
        );
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 animate-in fade-in">
      <p className="text-text-main font-bold text-2xl">{user.full_name}</p>
      <p className="text-text-muted font-medium text-sm">@{user.username}</p>
      {renderAction()}
    </div>
  );
}