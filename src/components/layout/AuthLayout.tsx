import { ReactNode } from "react";

interface AuthLayoutProps {
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6">
      <div className="w-full max-w-md p-8 space-y-8 bg-surface border border-border rounded-3xl shadow-2xl">
        <div className="text-center">
          <h1 className="text-text-main text-3xl font-bold tracking-tight">
            {title}
          </h1>
          <p className="text-text-muted mt-2 text-sm h-5 transition-all">
            {subtitle}
          </p>
        </div>
        {children}
        {footer && (
          <div className="text-center text-sm text-text-muted pt-2 border-t border-border/50">
            {footer}
          </div>
        )}
      </div>
    </main>
  );
}
