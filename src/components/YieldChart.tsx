import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

const yieldData = [
  { month: "Jan", yield: 2.4, predicted: 2.5 },
  { month: "Feb", yield: 2.1, predicted: 2.3 },
  { month: "Mar", yield: 2.8, predicted: 2.7 },
  { month: "Apr", yield: 3.2, predicted: 3.1 },
  { month: "May", yield: 3.5, predicted: 3.4 },
  { month: "Jun", yield: 3.8, predicted: 3.9 },
  { month: "Jul", yield: 4.2, predicted: 4.0 },
  { month: "Aug", yield: 4.5, predicted: 4.6 },
  { month: "Sep", yield: 4.1, predicted: 4.3 },
  { month: "Oct", yield: 3.8, predicted: 4.0 },
  { month: "Nov", yield: 3.2, predicted: 3.5 },
  { month: "Dec", yield: 2.8, predicted: 3.0 },
];

export const YieldChart = () => {
  return (
    <div className="rounded-2xl bg-card shadow-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold font-display">
            Yield Performance
          </h3>
          <p className="text-sm text-muted-foreground">
            Actual vs Predicted (tonnes/hectare)
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Actual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-harvest" />
            <span className="text-xs text-muted-foreground">Predicted</span>
          </div>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={yieldData}>
            <defs>
              <linearGradient id="yieldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(142, 45%, 32%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(142, 45%, 32%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(38, 90%, 50%)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(38, 90%, 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(45, 20%, 85%)" />
            <XAxis
              dataKey="month"
              tick={{ fill: "hsl(150, 15%, 45%)", fontSize: 12 }}
              axisLine={{ stroke: "hsl(45, 20%, 85%)" }}
            />
            <YAxis
              tick={{ fill: "hsl(150, 15%, 45%)", fontSize: 12 }}
              axisLine={{ stroke: "hsl(45, 20%, 85%)" }}
              domain={[0, 5]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(45, 40%, 98%)",
                border: "1px solid hsl(45, 20%, 85%)",
                borderRadius: "8px",
                boxShadow: "0 4px 20px -4px rgba(0,0,0,0.1)",
              }}
            />
            <Area
              type="monotone"
              dataKey="yield"
              stroke="hsl(142, 45%, 32%)"
              strokeWidth={2}
              fill="url(#yieldGradient)"
              name="Actual Yield"
            />
            <Area
              type="monotone"
              dataKey="predicted"
              stroke="hsl(38, 90%, 50%)"
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="url(#predictedGradient)"
              name="Predicted Yield"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
