import Link from "next/link";

export default function ActionCard({
  title,
  description,
  href,
  linkText,
}: {
  title: string;
  description: string;
  href: string;
  linkText: string;
}) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-text-main text-lg font-semibold">{title}</h2>
        <p className="text-text-muted text-sm mt-1">{description}</p>
      </div>
      <Link
        href={href}
        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-text-main bg-background border border-border rounded-lg hover:bg-border/50 transition-colors whitespace-nowrap"
      >
        {linkText}
      </Link>
    </div>
  );
}
