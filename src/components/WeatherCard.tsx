import { 
  CloudRain, 
  Wind, 
  Thermometer, 
  CloudSun, 
  CloudSnow, 
  Cloud,
  Sun
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeatherData } from "@/lib/api";

interface WeatherCardProps {
  weatherData: WeatherData | null; // Accepts null for handling missing data
}

// Function to map OpenWeather icon codes to Lucide icons
const getWeatherIcon = (icon: string) => {
  switch (icon.substring(0, 2)) {
    case "01": // clear sky
      return <Sun className="h-12 w-12 text-amber-400" />;
    case "02": // few clouds
    case "03": // scattered clouds
      return <CloudSun className="h-12 w-12 text-amber-400" />;
    case "04": // broken clouds
      return <Cloud className="h-12 w-12 text-gray-400" />;
    case "09": // shower rain
    case "10": // rain
      return <CloudRain className="h-12 w-12 text-blue-400" />;
    case "13": // snow
      return <CloudSnow className="h-12 w-12 text-blue-200" />;
    default: // default to partly cloudy
      return <CloudSun className="h-12 w-12 text-amber-400" />;
  }
};

const WeatherCard = ({ weatherData }: WeatherCardProps) => {
  if (!weatherData) {
    // Display a loading or error message if `weatherData` is null
    return (
      <Card className="h-8/12">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">Weather Data</CardTitle>
            <CloudSun className="h-5 w-5 text-amber-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            <p>Loading weather data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-8/12">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Weather Data</CardTitle>
          <CloudSun className="h-5 w-5 text-amber-400" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          {/* Location and Weather Icon */}
          <div className="flex items-center space-x-2">
            <h3 className="text-xl font-semibold">{weatherData.location}</h3>
            {getWeatherIcon(weatherData.icon)}
          </div>
          
          {/* Temperature */}
          <div className="text-3xl font-bold">{weatherData.temperature}°C</div>
          
          {/* Weather Description */}
          <div className="text-sm text-muted-foreground capitalize">
            {weatherData.description || "No description available"}
          </div>
          
          {/* Additional Weather Details */}
          <div className="grid grid-cols-2 gap-4 w-full">
            {/* Precipitation */}
            <div className="flex flex-col items-center p-2 bg-secondary rounded-md">
              <div className="flex items-center text-sm text-muted-foreground mb-1">
                <CloudRain className="h-4 w-4 mr-1" />
                <span>Precipitation</span>
              </div>
              <span className="font-semibold">
                {weatherData.precipitation !== undefined
                  ? `${weatherData.precipitation}%`
                  : "N/A"}
              </span>
            </div>
            
            {/* Wind Speed */}
            <div className="flex flex-col items-center p-2 bg-secondary rounded-md">
              <div className="flex items-center text-sm text-muted-foreground mb-1">
                <Wind className="h-4 w-4 mr-1" />
                <span>Wind Speed</span>
              </div>
              <span className="font-semibold">
                {weatherData.windSpeed !== undefined
                  ? `${weatherData.windSpeed} m/s`
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherCard;