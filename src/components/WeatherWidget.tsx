import { Cloud, Sun, Droplets, Wind, Thermometer, Loader2, MapPin, Sunrise, Sunset, Gauge, Eye, RefreshCw, AlertCircle, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  condition: "sunny" | "cloudy" | "rainy" | "partly-cloudy";
  description: string;
  location: string;
  sunrise: number;
  sunset: number;
  timezone: number;
  forecast: {
    day: string;
    date: string;
    temp: number;
    minTemp: number;
    maxTemp: number;
    condition: "sunny" | "cloudy" | "rainy" | "partly-cloudy";
    description: string;
  }[];
}

// WeatherAPI.com API key - you should add this to your .env file
const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY || "demo";
const WEATHER_API_URL = "https://api.weatherapi.com/v1";

const getConditionFromCode = (code: number): "sunny" | "cloudy" | "rainy" | "partly-cloudy" => {
  // WeatherAPI.com condition codes
  if (code >= 1000 && code <= 1030) return "sunny"; // Clear to partly cloudy
  if (code >= 1063 && code <= 1201) return "rainy"; // Rain
  if (code >= 1204 && code <= 1264) return "rainy"; // Snow/rain mix
  if (code >= 1273 && code <= 1282) return "rainy"; // Thunderstorm
  if (code >= 1066 && code <= 1237) return "cloudy"; // Snow
  if (code >= 1006 && code <= 1009) return "cloudy"; // Cloudy
  return "partly-cloudy";
};

const WeatherIcon = ({
  condition,
  className,
}: {
  condition: string;
  className?: string;
}) => {
  switch (condition) {
    case "sunny":
      return <Sun className={cn("text-harvest", className)} />;
    case "rainy":
      return <Droplets className={cn("text-water", className)} />;
    case "cloudy":
      return <Cloud className={cn("text-muted-foreground", className)} />;
    default:
      return <Cloud className={cn("text-sky", className)} />;
  }
};

export const WeatherWidget = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWeatherByLocation = async (latitude: number, longitude: number, isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Fetch weather data
      if (WEATHER_API_KEY === "demo") {
        // Fallback to mock data if API key is not set
        const now = new Date();
        setWeather({
          temperature: 28,
          feelsLike: 30,
          humidity: 65,
          windSpeed: 12,
          windDirection: 180,
          pressure: 1013,
          visibility: 10,
          uvIndex: 6,
          condition: "partly-cloudy",
          description: "Partly cloudy",
          location: "Current Location",
          sunrise: Math.floor(now.getTime() / 1000) - 3600,
          sunset: Math.floor(now.getTime() / 1000) + 36000,
          timezone: 0,
          forecast: [
            { day: "Mon", date: "Today", temp: 29, minTemp: 22, maxTemp: 29, condition: "sunny", description: "Sunny" },
            { day: "Tue", date: "Tomorrow", temp: 27, minTemp: 20, maxTemp: 27, condition: "partly-cloudy", description: "Partly cloudy" },
            { day: "Wed", date: "", temp: 25, minTemp: 18, maxTemp: 25, condition: "rainy", description: "Rainy" },
            { day: "Thu", date: "", temp: 26, minTemp: 19, maxTemp: 26, condition: "cloudy", description: "Cloudy" },
            { day: "Fri", date: "", temp: 28, minTemp: 21, maxTemp: 28, condition: "sunny", description: "Sunny" },
          ],
        });
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // WeatherAPI.com provides current weather + forecast in one call
      const response = await fetch(
        `${WEATHER_API_URL}/forecast.json?key=${WEATHER_API_KEY}&q=${latitude},${longitude}&days=5&aqi=yes&alerts=yes`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch weather data");
      }
      
      const data = await response.json();
      const locationName = data.location?.name || "Current Location";
      const current = data.current;
      const forecastDays = data.forecast?.forecastday || [];

      // Process 5-day forecast
      const today = new Date();
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      
      const forecast = forecastDays.slice(0, 5).map((day: any, index: number) => {
        const date = new Date(day.date);
        const isToday = date.toDateString() === today.toDateString();
        const dayCondition = day.day?.condition;
        
        return {
          day: isToday ? "Today" : index === 1 ? "Tomorrow" : days[date.getDay()],
          date: isToday ? "Today" : index === 1 ? "Tomorrow" : "",
          temp: Math.round(day.day?.avgtemp_c || day.day?.maxtemp_c || 0),
          minTemp: Math.round(day.day?.mintemp_c || 0),
          maxTemp: Math.round(day.day?.maxtemp_c || 0),
          condition: getConditionFromCode(dayCondition?.code || 1000),
          description: dayCondition?.text || "Clear",
        };
      });

      // Get wind direction in degrees
      const windDirection = current.wind_degree || 0;
      
      // Get timezone offset (in seconds) from API response
      const timezoneOffset = data.location?.tz_id ? 0 : 0; // WeatherAPI.com provides local time directly
      
      // Parse sunrise/sunset times from astronomy data
      const astronomy = forecastDays[0]?.astro || {};
      const sunriseTime = astronomy.sunrise || "06:00 AM";
      const sunsetTime = astronomy.sunset || "06:00 PM";
      
      // Convert sunrise/sunset to Unix timestamps
      const now = new Date();
      const sunriseMatch = sunriseTime.match(/(\d+):(\d+)\s*(AM|PM)/);
      const sunsetMatch = sunsetTime.match(/(\d+):(\d+)\s*(AM|PM)/);
      
      let sunriseDate = new Date(now);
      let sunsetDate = new Date(now);
      
      if (sunriseMatch) {
        let hour = parseInt(sunriseMatch[1]);
        const min = parseInt(sunriseMatch[2]);
        const period = sunriseMatch[3];
        if (period === "PM" && hour !== 12) hour += 12;
        if (period === "AM" && hour === 12) hour = 0;
        sunriseDate.setHours(hour, min, 0, 0);
      }
      
      if (sunsetMatch) {
        let hour = parseInt(sunsetMatch[1]);
        const min = parseInt(sunsetMatch[2]);
        const period = sunsetMatch[3];
        if (period === "PM" && hour !== 12) hour += 12;
        if (period === "AM" && hour === 12) hour = 0;
        sunsetDate.setHours(hour, min, 0, 0);
      }
      
      setWeather({
        temperature: Math.round(current.temp_c || 0),
        feelsLike: Math.round(current.feelslike_c || current.temp_c || 0),
        humidity: current.humidity || 0,
        windSpeed: Math.round((current.wind_kph || 0)), // Already in km/h
        windDirection: windDirection,
        pressure: Math.round(current.pressure_mb || 0), // Convert mb to hPa (they're the same)
        visibility: Math.round((current.vis_km || 10)), // Already in km
        uvIndex: Math.round(current.uv || 0),
        condition: getConditionFromCode(current.condition?.code || 1000),
        description: current.condition?.text || "Clear",
        location: locationName,
        sunrise: Math.floor(sunriseDate.getTime() / 1000),
        sunset: Math.floor(sunsetDate.getTime() / 1000),
        timezone: timezoneOffset,
        forecast,
      });
    } catch (err: any) {
      console.error("Error fetching weather:", err);
      if (err.code === 1) {
        setError("Location access denied. Please enable location services in your browser.");
      } else {
        setError("Failed to fetch weather data. Please try again.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherByLocation(position.coords.latitude, position.coords.longitude, true);
        },
        (error) => {
          setError("Unable to get location. Please enable location services.");
        }
      );
    }
  };

  useEffect(() => {
    // Load current location on mount
    const loadCurrentLocation = async () => {
      if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser.");
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherByLocation(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          setError("Unable to get your location. Please enable location services.");
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    };
    
    loadCurrentLocation();
  }, []);

  const getWindDirection = (degrees: number): string => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return directions[Math.round(degrees / 45) % 8];
  };

  const formatTime = (timestamp: number, timezoneOffset: number = 0): string => {
    // WeatherAPI.com provides local time, so we can use the timestamp directly
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-card shadow-card overflow-hidden">
        <div className="gradient-sky p-6 text-accent-foreground flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="rounded-2xl bg-card shadow-card overflow-hidden">
        <div className="gradient-sky p-6 text-accent-foreground">
          <p className="text-sm">Unable to load weather data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card shadow-card overflow-hidden">
      {/* Main weather display */}
      <div className="gradient-sky p-6 text-accent-foreground relative">
        {error && (
          <div className="mb-3 p-2 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2 text-xs">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
        
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span className="text-base font-semibold">{weather.location}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-accent-foreground hover:bg-accent-foreground/20"
                onClick={handleRefresh}
                disabled={refreshing || loading}
                title="Refresh weather"
              >
                <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
              </Button>
            </div>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-6xl font-bold font-display">
                {weather.temperature}°
              </span>
              <span className="text-xl mb-3">C</span>
            </div>
            <p className="text-base capitalize opacity-90 font-medium">
              {weather.description}
            </p>
            <p className="text-sm opacity-80 mt-1">
              Feels like {weather.feelsLike}°C
            </p>
          </div>
          <div className="animate-pulse-soft">
            <WeatherIcon condition={weather.condition} className="h-24 w-24" />
          </div>
        </div>

        {/* Detailed weather info grid */}
        <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-accent-foreground/20">
          <Card className="bg-accent-foreground/10 border-accent-foreground/20 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Droplets className="h-4 w-4 opacity-80" />
              <span className="text-xs opacity-80">Humidity</span>
            </div>
            <span className="text-lg font-semibold">{weather.humidity}%</span>
          </Card>
          
          <Card className="bg-accent-foreground/10 border-accent-foreground/20 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Wind className="h-4 w-4 opacity-80" />
              <span className="text-xs opacity-80">Wind</span>
            </div>
            <span className="text-lg font-semibold">
              {weather.windSpeed} km/h {getWindDirection(weather.windDirection)}
            </span>
          </Card>
          
          <Card className="bg-accent-foreground/10 border-accent-foreground/20 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Gauge className="h-4 w-4 opacity-80" />
              <span className="text-xs opacity-80">Pressure</span>
            </div>
            <span className="text-lg font-semibold">{weather.pressure} hPa</span>
          </Card>
          
          <Card className="bg-accent-foreground/10 border-accent-foreground/20 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="h-4 w-4 opacity-80" />
              <span className="text-xs opacity-80">Visibility</span>
            </div>
            <span className="text-lg font-semibold">{weather.visibility} km</span>
          </Card>
        </div>

        {/* Sunrise/Sunset and UV Index */}
        <div className="grid grid-cols-3 gap-3 mt-3">
          <div className="flex items-center gap-2">
            <Sunrise className="h-4 w-4 opacity-80" />
            <div>
              <p className="text-xs opacity-70">Sunrise</p>
              <p className="text-sm font-medium">{formatTime(weather.sunrise, weather.timezone)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Sunset className="h-4 w-4 opacity-80" />
            <div>
              <p className="text-xs opacity-70">Sunset</p>
              <p className="text-sm font-medium">{formatTime(weather.sunset, weather.timezone)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4 opacity-80" />
            <div>
              <p className="text-xs opacity-70">UV Index</p>
              <p className="text-sm font-medium">{weather.uvIndex}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 5-day forecast */}
      <div className="p-4 bg-muted/30">
        <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          5-Day Forecast
        </h4>
        <div className="space-y-2">
          {weather.forecast.map((day, index) => (
            <Card
              key={day.day}
              className="p-3 hover:bg-muted/50 transition-all cursor-pointer border-border/50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12">
                    <p className="text-xs font-medium text-muted-foreground">
                      {day.day}
                    </p>
                    {day.date && (
                      <p className="text-xs text-muted-foreground/70">{day.date}</p>
                    )}
                  </div>
                  <WeatherIcon condition={day.condition} className="h-8 w-8" />
                  <div className="flex-1">
                    <p className="text-sm font-medium capitalize">{day.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-semibold">{day.maxTemp}°</span>
                      <span className="text-xs text-muted-foreground">/</span>
                      <span className="text-xs text-muted-foreground">{day.minTemp}°</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{day.temp}°</p>
                </div>
            </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
