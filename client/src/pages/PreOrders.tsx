import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

// Define PreOrder type
interface PreOrder {
  id: number;
  itemName: string;
  advanceAmount: number;
  customerName: string;
  contactNumber: string;
  expectedDeliveryDate: string;
  status: 'pending' | 'delivered' | 'cancelled';
  notes: string;
  createdAt: string;
}

// Define form type for creating a new pre-order
interface PreOrderForm {
  itemName: string;
  advanceAmount: number;
  customerName: string;
  contactNumber: string;
  expectedDeliveryDate: string;
  notes: string;
}

export default function PreOrders() {
  const [isNewPreOrderOpen, setIsNewPreOrderOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newPreOrder, setNewPreOrder] = useState<PreOrderForm>({
    itemName: "",
    advanceAmount: 0,
    customerName: "",
    contactNumber: "",
    expectedDeliveryDate: "",
    notes: "",
  });

  // Fetch pre-orders
  const { data: preOrders = [], isLoading } = useQuery({
    queryKey: ["/api/pre-orders"],
    // If backend route doesn't exist, it will return an empty array due to our default value
  });

  // Create pre-order mutation
  const createPreOrderMutation = useMutation({
    mutationFn: async (data: PreOrderForm) => {
      return fetch("/api/pre-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to create pre-order");
        return res.json();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pre-orders"] });
      setIsNewPreOrderOpen(false);
      setNewPreOrder({
        itemName: "",
        advanceAmount: 0,
        customerName: "",
        contactNumber: "",
        expectedDeliveryDate: "",
        notes: "",
      });
      toast({
        title: "Success",
        description: "Pre-order created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mark as delivered mutation
  const markAsDeliveredMutation = useMutation({
    mutationFn: async (id: number) => {
      return fetch(`/api/pre-orders/${id}/deliver`, {
        method: "POST",
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to update pre-order");
        return res.json();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pre-orders"] });
      toast({
        title: "Success",
        description: "Pre-order marked as delivered",
      });
    },
  });

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewPreOrder((prev) => ({
      ...prev,
      [name]: name === "advanceAmount" ? parseFloat(value) || 0 : value,
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPreOrderMutation.mutate(newPreOrder);
  };

  // Filter pre-orders based on search term
  const filteredPreOrders = Array.isArray(preOrders)
    ? preOrders.filter(
        (order: PreOrder) =>
          order.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.contactNumber.includes(searchTerm)
      )
    : [];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pre-Orders</h1>
        <Button onClick={() => setIsNewPreOrderOpen(true)}>New Pre-Order</Button>
      </div>

      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search by item name, customer or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredPreOrders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No pre-orders found. Create a new pre-order to get started.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredPreOrders.map((order: PreOrder) => (
            <Card key={order.id} className={order.status === 'delivered' ? 'opacity-70' : ''}>
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <CardTitle className="text-lg">{order.itemName}</CardTitle>
                  <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                    {order.status === 'delivered' ? 'Delivered' : 'Pending'}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Advance:</span>
                    <span className="font-semibold">{formatCurrency(order.advanceAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer:</span>
                    <span>{order.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Contact:</span>
                    <span>{order.contactNumber}</span>
                  </div>
                  {order.expectedDeliveryDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expected Delivery:</span>
                      <span>{new Date(order.expectedDeliveryDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {order.notes && (
                    <div className="mt-2">
                      <span className="text-gray-600 block">Notes:</span>
                      <span className="text-sm">{order.notes}</span>
                    </div>
                  )}
                  {order.status === 'pending' && (
                    <Button
                      className="w-full mt-2"
                      onClick={() => markAsDeliveredMutation.mutate(order.id)}
                    >
                      Mark as Delivered
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* New Pre-Order Dialog */}
      <Dialog open={isNewPreOrderOpen} onOpenChange={setIsNewPreOrderOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>New Pre-Order</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-2">
                <Label htmlFor="itemName" className="col-span-4">
                  Item Name
                </Label>
                <Input
                  id="itemName"
                  name="itemName"
                  value={newPreOrder.itemName}
                  onChange={handleInputChange}
                  className="col-span-4"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-2">
                <Label htmlFor="advanceAmount" className="col-span-4">
                  Advance Amount (₹)
                </Label>
                <Input
                  id="advanceAmount"
                  name="advanceAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newPreOrder.advanceAmount}
                  onChange={handleInputChange}
                  className="col-span-4"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-2">
                <Label htmlFor="customerName" className="col-span-4">
                  Customer Name
                </Label>
                <Input
                  id="customerName"
                  name="customerName"
                  value={newPreOrder.customerName}
                  onChange={handleInputChange}
                  className="col-span-4"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-2">
                <Label htmlFor="contactNumber" className="col-span-4">
                  Contact Number
                </Label>
                <Input
                  id="contactNumber"
                  name="contactNumber"
                  value={newPreOrder.contactNumber}
                  onChange={handleInputChange}
                  className="col-span-4"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-2">
                <Label htmlFor="expectedDeliveryDate" className="col-span-4">
                  Expected Delivery Date
                </Label>
                <Input
                  id="expectedDeliveryDate"
                  name="expectedDeliveryDate"
                  type="date"
                  value={newPreOrder.expectedDeliveryDate}
                  onChange={handleInputChange}
                  className="col-span-4"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-2">
                <Label htmlFor="notes" className="col-span-4">
                  Notes
                </Label>
                <Input
                  id="notes"
                  name="notes"
                  value={newPreOrder.notes}
                  onChange={handleInputChange}
                  className="col-span-4"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={createPreOrderMutation.isPending}>
                {createPreOrderMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}