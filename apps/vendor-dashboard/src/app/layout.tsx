import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/Sidebar";
import { AuthProvider } from "@/lib/auth-context";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Hospital CMS - Vendor Control Panel",
  description: "Vendor management and package deployment",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-neutral-900 dark:bg-neutral-900">
        <AuthProvider>
          <div className="flex h-screen bg-neutral-900">
            {/* Single Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <main className="flex-1 overflow-auto">{children}</main>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
