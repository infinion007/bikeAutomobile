import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { VehicleEntryForm } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useVehicleEntry() {
  const { toast } = useToast();

  const createVehicleEntry = useMutation({
    mutationFn: async (data: VehicleEntryForm) => {
      const response = await apiRequest("POST", "/api/vehicle-entries", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Vehicle entry created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/service-entries"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create vehicle entry",
        variant: "destructive",
      });
    },
  });

  const updateServiceStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/service-entries/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "Service status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/service-entries"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    },
  });

  return {
    createVehicleEntry,
    updateServiceStatus,
  };
}
