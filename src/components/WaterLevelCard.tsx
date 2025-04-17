import { Droplets, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface WaterLevelCardProps {
  waterLevel: number; // Water level in percentage
  distance: number; // Distance in cm sent by IoT
}

const WaterLevelCard = ({ waterLevel, distance }: WaterLevelCardProps) => {
  // Define thresholds for status
  const isHigh = waterLevel > 75;
  const isLow = waterLevel < 25;

  // Dynamic stroke color based on water level
  const getStrokeColor = () => {
    const red = Math.min(255, Math.floor((waterLevel / 100) * 255));
    const blue = 255 - red;
    return `rgb(${red}, 0, ${blue})`;
  };

  // Calculate the stroke dasharray for the circular progress
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const progress = (waterLevel / 100) * circumference;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Water Level</CardTitle>
          <Droplets className="h-5 w-5 text-water" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="relative h-36 w-36">
              <svg className="h-full w-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="10"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke={getStrokeColor()}
                  strokeWidth="10"
                  strokeDasharray={`${progress} ${circumference}`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
                <text
                  x="50"
                  y="55"
                  fontSize="18"
                  textAnchor="middle"
                  fill="#1A202C"
                  fontWeight="bold"
                >
                  {waterLevel}%
                </text>
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Ultrasonic Sensor</span>
              <span
                className={`flex items-center font-medium ${
                  isHigh
                    ? "text-red-500"
                    : isLow
                    ? "text-green-500"
                    : "text-blue-500"
                }`}
              >
                {isHigh ? (
                  <>
                    <ArrowUpCircle className="mr-1 h-4 w-4" /> High
                  </>
                ) : isLow ? (
                  <>
                    <ArrowDownCircle className="mr-1 h-4 w-4" /> Low
                  </>
                ) : (
                  "Normal"
                )}
              </span>
            </div>
            <Progress value={waterLevel} className="h-2 bg-water-light" />
          </div>
          <div className="text-xs text-muted-foreground">
            <p>Threshold: 75% (Warning)</p>
            <p>Current Reading: {waterLevel}%</p>
            <p>Distance: {distance} cm</p> {/* New line for distance */}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WaterLevelCard;