import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { VehicleEntryForm, vehicleEntryFormSchema, bikeMakes } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

// Use React.useEffect instead of importing it directly
const { useEffect } = React;

interface NewVehicleEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewVehicleEntryModal({ isOpen, onClose }: NewVehicleEntryModalProps) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<VehicleEntryForm>({
    resolver: zodResolver(vehicleEntryFormSchema),
    defaultValues: {
      vehicleType: "bike",
      make: "Hero",
      status: "in_progress",
    }
  });
  
  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      reset({
        vehicleType: "bike",
        make: "Hero",
        model: "",
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        status: "in_progress",
      });
    }
  }, [isOpen, reset]);
  
  const handleClose = () => {
    // Dispatch custom event that NewVehicleEntry component can listen for
    window.dispatchEvent(new Event("vehicleModalClosed"));
    
    // Call the original onClose function
    onClose();
    
    // If we're on the new-entry route, navigate back to home
    if (window.location.pathname === "/new-entry") {
      navigate("/");
    }
  };
  
  const vehicleEntryMutation = useMutation({
    mutationFn: async (data: VehicleEntryForm) => {
      // The backend will auto-generate a vehicle number since it's not in our form anymore
      const response = await apiRequest("POST", "/api/vehicle-entries", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "New vehicle entry created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/service-entries"] });
      handleClose();
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
          <h3 className="text-lg font-bold">New Bike Entry</h3>
          <button 
            onClick={handleClose}
            className="text-neutral-500 hover:text-neutral-700"
          >
            <span className="material-icons">close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-4">
          {/* Vehicle Make dropdown */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Bike Make <span className="text-red-500">*</span>
            </label>
            <select
              {...register("make")}
              className="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {bikeMakes.map((make) => (
                <option key={make} value={make}>
                  {make}
                </option>
              ))}
            </select>
            {errors.make && (
              <p className="text-red-500 text-xs mt-1">{errors.make.message}</p>
            )}
          </div>
          
          {/* Model input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Bike Model
            </label>
            <input 
              type="text" 
              {...register("model")}
              className="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
              placeholder="e.g. Splendor Plus, CD 100"
            />
            {errors.model && (
              <p className="text-red-500 text-xs mt-1">{errors.model.message}</p>
            )}
          </div>
          
          {/* Customer Information section */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-neutral-700 mb-1">Customer Information</label>
            <div className="flex space-x-2">
              <div className="flex-grow">
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
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
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Phone
                </label>
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
          
          {/* Email field */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Email (Optional)
            </label>
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
          
          {/* Form buttons */}
          <div className="mt-6 border-t border-neutral-200 pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={handleClose}
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