import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const nutritionData = [
  { name: "Rice", protein: 7, carbs: 78, fiber: 1.3, iron: 4.3 },
  { name: "Wheat", protein: 13, carbs: 71, fiber: 10.7, iron: 5.4 },
  { name: "Maize", protein: 9, carbs: 74, fiber: 7.3, iron: 2.7 },
  { name: "Bajra", protein: 12, carbs: 67, fiber: 8.5, iron: 8.0 },
  { name: "Jowar", protein: 10, carbs: 72, fiber: 6.3, iron: 4.4 },
];

const vitaminData = [
  { name: "Vitamin A", value: 35, color: "hsl(38, 90%, 50%)" },
  { name: "Vitamin C", value: 25, color: "hsl(142, 45%, 32%)" },
  { name: "Vitamin B", value: 20, color: "hsl(200, 80%, 55%)" },
  { name: "Vitamin E", value: 12, color: "hsl(30, 35%, 35%)" },
  { name: "Vitamin K", value: 8, color: "hsl(120, 40%, 45%)" },
];

export const NutritionChart = () => {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Bar Chart */}
      <div className="rounded-2xl bg-card shadow-card p-6">
        <h3 className="text-lg font-semibold font-display mb-1">
          Nutritional Comparison
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Protein & Carbs per 100g
        </p>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={nutritionData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(45, 20%, 85%)" />
              <XAxis
                dataKey="name"
                tick={{ fill: "hsl(150, 15%, 45%)", fontSize: 12 }}
                axisLine={{ stroke: "hsl(45, 20%, 85%)" }}
              />
              <YAxis
                tick={{ fill: "hsl(150, 15%, 45%)", fontSize: 12 }}
                axisLine={{ stroke: "hsl(45, 20%, 85%)" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(45, 40%, 98%)",
                  border: "1px solid hsl(45, 20%, 85%)",
                  borderRadius: "8px",
                  boxShadow: "0 4px 20px -4px rgba(0,0,0,0.1)",
                }}
              />
              <Bar
                dataKey="protein"
                fill="hsl(142, 45%, 32%)"
                radius={[4, 4, 0, 0]}
                name="Protein (g)"
              />
              <Bar
                dataKey="carbs"
                fill="hsl(38, 90%, 50%)"
                radius={[4, 4, 0, 0]}
                name="Carbs (g)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="rounded-2xl bg-card shadow-card p-6">
        <h3 className="text-lg font-semibold font-display mb-1">
          Vitamin Distribution
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Average across selected crops
        </p>
        <div className="h-[280px] flex items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={vitaminData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {vitaminData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(45, 40%, 98%)",
                  border: "1px solid hsl(45, 20%, 85%)",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          {vitaminData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-muted-foreground">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
