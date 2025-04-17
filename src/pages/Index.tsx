
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import WaterLevelCard from "@/components/WaterLevelCard";
import FloatSensorCard from "@/components/FloatSensorCard";
import PredictionCard from "@/components/PredictionCard";
import WeatherCard from "@/components/WeatherCard";
import TempHumidityCard from "@/components/TempHumidityCard";
import { subscribeToData, type SensorData, type WeatherData } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [sensorData, setSensorData] = useState<SensorData>({
    waterLevel: 0,
    floatSensor: false,
    temperature: 0,
    humidity: 0
  });
  
  const [weatherData, setWeatherData] = useState<WeatherData>({
    location: "Connecting...",
    temperature: 0,
    humidity: 0,
    windSpeed: 0,
    precipitation: 0,
    description: "Waiting for API connection",
    icon: "03d",
  });
  
  const [predictionValue, setPredictionValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToData((data) => {
      console.log("Received data update:", data);
      setSensorData(data.sensorData);
      setWeatherData(data.weatherData);
      setPredictionValue(data.predictionProbability);
      
      if (loading) {
        setLoading(false);
        toast({
          title: "Connected to Firebase",
          description: "Successfully connected to IoT sensors",
          variant: "default",
        });
      }
    });

    return () => unsubscribe();
  }, [loading]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6">
        {error && (
          <div className="mb-4 p-3 bg-destructive/15 text-destructive rounded-md">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Connecting to data sources...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-6">
              <WaterLevelCard waterLevel={sensorData.waterLevel} />
              <FloatSensorCard isActive={sensorData.floatSensor} />
            </div>
            
            <div>
              <PredictionCard 
                predictionValue={predictionValue}
                waterLevel={sensorData.waterLevel}
                floatSensor={sensorData.floatSensor}
                temperature={sensorData.temperature}
              />
            </div>
            
            <div className="space-y-6">
              <WeatherCard weatherData={weatherData} />
              <TempHumidityCard 
                temperature={sensorData.temperature}
                humidity={sensorData.humidity} 
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
