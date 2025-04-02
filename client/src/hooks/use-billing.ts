import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { BillingForm, ServiceItemForm } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useBilling() {
  const { toast } = useToast();

  const createServiceItem = useMutation({
    mutationFn: async (data: { serviceEntryId: number; productId: number; quantity: number; price: number; notes?: string }) => {
      const response = await apiRequest("POST", "/api/service-items", {
        serviceEntryId: data.serviceEntryId,
        productId: data.productId,
        quantity: data.quantity,
        price: data.price,
        notes: data.notes
      });
      return response.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Item Added",
        description: "Service item added successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/service-entries/${variables.serviceEntryId}/items`] });
      queryClient.invalidateQueries({ queryKey: [`/api/service-entries/${variables.serviceEntryId}`] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add service item",
        variant: "destructive",
      });
    },
  });

  const updateServiceItem = useMutation({
    mutationFn: async (data: { id: number; quantity: number; price: number; notes?: string }) => {
      const response = await apiRequest("PATCH", `/api/service-items/${data.id}`, {
        quantity: data.quantity,
        price: data.price,
        notes: data.notes
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Item Updated",
        description: "Service item updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/service-items"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update service item",
        variant: "destructive",
      });
    },
  });

  const deleteServiceItem = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/service-items/${id}`, undefined);
    },
    onSuccess: () => {
      toast({
        title: "Item Removed",
        description: "Service item removed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/service-items"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove service item",
        variant: "destructive",
      });
    },
  });

  const completeBilling = useMutation({
    mutationFn: async (data: BillingForm) => {
      const response = await apiRequest("POST", "/api/billing", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Billing Complete",
        description: "Billing completed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/service-entries"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete billing",
        variant: "destructive",
      });
    },
  });

  return {
    createServiceItem,
    updateServiceItem,
    deleteServiceItem,
    completeBilling,
  };
}
