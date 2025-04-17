import React from "react";

export const WaveIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M2 12h2a6 6 0 0 1 6-6 6 6 0 0 1 6 6 6 6 0 0 0 6 6h2" />
  </svg>
);

export const GaugeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    <path d="M19.42 5.57a9 9 0 1 0 0 12.86" />
    <path d="M11.43 2a9 9 0 0 1 9.2 9.57" />
  </svg>
);

export const HalfCircleGauge = ({
  value = 0,
  max = 100,
  color = "#7C6BD9",
  size = 200,
  thickness = 10,
  label = "",
}: {
  value: number;
  max?: number;
  color?: string;
  size?: number;
  thickness?: number;
  label?: string;
}) => {
  const normalizedValue = Math.min(100, Math.max(0, value)) / max;
  const radius = (size - thickness) / 2;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference * (1 - normalizedValue);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size / 2 + 20 }}>
        <svg
          width={size}
          height={size / 2 + thickness}
          viewBox={`0 0 ${size} ${size / 2 + thickness}`}
          style={{ overflow: "visible" }}
        >
          {/* Background arc */}
          <path
            d={`M ${thickness / 2}, ${size / 2} 
                A ${radius}, ${radius} 0 0, 1 ${size - thickness / 2}, ${size / 2}`}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={thickness}
            strokeLinecap="round"
          />
          
          {/* Foreground arc */}
          <path
            d={`M ${thickness / 2}, ${size / 2} 
                A ${radius}, ${radius} 0 0, 1 ${size - thickness / 2}, ${size / 2}`}
            fill="none"
            stroke={color}
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(180 ${size / 2} ${size / 2})`}
          />
          
          {/* Value text */}
          <text
            x={size / 2}
            y={size / 2 + 10}
            textAnchor="middle"
            fontSize={size / 8}
            fontWeight="bold"
            fill="currentColor"
          >
            {value}%
          </text>
        </svg>
      </div>
      
      {label && (
        <div className="mt-2 text-center text-sm text-muted-foreground">
          {label}
        </div>
      )}
    </div>
  );
};

export const PredictionGauge = ({
  waterLevel,
  floatSensorActive,
  temperature,
  humidity,
  windSpeed,
  precipitation,
}: {
  waterLevel: number;
  floatSensorActive: boolean;
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
}) => {
  // Calculate the percentage
  let predictionPercentage = waterLevel;

  // Adjust for temperature and humidity
  if (
    temperature >= 27.05 - 3 &&
    temperature <= 27.05 + 3 &&
    humidity >= 83.5 - 5 &&
    humidity <= 83.5 + 5
  ) {
    predictionPercentage += 5;
  }
  
  // Adjust for wind speed
  if (windSpeed >= 30) {
    predictionPercentage += 5;
  }
  
  // Adjust for precipitation
  if (precipitation >= 80) {
    predictionPercentage += 10;
  } else if (precipitation >= 60) {
    predictionPercentage += 5;
  } else if (precipitation >= 40) {
    predictionPercentage += 3;
  } else {
    predictionPercentage += 1;
  }
  
  // Handle float sensor spike
  if (floatSensorActive) {
    predictionPercentage = Math.max(predictionPercentage, 80);
  }
  
  // Cap percentage at 100
  predictionPercentage = Math.min(predictionPercentage, 100);

  // Determine risk level and color
  const riskColor =
    predictionPercentage >= 75
      ? "text-red-500"
      : predictionPercentage >= 50
      ? "text-yellow-500"
      : "text-green-500";
  const riskLevel =
    predictionPercentage >= 75
      ? "High Risk"
      : predictionPercentage >= 50
      ? "Moderate Risk"
      : "Low Risk";

  // Dynamic stroke color
  const getStrokeColor = () => {
    const red = Math.min(255, Math.floor((predictionPercentage / 100) * 255));
    const green = 255 - red;
    return `rgb(${red}, ${green}, 0)`;
  };

  // Circular gauge calculations
  const size = 200;
  const thickness = 10;
  const radius = (size - thickness) / 2;
  const circumference = Math.PI * radius;
  const normalizedValue = Math.min(100, Math.max(0, predictionPercentage)) / 100;
  const strokeDashoffset = circumference * (1 - normalizedValue);

  return (
    <div className="flex flex-col items-center p-4">
      <h2 className="mb-4 text-lg font-medium">Total Prediction Probability</h2>
      <div className="relative" style={{ width: size, height: size / 2 + 20 }}>
        <svg
          width={size}
          height={size / 2 + thickness}
          viewBox={`0 0 ${size} ${size / 2 + thickness}`}
          style={{ overflow: "visible" }}
        >
          {/* Background arc */}
          <path
            d={`M ${thickness / 2}, ${size / 2} 
                A ${radius}, ${radius} 0 0, 1 ${size - thickness / 2}, ${size / 2}`}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={thickness}
            strokeLinecap="round"
          />

          {/* Foreground arc */}
          <path
            d={`M ${thickness / 2}, ${size / 2} 
                A ${radius}, ${radius} 0 0, 1 ${size - thickness / 2}, ${size / 2}`}
            fill="none"
            stroke={getStrokeColor()}
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(180 ${size / 2} ${size / 2})`}
          />

          {/* Value text */}
          <text
            x={size / 2}
            y={size / 2 + 10}
            textAnchor="middle"
            fontSize={size / 8}
            fontWeight="bold"
            fill="currentColor"
          >
            {Math.round(predictionPercentage)}%
          </text>
        </svg>
      </div>

      <p className={`mt-4 text-center text-sm font-medium ${riskColor}`}>
        {riskLevel}
      </p>

      <div className="mt-4 text-sm text-muted">
        <p>Contributing Factors:</p>
        <ul className="ml-4 list-disc">
          <li>Water Level: {waterLevel}%</li>
          <li>
            Float Sensor:{" "}
            <span
              className={`font-medium ${
                floatSensorActive ? "text-red-500" : "text-green-500"
              }`}
            >
              {floatSensorActive ? "Active" : "Inactive"}
            </span>
          </li>
          <li>Temperature: {temperature}°C</li>
          <li>Humidity: {humidity}%</li>
          <li>Windspeed: {windSpeed} m/s</li>
          <li>Precipitation: {precipitation}%</li>
        </ul>
      </div>

      <p
        className={`mt-4 rounded-md px-4 py-2 text-center text-white ${
          predictionPercentage >= 75
            ? "bg-red-500"
            : predictionPercentage >= 50
            ? "bg-yellow-500"
            : "bg-green-500"
        }`}
      >
        {predictionPercentage >= 75
          ? "Take immediate action!"
          : predictionPercentage >= 50
          ? "Monitor the situation closely."
          : "Conditions normal. No action needed."}
      </p>
    </div>
  );
};