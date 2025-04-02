import { formatCurrency, getStatusColor, getStatusLabel, getTimeSince } from "@/lib/utils";
import { ServiceEntryWithDetails } from "@shared/schema";
import { useState } from "react";
import BillingModal from "./BillingModal";

interface VehicleCardProps {
  entry: ServiceEntryWithDetails;
  onUpdateStatus?: (id: number, status: string) => void;
}

export default function VehicleCard({ entry, onUpdateStatus }: VehicleCardProps) {
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  
  // Default empty arrays and objects to prevent errors if properties are missing
  const { vehicle, status, totalAmount, entryDate } = entry;
  const items = entry.items || [];
  const statusStyle = getStatusColor(status);
  
  // Default to 'bike' if type is undefined
  const vehicleIcon = (vehicle && vehicle.type) ? (vehicle.type === 'bike' ? 'two_wheeler' : 'directions_car') : 'two_wheeler';
  
  const services = items
    .map(item => item.product.name)
    .join(", ")
    || entry.complaint
    || "No services specified";
  
  return (
    <>
      <div className="border-b border-neutral-200 p-4 hover:bg-neutral-50">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center">
              <span className="material-icons text-primary mr-2">{vehicleIcon}</span>
              <button 
                onClick={() => setIsBillingModalOpen(true)}
                className="font-medium hover:text-primary hover:underline text-left"
              >
                {vehicle?.make || 'Unknown'} {vehicle?.model || ''}
              </button>
              <span className={`ml-2 px-2 py-0.5 ${statusStyle.bg} ${statusStyle.text} rounded-full text-xs`}>
                {getStatusLabel(status)}
              </span>
            </div>
            <div className="text-sm text-neutral-600 mt-1 flex items-center">
              <span>{vehicle?.vehicleNumber || 'No number'} • {vehicle?.customer?.name || 'Unknown customer'}</span>
              {(status === 'waiting' || status === 'in_progress') && (
                <button 
                  onClick={() => setIsBillingModalOpen(true)}
                  className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full flex items-center font-medium"
                >
                  <span className="material-icons text-xs mr-0.5">add</span>
                  Add Item
                </button>
              )}
            </div>
            <div className="text-sm mt-1">
              Services: {services}
            </div>
            
            {status !== 'completed' && status !== 'delivered' && (
              <div className="mt-2 flex space-x-2">
                {status === 'in_progress' && (
                  <button 
                    onClick={() => setIsBillingModalOpen(true)}
                    className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded flex items-center"
                  >
                    <span className="material-icons text-sm mr-1">check_circle</span>
                    Complete & Bill
                  </button>
                )}
                
                {(status === 'waiting' || status === 'in_progress') && (
                  <button 
                    onClick={() => setIsBillingModalOpen(true)}
                    className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded flex items-center"
                  >
                    <span className="material-icons text-sm mr-1">add_shopping_cart</span>
                    Add Services
                  </button>
                )}
              </div>
            )}
          </div>
          
          <div className="text-right">
            <div className="font-bold">{formatCurrency(totalAmount)}</div>
            <div className="text-xs text-neutral-600">{getTimeSince(entryDate)}</div>
          </div>
        </div>
      </div>
      
      {isBillingModalOpen && (
        <BillingModal 
          isOpen={isBillingModalOpen}
          onClose={() => setIsBillingModalOpen(false)}
          serviceEntryId={entry.id}
        />
      )}
    </>
  );
}
