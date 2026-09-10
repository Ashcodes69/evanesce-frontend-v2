"use client";

import { useState } from "react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function SearchPanel() {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for query");
  };
  return (
    <form onSubmit={handleSearch} className="flex items-center gap-3 w-full">
      <Input
        type="text"
        placeholder="Enter the exact username"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <Button type="submit" variant="primary">
        Search
      </Button>
    </form>
  );
}
