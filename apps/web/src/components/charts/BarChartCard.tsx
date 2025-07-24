"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

interface ChartData {
  name: string;
  amount: number;
}

interface BarChartCardProps {
  title: string;
  data?: ChartData[];
  colors?: string[];
}

const defaultColors = ["#16a34a", "#3b82f6", "#facc15", "#ef4444", "#a855f7"];

export default function BarChartCard({
  title,
  data = [],
  colors = defaultColors,
}: BarChartCardProps) {
  const hasData = Array.isArray(data) && data.length > 0;

  const parsedData = hasData
    ? data.map((item) => ({
        name: item.name,
        amount: Number(item.amount),
      }))
    : [{ name: "No data", amount: 0 }];

  const chartColors = hasData ? colors : ["#e5e7eb"];

  return (
    <div className="bg-white rounded-xl shadow p-4 w-full">
      <h3 className="text-md font-semibold mb-2">{title}</h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={parsedData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="amount">
            {parsedData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={chartColors[index % chartColors.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Custom Legend */}
      {hasData && (
        <div className="mt-4 flex flex-wrap gap-4 justify-center">
          {parsedData.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <span
                className="inline-block w-3 h-3"
                style={{
                  backgroundColor: chartColors[index % chartColors.length],
                }}
              />
              <span className="text-gray-700">{entry.name}</span>
            </div>
          ))}
        </div>
      )}

      {!hasData && (
        <p className="text-sm text-gray-500 text-center italic mt-2">
          No data available
        </p>
      )}
    </div>
  );
}
