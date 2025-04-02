import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import VehicleCard from "@/components/vehicles/VehicleCard";
import { useVehicleEntry } from "@/hooks/use-vehicle-entry";

export default function ActiveVehicles() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { updateServiceStatus } = useVehicleEntry();
  
  // Fetch active service entries
  const { data: basicEntries, isLoading: isLoadingBasic } = useQuery({
    queryKey: ["/api/service-entries"],
  });
  
  // Fetch details for each service entry
  const [serviceEntries, setServiceEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Effect to fetch detailed information for each entry
  useEffect(() => {
    async function fetchDetailsForEntries() {
      if (!basicEntries || !Array.isArray(basicEntries) || basicEntries.length === 0) {
        setServiceEntries([]);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
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
        setIsLoading(false);
      }
    }
    
    fetchDetailsForEntries();
  }, [basicEntries]);
  
  // Filter entries by search term and status
  const filteredEntries = serviceEntries && Array.isArray(serviceEntries) 
    ? serviceEntries.filter((entry: any) => {
        // First check if entry has vehicle data
        if (!entry.vehicle) return false;
        
        const matchesSearch = 
          !searchTerm ||
          (entry.vehicle.make && entry.vehicle.make.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (entry.vehicle.model && entry.vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (entry.vehicle.vehicleNumber && entry.vehicle.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (entry.vehicle.customer && entry.vehicle.customer.name && 
            entry.vehicle.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (entry.vehicle.customer && entry.vehicle.customer.phone && 
            entry.vehicle.customer.phone.includes(searchTerm));
        
        const matchesStatus = 
          statusFilter === "all" || 
          entry.status === statusFilter;
        
        return matchesSearch && matchesStatus;
      })
    : [];
  
  const handleUpdateStatus = (id: number, status: string) => {
    updateServiceStatus.mutate({ id, status });
  };
  
  return (
    <section className="py-4">
      <h2 className="text-xl font-bold mb-4">Active Vehicles</h2>
      
      <div className="mb-4 flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search vehicles or customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <span className="material-icons absolute left-2 top-2 text-neutral-600">search</span>
        </div>
        
        <div className="flex space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Status</option>
            <option value="waiting">Waiting</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
      </div>
      
      <div className="bg-white rounded-lg overflow-hidden shadow-md">
        {isLoading ? (
          <div className="p-4 text-center">Loading vehicles...</div>
        ) : filteredEntries?.length ? (
          filteredEntries.map((entry: any) => (
            <VehicleCard 
              key={entry.id} 
              entry={entry} 
              onUpdateStatus={handleUpdateStatus}
            />
          ))
        ) : (
          <div className="p-4 text-center text-neutral-500">
            No vehicles found matching your criteria.
          </div>
        )}
      </div>
    </section>
  );
}
