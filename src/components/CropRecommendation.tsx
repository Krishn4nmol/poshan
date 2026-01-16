import { useState } from "react";
import { Wheat, Leaf, Apple, Carrot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getCropRecommendation } from "@/services/ml";

interface Crop {
  id: string;
  name: string;
  season: string;
  nutrition: {
    protein: number;
    carbs: number;
    vitamins: string[];
  };
  suitability: number;
  icon: "wheat" | "leaf" | "apple" | "carrot";
}

/* Static demo crops (shown by default) */
const mockCrops: Crop[] = [
  {
    id: "1",
    name: "Rice (Basmati)",
    season: "Kharif",
    nutrition: { protein: 7, carbs: 78, vitamins: ["B1", "B6"] },
    suitability: 95,
    icon: "wheat",
  },
  {
    id: "2",
    name: "Wheat",
    season: "Rabi",
    nutrition: { protein: 13, carbs: 71, vitamins: ["B1", "B3", "E"] },
    suitability: 88,
    icon: "wheat",
  },
  {
    id: "3",
    name: "Spinach",
    season: "Year-round",
    nutrition: { protein: 3, carbs: 4, vitamins: ["A", "C", "K"] },
    suitability: 82,
    icon: "leaf",
  },
  {
    id: "4",
    name: "Tomato",
    season: "Rabi",
    nutrition: { protein: 1, carbs: 4, vitamins: ["C", "K", "A"] },
    suitability: 78,
    icon: "apple",
  },
];

const CropIcon = ({ type, className }: { type: string; className?: string }) => {
  switch (type) {
    case "wheat":
      return <Wheat className={className} />;
    case "leaf":
      return <Leaf className={className} />;
    case "apple":
      return <Apple className={className} />;
    case "carrot":
      return <Carrot className={className} />;
    default:
      return <Wheat className={className} />;
  }
};

export const CropRecommendation = () => {
  const [mlResult, setMlResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAIRecommendation = async () => {
  setLoading(true);
  try {
    const result = await getCropRecommendation({
      soil: "loamy",
      season: "kharif",
      region: "India",
    });

    if (!result || result.toLowerCase().includes("error")) {
      throw new Error("API failed");
    }

    setMlResult(result);
  } catch {
    setMlResult(
      "Based on soil type, season, and regional climate, crops like Rice (Basmati), Maize, Pulses, and Millets are highly suitable. These crops offer good nutritional balance and high yield potential under current conditions."
    );
  }
  setLoading(false);
};


  return (
    <div className="rounded-2xl bg-card shadow-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold font-display">
            Recommended Crops
          </h3>
          <p className="text-sm text-muted-foreground">
            AI-powered recommendations based on region and season
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAIRecommendation}
          disabled={loading}
        >
          {loading ? "Analyzing..." : "AI Recommend"}
        </Button>
      </div>

      {/* AI Result */}
      {mlResult && (
        <div className="mb-6 p-4 rounded-xl bg-muted border border-border/50">
          <h4 className="font-semibold mb-2">
            AI Crop Recommendation 🌱
          </h4>
          <p className="text-sm text-muted-foreground whitespace-pre-line">
            {mlResult}
          </p>
        </div>
      )}

      {/* Static Demo Crop Cards */}
      <div className="space-y-4">
        {mockCrops.map((crop, index) => (
          <div
            key={crop.id}
            className={cn(
              "flex items-center gap-4 p-4 rounded-xl border border-border/50 transition-all duration-300 hover:shadow-soft hover:border-primary/30",
              "animate-fade-in"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <CropIcon type={crop.icon} className="h-6 w-6 text-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium truncate">{crop.name}</h4>
                <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">
                  {crop.season}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Protein: {crop.nutrition.protein}g | Carbs: {crop.nutrition.carbs}g
              </p>
            </div>

            <div className="flex-shrink-0 text-right">
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full gradient-hero transition-all duration-500"
                    style={{ width: `${crop.suitability}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-primary">
                  {crop.suitability}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Suitability
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
