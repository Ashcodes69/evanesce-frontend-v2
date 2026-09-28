import { FormEvent } from "react";
import Input from "@/src/components/ui/Input";
import Button from "@/src/components/ui/Button";

interface SearchPanelProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  onSearch: (e: FormEvent) => void;
  loading: boolean;
}

export default function SearchPanel({
  searchQuery,
  setSearchQuery,
  onSearch,
  loading,
}: SearchPanelProps) {
  return (
    <form onSubmit={onSearch} className="flex gap-3">
      <Input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search by username..."
        className="flex-1 py-3"
      />
      <Button
        type="submit"
        variant="primary"
        disabled={loading || !searchQuery.trim()}
        className="px-6"
      >
        {loading ? "..." : "Search"}
      </Button>
    </form>
  );
}
