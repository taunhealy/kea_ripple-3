"use client";

import { useQuery } from "@tanstack/react-query";
import { RecentSales } from "@/app/components/dashboard/RecentSales";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";

// API fetch function
const fetchDashboardStats = async () => {
  const response = await fetch("/api/dashboard/stats");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

export default function DashboardPage() {
  const {
    data: dashboardData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: fetchDashboardStats,
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-destructive/10 rounded-lg">
          <h2 className="text-lg font-semibold text-destructive mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "Failed to load dashboard data. Please try again later."}
          </p>
        </div>
      </div>
    );
  }

  const hasNoData = !dashboardData?.totalSales && !dashboardData?.totalPresets;

  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Your business metrics at a glance
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4"
        >
          Refresh Data
        </button>
      </div>

      {hasNoData ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10 space-y-4">
            <p className="text-lg font-medium">No dashboard data available</p>
            <p className="text-sm text-muted-foreground">
              Check back later for updates
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Sales
                </CardTitle>
                {dashboardData?.totalSales > 1000 && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                    High Performance
                  </span>
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${dashboardData?.totalSales?.toFixed(2) ?? "0.00"}
                </div>
                <p className="text-xs text-muted-foreground">
                  +20.1% from last month
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Presets Sold
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData?.totalPresets}
                </div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData?.totalPresets > 0
                    ? "+12 since last week"
                    : "No sales yet"}
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Customers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">45</div>
                <p className="text-xs text-muted-foreground">
                  +5 new this month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <RecentSales />
          </div>
        </>
      )}
    </div>
  );
}
