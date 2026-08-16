"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { formatNu } from "@/lib/finance/calc";

export function EarningsChart({ paid, pending }: { paid: number; pending: number }) {
  const data = [
    { name: "Received", value: paid, color: "#1f5c3d" },
    { name: "Pending", value: pending, color: "#f4a300" },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return <p className="text-sm text-gray-500">No earnings data to chart yet.</p>;
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={2}
          >
            {data.map((d) => <Cell key={d.name} fill={d.color} />)}
          </Pie>
          <Tooltip formatter={(v: number) => formatNu(v)} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}