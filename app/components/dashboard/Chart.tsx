"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
} from "recharts";

interface ChartProps {
  data: {
    date: string;
    revenue: number;
  }[];
}

const aggregateData = (data: ChartProps["data"]) => {
  const aggregated = data.reduce((acc: Record<string, number>, curr) => {
    acc[curr.date] = (acc[curr.date] || 0) + curr.revenue;
    return acc;
  }, {});

  return Object.entries(aggregated).map(([date, revenue]) => ({
    date,
    revenue,
  }));
};

export function Chart({ data }: ChartProps) {
  const {
    data: processedData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["chartData", data],
    queryFn: () => aggregateData(data),
    enabled: !!data,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred</div>;

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={processedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          stroke="#3b82f6"
          activeDot={{ r: 8 }}
          dataKey="revenue"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
