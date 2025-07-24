"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

interface ChartData {
  name: string;
  amount: number;
}

interface PieChartCardProps {
  title: string;
  data: ChartData[];
  colors?: string[];
}

const defaultColors = ["#16a34a", "#3b82f6", "#facc15", "#ef4444", "#a855f7"];

export default function PieChartCard({
  title,
  data = [],
  colors = defaultColors,
}: PieChartCardProps) {
  const hasData = Array.isArray(data) && data.length > 0;
  const chartData = hasData ? data : [{ name: "No data", amount: 1 }];

  const chartColors = hasData ? colors : ["#e5e7eb"]; // gray-200

  return (
    <div className="bg-white rounded-xl shadow p-4 w-full">
      <h3 className="text-md font-semibold mb-2">{title}</h3>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="percentage"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={90}
            label={hasData}
          >
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={chartColors[index % chartColors.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          {hasData && (
            <Legend
              verticalAlign="bottom"
              height={36}
              content={({ payload }) => (
                <ul className="flex flex-wrap justify-center gap-4 mt-4">
                  {payload?.map((entry, index) => (
                    <li
                      key={`legend-${index}`}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span
                        className="inline-block w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      ></span>
                      {entry.value}
                    </li>
                  ))}
                </ul>
              )}
            />
          )}
        </PieChart>
      </ResponsiveContainer>

      {!hasData && (
        <p className="text-sm text-gray-500 text-center italic mt-2">
          No data available
        </p>
      )}
    </div>
  );
}
