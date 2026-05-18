import { BusinessProvider } from "@/context/BusinessContext";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { LeftNavbar } from "@/components/layout/LeftNavbar";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <ProtectedRoute>
        <BusinessProvider>
          <div className="flex flex-col min-h-screen w-full">
            <TopNavbar />
            <div className="flex flex-1 w-full">
              <LeftNavbar />
              <main className="flex-1 px-8 py-7 overflow-y-auto h-[calc(100vh-3.5rem)] bg-white dark:bg-gray-950">
                {children}
              </main>
            </div>
          </div>
        </BusinessProvider>
      </ProtectedRoute>
    </div>
  );
}
