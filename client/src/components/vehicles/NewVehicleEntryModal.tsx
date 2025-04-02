import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { VehicleEntryForm, vehicleEntryFormSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useEffect, useState } from "react";

interface NewVehicleEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewVehicleEntryModal({ isOpen, onClose }: NewVehicleEntryModalProps) {
  const { toast } = useToast();
  
  const [servicesOpen, setServicesOpen] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<VehicleEntryForm>({
    resolver: zodResolver(vehicleEntryFormSchema),
    defaultValues: {
      vehicleType: "bike",
      status: "waiting",
    }
  });
  
  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      reset({
        vehicleType: "bike",
        make: "",
        model: "",
        vehicleNumber: "",
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        complaint: "",
        status: "waiting",
      });
      setServicesOpen(false);
    }
  }, [isOpen, reset]);
  
  const vehicleEntryMutation = useMutation({
    mutationFn: async (data: VehicleEntryForm) => {
      const response = await apiRequest("POST", "/api/vehicle-entries", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "New vehicle entry created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/service-entries"] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create vehicle entry",
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (data: VehicleEntryForm) => {
    vehicleEntryMutation.mutate(data);
  };
  
  // If modal is not open, don't render anything
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-neutral-200">
          <h3 className="text-lg font-bold">New Vehicle Entry</h3>
          <button 
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700"
          >
            <span className="material-icons">close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-700 mb-1">Vehicle Type</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input type="radio" value="bike" {...register("vehicleType")} className="mr-2" />
                <span>Bike</span>
              </label>
              <label className="flex items-center">
                <input type="radio" value="car" {...register("vehicleType")} className="mr-2" />
                <span>Car</span>
              </label>
              <label className="flex items-center">
                <input type="radio" value="other" {...register("vehicleType")} className="mr-2" />
                <span>Other</span>
              </label>
            </div>
            {errors.vehicleType && (
              <p className="text-red-500 text-xs mt-1">{errors.vehicleType.message}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Vehicle Make/Model</label>
              <input 
                type="text" 
                {...register("make")}
                className="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                placeholder="e.g. Hero Splendor Plus"
              />
              {errors.make && (
                <p className="text-red-500 text-xs mt-1">{errors.make.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Vehicle Number</label>
              <input 
                type="text" 
                {...register("vehicleNumber")}
                className="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                placeholder="e.g. DL 01 AB 1234"
              />
              {errors.vehicleNumber && (
                <p className="text-red-500 text-xs mt-1">{errors.vehicleNumber.message}</p>
              )}
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-neutral-700 mb-1">Customer Information</label>
            <div className="flex space-x-2">
              <div className="flex-grow">
                <input 
                  type="text" 
                  {...register("customerName")}
                  className="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                  placeholder="Customer Name"
                />
                {errors.customerName && (
                  <p className="text-red-500 text-xs mt-1">{errors.customerName.message}</p>
                )}
              </div>
              <div className="flex-grow">
                <input 
                  type="tel" 
                  {...register("customerPhone")}
                  className="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                  placeholder="Phone Number"
                />
                {errors.customerPhone && (
                  <p className="text-red-500 text-xs mt-1">{errors.customerPhone.message}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-neutral-700 mb-1">Email (Optional)</label>
            <input 
              type="email" 
              {...register("customerEmail")}
              className="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
              placeholder="Customer Email"
            />
            {errors.customerEmail && (
              <p className="text-red-500 text-xs mt-1">{errors.customerEmail.message}</p>
            )}
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-neutral-700 mb-1">Initial Complaint/Work Required</label>
            <textarea 
              {...register("complaint")}
              className="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent h-24 resize-none" 
              placeholder="Describe the work needed..."
            />
            {errors.complaint && (
              <p className="text-red-500 text-xs mt-1">{errors.complaint.message}</p>
            )}
          </div>
          
          <div className="mt-4 border-t border-neutral-200 pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 border border-neutral-300 rounded-md text-neutral-700 hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={vehicleEntryMutation.isPending}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-70"
            >
              {vehicleEntryMutation.isPending ? "Creating..." : "Create Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
