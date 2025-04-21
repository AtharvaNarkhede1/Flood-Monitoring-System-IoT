
export interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  description: string;
  icon: string;
}

export interface SensorData {
  waterLevel: number;
  floatSensor: boolean;
  temperature: number;
  humidity: number;
  flowRate: number;  // L/min
  totalVolume: number;  // Total liters
}

export interface FirebaseData {
  distance: number;
  float_triggered: string;
  temperature: number;
  humidity: number;
  timestamp: string;
}
