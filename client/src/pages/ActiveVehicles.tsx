import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import VehicleCard from "@/components/vehicles/VehicleCard";
import { useVehicleEntry } from "@/hooks/use-vehicle-entry";

export default function ActiveVehicles() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { updateServiceStatus } = useVehicleEntry();
  
  // Fetch active vehicles/service entries
  const { data: serviceEntries, isLoading } = useQuery({
    queryKey: ["/api/service-entries"],
  });
  
  // Filter entries by search term and status
  const filteredEntries = serviceEntries?.filter((entry: any) => {
    const matchesSearch = 
      !searchTerm ||
      entry.vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.vehicle.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.vehicle.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.vehicle.customer.phone.includes(searchTerm);
    
    const matchesStatus = 
      statusFilter === "all" || 
      entry.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
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
