"use client";
import Button from "../../components/ui/Button";

export interface UserProfile {
  id: string;
  fullName: string;
  username: string;
}

interface SearchResProps {
  hasSearched: boolean;
  user: UserProfile | null;
  onSendRequest?: (userId: string) => void;
}

export default function SearchResult({
  hasSearched,
  user,
  onSendRequest,
}: SearchResProps) {
  if (!hasSearched) return null;

  if (!user) {
    return (
      <div className="flex justify-center py-6">
        <p className="text-text-muted text-sm font-medium">user not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="text-center flex flex-col gap-1">
        <h3 className="text-text-main text-3xl font-semibold tracking-wide">
          {user.fullName}
        </h3>
        <p className="text-text-muted text-lg">@{user.username}</p>
      </div>

      <Button variant="primary" onClick={() => onSendRequest?.(user.id)}>
        Send Request
      </Button>
    </div>
  );
}
