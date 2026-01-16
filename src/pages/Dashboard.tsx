import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Header } from "@/components/Header";
import { StatCard } from "@/components/StatCard";
import { WeatherWidget } from "@/components/WeatherWidget";
import { CropRecommendation } from "@/components/CropRecommendation";
import { YieldChart } from "@/components/YieldChart";
import { NutritionChart } from "@/components/NutritionChart";
import { Chatbot } from "@/components/Chatbot";
import { SoilPhotoCapture } from "@/components/SoilPhotoCapture";
import { Wheat, TrendingUp, Droplets, Sun, DollarSign, BarChart3, Activity, Leaf } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();

  // ✅ AUTH GUARD
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate("/");
      }
    };
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        <div className="grid gap-6 md:grid-cols-4">
          <StatCard 
            title="Total Crops" 
            value={12} 
            icon={Wheat}
            variant="blue"
            trend={{ value: 5, isPositive: true }}
            subtitle="vs last month"
          />
          <StatCard 
            title="Yield Forecast" 
            value="4.2T" 
            icon={TrendingUp}
            variant="purple"
            trend={{ value: 8, isPositive: true }}
            subtitle="per hectare"
          />
          <StatCard 
            title="Water Usage" 
            value="2450L" 
            icon={Droplets}
            variant="teal"
            trend={{ value: 3, isPositive: false }}
            subtitle="this week"
          />
          <StatCard 
            title="Sunlight" 
            value="8.5 hrs" 
            icon={Sun}
            variant="orange"
            trend={{ value: 12, isPositive: true }}
            subtitle="daily average"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-4 mt-6">
          <StatCard 
            title="Revenue Growth" 
            value="₹2.4L" 
            icon={DollarSign}
            variant="purple"
            trend={{ value: 15, isPositive: true }}
            subtitle="this quarter"
          />
          <StatCard 
            title="Crop Health" 
            value="92%" 
            icon={Activity}
            variant="teal"
            trend={{ value: 5, isPositive: true }}
            subtitle="overall score"
          />
          <StatCard 
            title="Efficiency" 
            value="87%" 
            icon={BarChart3}
            variant="sky"
            trend={{ value: 7, isPositive: true }}
            subtitle="resource usage"
          />
          <StatCard 
            title="Sustainability" 
            value="94%" 
            icon={Leaf}
            variant="blue"
            trend={{ value: 4, isPositive: true }}
            subtitle="eco-score"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mt-8">
          <WeatherWidget />
          <CropRecommendation />
          <div className="space-y-4">
            <SoilPhotoCapture />
          </div>
        </div>

        <YieldChart />
        <NutritionChart />
      </main>
      <Chatbot />
    </div>
  );
};

export default Dashboard;
