import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  openNewVehicleModal: () => void;
}

export default function BottomNavigation({ openNewVehicleModal }: BottomNavigationProps) {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-neutral-200 z-10">
      <div className="flex justify-around p-2">
        <Link 
          href="/"
          className={cn(
            "flex flex-col items-center p-1",
            location === "/" ? "text-primary" : "text-neutral-600"
          )}
        >
          <span className="material-icons">dashboard</span>
          <span className="text-xs">Dashboard</span>
        </Link>
        
        <Link 
          href="/vehicles"
          className={cn(
            "flex flex-col items-center p-1",
            location === "/vehicles" ? "text-primary" : "text-neutral-600"
          )}
        >
          <span className="material-icons">directions_car</span>
          <span className="text-xs">Vehicles</span>
        </Link>
        
        <button 
          onClick={openNewVehicleModal}
          className="flex flex-col items-center p-1 text-white bg-orange-500 rounded-full px-4 -mt-5 shadow-lg"
        >
          <span className="material-icons">add</span>
          <span className="text-xs">New</span>
        </button>
        
        <Link 
          href="/inventory"
          className={cn(
            "flex flex-col items-center p-1",
            location === "/inventory" ? "text-primary" : "text-neutral-600"
          )}
        >
          <span className="material-icons">inventory_2</span>
          <span className="text-xs">Inventory</span>
        </Link>
        
        <Link 
          href="/reports"
          className={cn(
            "flex flex-col items-center p-1",
            location === "/reports" ? "text-primary" : "text-neutral-600"
          )}
        >
          <span className="material-icons">receipt_long</span>
          <span className="text-xs">Reports</span>
        </Link>
      </div>
    </nav>
  );
}
