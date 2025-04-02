import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import StatCard from "@/components/dashboard/StatCard";
import QuickAction from "@/components/dashboard/QuickAction";
import VehicleCard from "@/components/vehicles/VehicleCard";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useVehicleEntry } from "@/hooks/use-vehicle-entry";
import NewVehicleEntryModal from "@/components/vehicles/NewVehicleEntryModal";

export default function Dashboard() {
  const [, navigate] = useLocation();
  const [newVehicleModalOpen, setNewVehicleModalOpen] = useState(false);
  const { updateServiceStatus } = useVehicleEntry();
  
  // Get current date
  const currentDate = formatDate(new Date());
  
  // Fetch dashboard stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });
  
  // Fetch basic service entries
  const { data: basicEntries, isLoading: isLoadingBasic } = useQuery({
    queryKey: ["/api/service-entries"],
  });
  
  // Fetch details for each service entry
  const [serviceEntries, setServiceEntries] = useState<any[]>([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState(true);
  
  // Effect to fetch detailed information for each entry
  useEffect(() => {
    async function fetchDetailsForEntries() {
      if (!basicEntries || !Array.isArray(basicEntries) || basicEntries.length === 0) {
        setServiceEntries([]);
        setIsLoadingEntries(false);
        return;
      }
      
      setIsLoadingEntries(true);
      try {
        const detailedEntries = await Promise.all(
          basicEntries.map(async (entry) => {
            const response = await fetch(`/api/service-entries/${entry.id}/details`);
            if (response.ok) {
              return await response.json();
            }
            return null;
          })
        );
        
        // Filter out any null entries (failed requests)
        setServiceEntries(detailedEntries.filter(entry => entry !== null));
      } catch (error) {
        console.error("Error fetching entry details:", error);
      } finally {
        setIsLoadingEntries(false);
      }
    }
    
    fetchDetailsForEntries();
  }, [basicEntries]);
  
  const handleUpdateStatus = (id: number, status: string) => {
    updateServiceStatus.mutate({ id, status });
  };
  
  const openNewVehicleModal = () => setNewVehicleModalOpen(true);
  const closeNewVehicleModal = () => setNewVehicleModalOpen(false);
  
  return (
    <section className="py-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Dashboard</h2>
        <div className="text-sm text-neutral-600">
          {currentDate}
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="TODAY'S VEHICLES" 
          value={isLoadingStats ? "..." : stats?.vehicleCount || 0}
          trend={{
            value: "+2 from yesterday",
            isPositive: true
          }} 
        />
        
        <StatCard 
          title="ACTIVE JOBS" 
          value={isLoadingStats ? "..." : stats?.activeJobs || 0}
          trend={{
            value: "In progress",
            isNeutral: true,
            icon: "sync"
          }} 
        />
        
        <StatCard 
          title="TODAY'S REVENUE" 
          value={isLoadingStats ? "..." : formatCurrency(stats?.totalRevenue || 0)}
          trend={{
            value: "+15% from yesterday",
            isPositive: true
          }} 
        />
        
        <StatCard 
          title="PENDING PAYMENTS" 
          value={isLoadingStats ? "..." : formatCurrency(stats?.pendingPayments || 0)}
          trend={{
            value: "2 customers",
            isPositive: false,
            icon: "priority_high"
          }} 
        />
      </div>
      
      {/* Quick Actions */}
      <div className="flex overflow-x-auto space-x-4 pb-2 mb-6">
        <QuickAction 
          label="New Entry" 
          icon="add_circle" 
          onClick={openNewVehicleModal} 
          primary 
        />
        
        <QuickAction 
          label="Create Bill" 
          icon="receipt" 
          onClick={() => navigate("/vehicles")}
          iconColor="text-orange-500" 
        />
        
        <QuickAction 
          label="Find Customer" 
          icon="person_search" 
          onClick={() => navigate("/customers")}
          iconColor="text-primary" 
        />
        
        <QuickAction 
          label="Inventory" 
          icon="inventory" 
          onClick={() => navigate("/inventory")}
          iconColor="text-primary" 
        />
        
        <QuickAction 
          label="Reports" 
          icon="summarize" 
          onClick={() => navigate("/reports")}
          iconColor="text-primary" 
        />
      </div>
      
      {/* Recent Vehicles */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">Recent Vehicles</h3>
          <a href="/vehicles" className="text-primary text-sm">View all</a>
        </div>
        
        <div className="bg-white rounded-lg overflow-hidden shadow-md">
          {isLoadingEntries ? (
            <div className="p-4 text-center">Loading recent vehicles...</div>
          ) : serviceEntries?.length ? (
            serviceEntries.slice(0, 3).map((entry: any) => (
              <VehicleCard 
                key={entry.id} 
                entry={entry} 
                onUpdateStatus={handleUpdateStatus}
              />
            ))
          ) : (
            <div className="p-4 text-center text-neutral-500">
              No vehicles found. Add a new vehicle to get started.
            </div>
          )}
        </div>
      </div>
      
      {/* Today's Summary */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">Today's Summary</h3>
          <a href="/reports" className="text-primary text-sm">Detailed report</a>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-md">
          <div className="flex flex-col md:flex-row md:justify-between">
            <div className="mb-4 md:mb-0">
              <div className="text-neutral-600 text-sm mb-1">Services Completed</div>
              <div className="font-bold text-lg">
                {isLoadingStats ? "..." : stats?.vehicleCount - stats?.activeJobs || 0}
              </div>
            </div>
            <div className="mb-4 md:mb-0">
              <div className="text-neutral-600 text-sm mb-1">Products Sold</div>
              <div className="font-bold text-lg">
                {isLoadingStats ? "..." : "18"}
              </div>
            </div>
            <div className="mb-4 md:mb-0">
              <div className="text-neutral-600 text-sm mb-1">New Customers</div>
              <div className="font-bold text-lg">
                {isLoadingStats ? "..." : "3"}
              </div>
            </div>
            <div>
              <div className="text-neutral-600 text-sm mb-1">Total Revenue</div>
              <div className="font-bold text-lg">
                {isLoadingStats ? "..." : formatCurrency(stats?.totalRevenue || 0)}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* New Vehicle Entry Modal */}
      <NewVehicleEntryModal 
        isOpen={newVehicleModalOpen}
        onClose={closeNewVehicleModal}
      />
    </section>
  );
}
