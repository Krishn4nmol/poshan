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

// OpenWeatherMap API key - you should add this to your .env file
const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY || "demo";
const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5";

const getConditionFromCode = (code: number): "sunny" | "cloudy" | "rainy" | "partly-cloudy" => {
  if (code >= 200 && code < 600) return "rainy";
  if (code >= 600 && code < 700) return "cloudy";
  if (code === 800) return "sunny";
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

      // Fetch current weather by coordinates
      const currentResponse = await fetch(
        `${WEATHER_API_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`
      );
      
      if (!currentResponse.ok) {
        throw new Error("Failed to fetch weather data");
      }
      
      const currentData = await currentResponse.json();
      const locationName = currentData.name || "Current Location";

      // Fetch 5-day forecast
      const forecastResponse = await fetch(
        `${WEATHER_API_URL}/forecast?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`
      );
      
      if (!forecastResponse.ok) {
        throw new Error("Failed to fetch forecast data");
      }
      
      const forecastData = await forecastResponse.json();

      // Process 5-day forecast - get daily min/max temps
      const dailyForecasts: { [key: string]: { temps: number[], items: any[], date: Date } } = {};
      
      forecastData.list.forEach((item: any) => {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toDateString();
        if (!dailyForecasts[dateKey]) {
          dailyForecasts[dateKey] = { temps: [], items: [], date };
        }
        dailyForecasts[dateKey].temps.push(item.main.temp);
        dailyForecasts[dateKey].items.push(item);
      });

      const today = new Date();
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      
      const forecast = Object.entries(dailyForecasts)
        .slice(0, 5)
        .map(([dateKey, data], index) => {
          const date = data.date;
          const isToday = date.toDateString() === today.toDateString();
          const minTemp = Math.round(Math.min(...data.temps));
          const maxTemp = Math.round(Math.max(...data.temps));
          const avgTemp = Math.round(data.temps.reduce((a, b) => a + b, 0) / data.temps.length);
          const mainItem = data.items[Math.floor(data.items.length / 2)]; // Get middle item of the day
          
          return {
            day: isToday ? "Today" : index === 1 ? "Tomorrow" : days[date.getDay()],
            date: isToday ? "Today" : index === 1 ? "Tomorrow" : "",
            temp: avgTemp,
            minTemp,
            maxTemp,
            condition: getConditionFromCode(mainItem.weather[0].id),
            description: mainItem.weather[0].description,
          };
        });

      // Get wind direction in degrees
      const windDirection = currentData.wind.deg || 0;
      
      // Get timezone offset (in seconds) from API response
      const timezoneOffset = currentData.timezone || 0;
      
      setWeather({
        temperature: Math.round(currentData.main.temp),
        feelsLike: Math.round(currentData.main.feels_like),
        humidity: currentData.main.humidity,
        windSpeed: Math.round(currentData.wind.speed * 3.6), // Convert m/s to km/h
        windDirection: windDirection,
        pressure: currentData.main.pressure,
        visibility: Math.round((currentData.visibility || 10000) / 1000), // Convert to km
        uvIndex: Math.round((currentData.uvi || 0)),
        condition: getConditionFromCode(currentData.weather[0].id),
        description: currentData.weather[0].description,
        location: locationName,
        sunrise: currentData.sys.sunrise,
        sunset: currentData.sys.sunset,
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
    // OpenWeatherMap returns sunrise/sunset in UTC Unix timestamp (seconds)
    // timezoneOffset is the shift in seconds from UTC for the location
    // Convert UTC timestamp to location's local time
    const utcTime = timestamp * 1000; // Convert to milliseconds
    const localTime = utcTime + (timezoneOffset * 1000); // Add timezone offset
    const date = new Date(localTime);
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
