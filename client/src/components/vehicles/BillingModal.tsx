import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { formatCurrency, calculateTotals } from "@/lib/utils";
import { Product, ServiceItemForm, BillingForm, ServiceEntryWithDetails } from "@shared/schema";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface BillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceEntryId: number;
}

export default function BillingModal({ isOpen, onClose, serviceEntryId }: BillingModalProps) {
  const { toast } = useToast();
  
  const [items, setItems] = useState<ServiceItemForm[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "upi" | "card" | "split">("cash");
  const [totals, setTotals] = useState({ subtotal: 0, taxRate: 0.18, taxAmount: 0, totalAmount: 0, discount: 0 });
  const [splitPayments, setSplitPayments] = useState({
    cash: 0,
    upi: 0,
    card: 0
  });
  const [showCompletionConfirm, setShowCompletionConfirm] = useState(false);
  
  // Fetch service entry details
  const { data: serviceEntry, isLoading: isLoadingServiceEntry } = useQuery<ServiceEntryWithDetails>({
    queryKey: [`/api/service-entries/${serviceEntryId}/details`],
    enabled: isOpen && !!serviceEntryId,
  });
  
  // Removed products query since we're using text input for items now
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  
  // Initialize items from service entry data
  useEffect(() => {
    if (serviceEntry && serviceEntry.items && Array.isArray(serviceEntry.items) && serviceEntry.items.length > 0) {
      const initialItems = serviceEntry.items.map(item => ({
        id: item.id,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        notes: item.notes || '',
      }));
      setItems(initialItems);
    } else {
      // Reset items when opening a service entry with no items
      setItems([]);
    }
  }, [serviceEntry]);
  
  // Update totals when items change
  useEffect(() => {
    setTotals(calculateTotals(items, totals.discount));
  }, [items]);
  
  // Handle adding a custom item to the bill
  const handleAddItem = () => {
    // Validate inputs
    if (!newItemName.trim()) {
      toast({
        title: "Error",
        description: "Item name is required",
        variant: "destructive",
      });
      return;
    }
    
    const price = parseFloat(newItemPrice);
    if (isNaN(price) || price <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid price",
        variant: "destructive",
      });
      return;
    }
    
    // Add new item
    setItems([
      ...items,
      {
        productName: newItemName.trim(),
        quantity: 1,
        price: price,
        notes: '',
      }
    ]);
    
    // Reset form
    setNewItemName("");
    setNewItemPrice("");
    document.getElementById('productDropdown')?.classList.add('hidden');
  };
  
  // Handle removing an item
  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };
  
  // Handle quantity change
  const handleQuantityChange = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const updatedItems = [...items];
    updatedItems[index].quantity = newQuantity;
    setItems(updatedItems);
  };
  
  // Handle completing the billing
  const billingMutation = useMutation({
    mutationFn: async (data: BillingForm) => {
      const response = await apiRequest("POST", "/api/billing", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Bill generated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/service-entries"] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate bill",
        variant: "destructive",
      });
    }
  });
  
  // Handle saving items without completing
  const saveItemsMutation = useMutation<ServiceEntryWithDetails, Error, BillingForm>({
    mutationFn: async (data: BillingForm) => {
      const response = await apiRequest("POST", "/api/billing", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Items saved successfully",
      });
      // Invalidate both the service entries list and the specific service entry details
      queryClient.invalidateQueries({ queryKey: ["/api/service-entries"] });
      queryClient.invalidateQueries({ queryKey: [`/api/service-entries/${serviceEntryId}/details`] });
      
      // Update the local items state with the saved items to ensure UI consistency
      if (data && data.items && Array.isArray(data.items)) {
        const updatedItems = data.items.map(item => ({
          id: item.id,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes || '',
        }));
        setItems(updatedItems);
      }
      
      // Don't close the modal so the user can see their changes or continue editing
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save items",
        variant: "destructive",
      });
    }
  });
  
  const handleCompleteBilling = () => {
    // Validate split payments if that payment method is selected
    if (paymentMethod === "split") {
      const splitTotal = splitPayments.cash + splitPayments.upi + splitPayments.card;
      const billTotal = totals.totalAmount - totals.discount;
      
      if (Math.abs(splitTotal - billTotal) > 0.01) { // Small tolerance for floating point errors
        toast({
          title: "Error",
          description: "Split payment total must equal the bill amount.",
          variant: "destructive",
        });
        return;
      }
    }
    
    const billingData: BillingForm = {
      serviceEntryId,
      items,
      subtotal: totals.subtotal,
      taxRate: totals.taxRate,
      taxAmount: totals.taxAmount,
      totalAmount: totals.totalAmount - totals.discount, // Apply discount
      discount: totals.discount,
      paymentMethod,
      splitPayments: paymentMethod === "split" ? splitPayments : undefined,
      isPaid: true,
      notes: '',
      markAsComplete: true,
    };
    
    billingMutation.mutate(billingData);
  };
  
  const handleSaveItems = () => {
    const billingData: BillingForm = {
      serviceEntryId,
      items,
      subtotal: totals.subtotal,
      taxRate: totals.taxRate,
      taxAmount: totals.taxAmount,
      totalAmount: totals.totalAmount - totals.discount, // Apply discount
      discount: totals.discount,
      paymentMethod,
      splitPayments: paymentMethod === "split" ? splitPayments : undefined,
      isPaid: false, // Not marking as paid
      notes: '',
      markAsComplete: false, // New flag to indicate we're just saving items
    };
    
    saveItemsMutation.mutate(billingData);
  };
  
  if (!isOpen) return null;
  
  if (isLoadingServiceEntry) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <p>Loading service details...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className="bg-white rounded-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-neutral-200 sticky top-0 bg-white">
          <h3 className="text-lg font-bold">Manage Vehicle Services</h3>
          <button 
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700"
          >
            <span className="material-icons">close</span>
          </button>
        </div>
        
        <div className="p-4">
          {serviceEntry && serviceEntry.vehicle && (
            <div className="bg-neutral-100 p-3 rounded-md mb-4">
              <div className="flex items-center mb-2">
                <span className="material-icons text-primary mr-2">
                  {serviceEntry.vehicle.type === 'bike' ? 'two_wheeler' : 'directions_car'}
                </span>
                <span className="font-medium">
                  {serviceEntry.vehicle.make || 'Unknown'} {serviceEntry.vehicle.model || ''}
                </span>
                <span className="ml-auto text-sm text-neutral-600">
                  {serviceEntry.vehicle.vehicleNumber || 'No number'}
                </span>
              </div>
              <div className="text-sm">
                {serviceEntry.vehicle.customer && serviceEntry.vehicle.customer.name ? 
                  `${serviceEntry.vehicle.customer.name} • ${serviceEntry.vehicle.customer.phone || ''}` : 
                  'Customer information not available'}
              </div>
            </div>
          )}
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">Products & Services</h4>
              <div className="relative">
                <button 
                  type="button" 
                  className="text-blue-600 font-medium text-sm hover:text-blue-800"
                  onClick={() => document.getElementById('productDropdown')?.classList.toggle('hidden')}
                >
                  + Add Item
                </button>
                
                <div 
                  id="productDropdown" 
                  className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-md shadow-lg p-3 z-10 hidden"
                >
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Item Name
                      </label>
                      <input
                        type="text"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        placeholder="e.g. Engine Oil Change"
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price (₹)
                      </label>
                      <input
                        type="number"
                        value={newItemPrice}
                        onChange={(e) => setNewItemPrice(e.target.value)}
                        placeholder="e.g. 500"
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleAddItem}
                        className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
                      >
                        Add Item
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border border-neutral-200 rounded-md overflow-hidden">
              {items.length === 0 ? (
                <div className="p-3 text-center text-gray-500">
                  No items added. Click "Add Item" to add products or services.
                </div>
              ) : (
                items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border-b border-neutral-200 last:border-b-0">
                    <div className="flex-grow">
                      <div className="font-medium">{item.productName}</div>
                      <div className="text-sm text-neutral-600">
                        {formatCurrency(item.price)} each
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <button 
                          className="p-1 text-neutral-500"
                          onClick={() => handleQuantityChange(index, item.quantity - 1)}
                          type="button"
                        >
                          <span className="material-icons text-sm">remove</span>
                        </button>
                        <span className="mx-2 w-6 text-center">{item.quantity}</span>
                        <button 
                          className="p-1 text-neutral-500"
                          onClick={() => handleQuantityChange(index, item.quantity + 1)}
                          type="button"
                        >
                          <span className="material-icons text-sm">add</span>
                        </button>
                      </div>
                      <div className="font-medium w-16 text-right">
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                      <button 
                        className="text-neutral-400"
                        onClick={() => handleRemoveItem(index)}
                        type="button"
                      >
                        <span className="material-icons text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="mb-4 bg-neutral-50 p-3 rounded-md">
            <div className="flex justify-between mb-2">
              <span className="text-neutral-600">Subtotal</span>
              <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-neutral-600">GST (18%)</span>
              <span className="font-medium">{formatCurrency(totals.taxAmount)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <div className="flex items-center">
                <span className="text-neutral-600 mr-2">Discount</span>
                <div className="relative">
                  <input 
                    type="number" 
                    value={totals.discount}
                    onChange={(e) => {
                      const discount = Math.max(0, Math.min(Number(e.target.value), totals.subtotal + totals.taxAmount));
                      setTotals({...totals, discount, totalAmount: totals.subtotal + totals.taxAmount - discount});
                    }}
                    className="w-16 p-1 text-right border border-neutral-300 rounded-md"
                  />
                  <span className="absolute right-2 top-1">₹</span>
                </div>
              </div>
              <span className="font-medium text-red-500">-{formatCurrency(totals.discount)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-neutral-200">
              <span>Total</span>
              <span>{formatCurrency(totals.totalAmount - totals.discount)}</span>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-700 mb-1">Payment Method</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="cash" 
                  checked={paymentMethod === "cash"}
                  onChange={() => setPaymentMethod("cash")}
                  className="mr-2" 
                />
                <span>Cash</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="upi" 
                  checked={paymentMethod === "upi"}
                  onChange={() => setPaymentMethod("upi")}
                  className="mr-2" 
                />
                <span>UPI</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="card" 
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                  className="mr-2" 
                />
                <span>Card</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="split" 
                  checked={paymentMethod === "split"}
                  onChange={() => setPaymentMethod("split")}
                  className="mr-2" 
                />
                <span>Split</span>
              </label>
            </div>
            
            {paymentMethod === "split" && (
              <div className="mt-3 bg-blue-50 p-3 rounded-md">
                <div className="text-sm font-medium mb-2">Split Payment</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Cash (₹)</label>
                    <input 
                      type="number"
                      value={splitPayments.cash}
                      onChange={(e) => setSplitPayments({...splitPayments, cash: Number(e.target.value) || 0})}
                      className="w-24 p-1 text-right border border-neutral-300 rounded-md"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm">UPI (₹)</label>
                    <input 
                      type="number"
                      value={splitPayments.upi}
                      onChange={(e) => setSplitPayments({...splitPayments, upi: Number(e.target.value) || 0})}
                      className="w-24 p-1 text-right border border-neutral-300 rounded-md"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Card (₹)</label>
                    <input 
                      type="number"
                      value={splitPayments.card}
                      onChange={(e) => setSplitPayments({...splitPayments, card: Number(e.target.value) || 0})}
                      className="w-24 p-1 text-right border border-neutral-300 rounded-md"
                    />
                  </div>
                  <div className="flex justify-between text-sm font-medium pt-2 border-t border-neutral-200">
                    <span>Split Total</span>
                    <span>{formatCurrency(splitPayments.cash + splitPayments.upi + splitPayments.card)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
            <button 
              className="px-4 py-2 border border-neutral-300 rounded-md text-neutral-700 hover:bg-neutral-50 flex items-center justify-center"
              onClick={onClose}
              type="button"
            >
              <span className="material-icons mr-2">close</span>
              Cancel
            </button>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 sm:flex-1">
              <button 
                className="px-4 py-2 bg-green-100 text-green-700 border border-green-300 rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-200 flex items-center justify-center flex-1 disabled:opacity-70"
                onClick={handleSaveItems}
                disabled={items.length === 0 || saveItemsMutation.isPending}
                type="button"
              >
                <span className="material-icons mr-2">save</span>
                {saveItemsMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
              <button 
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 flex items-center justify-center flex-1 disabled:opacity-70"
                onClick={() => setShowCompletionConfirm(true)}
                disabled={items.length === 0 || billingMutation.isPending}
                type="button"
              >
                <span className="material-icons mr-2">check_circle</span>
                {billingMutation.isPending ? "Processing..." : "Complete & Pay"}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Completion Confirmation Dialog */}
      <AlertDialog open={showCompletionConfirm} onOpenChange={setShowCompletionConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Service & Generate Bill?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the service as completed and generate the final bill.
              Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCompleteBilling}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}