import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
    icon?: string;
  };
}

export default function StatCard({ title, value, icon, trend }: StatCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="text-primary text-sm font-medium">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
      
      {trend && (
        <div className={cn(
          "flex items-center text-xs",
          trend.isPositive ? "text-green-600" : 
          trend.isNeutral ? "text-neutral-600" : 
          "text-red-600"
        )}>
          <span className="material-icons text-sm">
            {trend.icon || (trend.isPositive ? "arrow_upward" : trend.isNeutral ? "sync" : "arrow_downward")}
          </span>
          <span>{trend.value}</span>
        </div>
      )}
    </div>
  );
}
