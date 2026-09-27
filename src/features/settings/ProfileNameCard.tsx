"use client";
import { useState, FormEvent } from "react";
import Input from "@/src/components/ui/Input";
import Button from "@/src/components/ui/Button";

export default function ProfileNameCard() {
  const [fullName, setFullName] = useState("Ashish Kumar");
  const [saving, setSaving] = useState(false);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      console.log("Saved:", fullName);
    }, 1000);
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-text-main text-lg font-semibold">Display Name</h2>
        <p className="text-text-muted text-sm mt-1">
          This is how you appear to your connections.
        </p>
      </div>
      <form onSubmit={handleSave} className="space-y-4">
        <Input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your full name"
        />
        <Button
          type="submit"
          variant="primary"
          disabled={saving || !fullName.trim()}
          className="w-full sm:w-auto"
        >
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </form>
    </div>
  );
}
