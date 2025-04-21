
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HalfCircleGauge } from "@/components/ui/custom-icons";
import { DropletIcon } from "lucide-react";

interface WaterFlowCardProps {
  flowRate: number; // L/min
  totalVolume: number; // Total liters
}

const WaterFlowCard = ({ flowRate, totalVolume }: WaterFlowCardProps) => {
  // Determine gauge color based on flow rate
  let gaugeColor = "#10B981"; // Green for normal flow
  if (flowRate > 50) {
    gaugeColor = "#EF4444"; // Red for high flow
  } else if (flowRate > 30) {
    gaugeColor = "#F97316"; // Orange for moderate-high flow
  }
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Water Flow Rate</CardTitle>
          <DropletIcon className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center space-y-4">
          <HalfCircleGauge 
            value={Math.min(flowRate, 60)} // Cap at 60 L/min for gauge
            max={60}
            color={gaugeColor}
            label={`${flowRate.toFixed(1)} L/min`}
          />
          
          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground mb-1">Total Volume</p>
            <p className="text-3xl font-bold">
              {totalVolume.toLocaleString()} L
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WaterFlowCard;

