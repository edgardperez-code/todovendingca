import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Panel de administración | TodoWeb Digital" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-ink-50">{children}</div>;
}
