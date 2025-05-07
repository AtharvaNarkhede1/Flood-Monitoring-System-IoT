import { ref, onValue, off } from 'firebase/database';
import { db } from './firebase';
import { WeatherData, SensorData, FirebaseData } from './types';

export type { WeatherData, SensorData };

// Fetch data from Firebase
export const subscribeToData = (
  onDataUpdate: (data: {
    sensorData: SensorData;
    weatherData: WeatherData;
    predictionProbability: number;
  }) => void
) => {
  const today = new Date().toISOString().split('T')[0];
  const iotRef = ref(db, `flood_monitoring/iot_data/latest/${today}`);
  const weatherRef = ref(db, `flood_monitoring/weather_data/${today}`);
  const flowDataRef = ref(db, `flood_monitoring/flow_data/${today}`); // Add flow_data reference

  // Subscribe to IoT data
  const iotListener = onValue(iotRef, (snapshot) => {
    const iotData = snapshot.val();
    if (iotData) {
      const keys = Object.keys(iotData);
      const latestIoT = iotData[keys[keys.length - 1]] as FirebaseData;
      console.log("Latest IoT data:", latestIoT);

      const sensorData: Partial<SensorData> = {
        waterLevel: latestIoT.P || 0, // Use P directly as percentage
        floatSensor: latestIoT.float_triggered === "true",
        distance: latestIoT.distance || 0, // Use distance directly
        temperature: latestIoT.temperature || 0,
        humidity: latestIoT.humidity || 0
      };

      // Fetch flow data
      onValue(
        flowDataRef,
        (flowSnapshot) => {
          const flowData = flowSnapshot.val();
          console.log("Flow data:", flowData);

          // Get the latest flow data
          const latestFlowKey = flowData ? Object.keys(flowData).pop() : null;
          const latestFlowData = latestFlowKey ? flowData[latestFlowKey] : null;

          // Add flow rate and total liters to sensor data
          if (latestFlowData) {
            sensorData.flowRate = latestFlowData.flow_lpm || 0;
            sensorData.totalVolume = latestFlowData.total_liters || 0;
          } else {
            sensorData.flowRate = 0;
            sensorData.totalVolume = 0;
          }

          // Get weather data and calculate prediction
          onValue(
            weatherRef,
            (weatherSnapshot) => {
              const weatherData = weatherSnapshot.val();
              console.log("Weather data:", weatherData);

              const latestWeather = weatherData
                ? weatherData[Object.keys(weatherData)[Object.keys(weatherData).length - 1]]
                : null;

              const weatherInfo: WeatherData = latestWeather
                ? {
                    location: CITY,
                    temperature: latestWeather.temperature,
                    humidity: latestWeather.humidity,
                    windSpeed: latestWeather.wind_speed,
                    precipitation: latestWeather.precipitation,
                    description: latestWeather.weather || "Unknown",
                    icon: getWeatherIcon(latestWeather.weather || ""),
                  }
                : {
                    location: CITY,
                    temperature: 0,
                    humidity: 0,
                    windSpeed: 0,
                    precipitation: 0,
                    description: "No data available",
                    icon: "03d",
                  };

              const probability = calculatePredictionProbability(
                sensorData as SensorData,
                weatherInfo
              );

              onDataUpdate({
                sensorData: sensorData as SensorData,
                weatherData: weatherInfo,
                predictionProbability: probability,
              });
            },
            { onlyOnce: true }
          );
        },
        { onlyOnce: true }
      );
    } else {
      console.error("No IoT data available");
      // Return fallback data when no data is available
      onDataUpdate({
        sensorData: {
          waterLevel: 0,
          floatSensor: false,
          distance: 0,
          temperature: 0,
          humidity: 0,
          flowRate: 0,
          totalVolume: 0,
        },
        weatherData: {
          location: CITY,
          temperature: 0,
          humidity: 0,
          windSpeed: 0,
          precipitation: 0,
          description: "No data available",
          icon: "03d",
        },
        predictionProbability: 0,
      });
    }
  });

  // Return cleanup function
  return () => {
    off(iotRef);
    off(weatherRef);
    off(flowDataRef); // Ensure all listeners are cleaned up properly
  };
};

// Helper function to get weather icon code
const getWeatherIcon = (description: string): string => {
  const desc = description.toLowerCase();
  if (desc.includes("rain")) return "09d";
  if (desc.includes("cloud")) return "03d";
  if (desc.includes("clear")) return "01d";
  if (desc.includes("snow")) return "13d";
  if (desc.includes("thunder")) return "11d";
  return "02d";
};

const CITY = "Mumbai"; // Matching your Python script

// These functions are kept for compatibility
export const fetchAllData = async () => {
  return new Promise((resolve) => {
    const unsubscribe = subscribeToData((data) => {
      resolve(data);
      unsubscribe();
    });
  });
};

export const calculatePredictionProbability = (
  sensorData: SensorData,
  weatherData: WeatherData
): number => {
  let probability = 0;

  // Water level contributes 40% to the prediction
  probability += (sensorData.waterLevel / 100) * 40;

  // Float sensor contributes 15% to the prediction
  if (sensorData.floatSensor) {
    probability += 15;
  }

  // Weather precipitation chance contributes 30% to the prediction
  probability += (weatherData.precipitation / 100) * 30;

  // High humidity and temp contribute 15% to the prediction
  const tempHumidityFactor =
    (sensorData.humidity / 100) * 0.7 +
    (Math.min(sensorData.temperature, 40) / 40) * 0.3;
  probability += tempHumidityFactor * 15;

  return Math.min(100, Math.max(0, Math.round(probability)));
};

// Export these for compatibility
export const fetchWeatherData = async () => {
  const data = await fetchAllData();
  return (data as any).weatherData;
};

export const getSensorData = async () => {
  const data = await fetchAllData();
  return (data as any).sensorData;
};