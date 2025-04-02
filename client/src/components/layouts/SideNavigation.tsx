import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface SideNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

export default function SideNavigation({ isOpen, onClose }: SideNavigationProps) {
  const [location] = useLocation();

  const navItems: NavItem[] = [
    { path: "/", label: "Dashboard", icon: "dashboard" },
    { path: "/new-entry", label: "New Vehicle Entry", icon: "directions_car" },
    { path: "/vehicles", label: "Active Vehicles", icon: "two_wheeler" },
    { path: "/customers", label: "Customers", icon: "people" },
    { path: "/inventory", label: "Inventory", icon: "inventory_2" },
    { path: "/reports", label: "Reports", icon: "bar_chart" },
    { path: "/settings", label: "Settings", icon: "settings" },
  ];

  return (
    <aside 
      className={cn(
        "fixed top-0 left-0 h-full w-64 bg-white shadow-md z-20 transform transition-transform duration-300 ease-in-out pt-14",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="p-4 border-b border-neutral-200">
        <div className="flex items-center space-x-3">
          <span className="material-icons text-primary text-3xl">store</span>
          <div>
            <h2 className="font-bold">City Auto Shop</h2>
            <p className="text-sm text-neutral-600">Workshop Manager</p>
          </div>
        </div>
      </div>
      
      <nav className="py-4">
        <ul>
          {navItems.map((item) => (
            <li key={item.path}>
              <Link 
                href={item.path}
                onClick={onClose}
                className={cn(
                  "flex items-center px-4 py-3",
                  location === item.path 
                    ? "text-primary bg-blue-50" 
                    : "hover:bg-neutral-100"
                )}
              >
                <span className="material-icons mr-3">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
