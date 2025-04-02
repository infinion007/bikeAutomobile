import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { formatCurrency, calculateTotals } from "@/lib/utils";
import { Product, ServiceItemForm, BillingForm } from "@shared/schema";

interface BillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceEntryId: number;
}

export default function BillingModal({ isOpen, onClose, serviceEntryId }: BillingModalProps) {
  const { toast } = useToast();
  
  const [items, setItems] = useState<ServiceItemForm[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "upi" | "card">("cash");
  const [totals, setTotals] = useState({ subtotal: 0, taxRate: 0.18, taxAmount: 0, totalAmount: 0 });
  
  // Fetch service entry details
  const { data: serviceEntry, isLoading: isLoadingServiceEntry } = useQuery({
    queryKey: [`/api/service-entries/${serviceEntryId}/details`],
    enabled: isOpen && !!serviceEntryId,
  });
  
  // Fetch products for adding to bill
  const { data: products } = useQuery({
    queryKey: ['/api/products'],
    enabled: isOpen,
  });
  
  // Initialize items from service entry data
  useEffect(() => {
    if (serviceEntry?.items?.length) {
      const initialItems = serviceEntry.items.map(item => ({
        id: item.id,
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.price,
        notes: item.notes || '',
      }));
      setItems(initialItems);
    }
  }, [serviceEntry]);
  
  // Update totals when items change
  useEffect(() => {
    setTotals(calculateTotals(items));
  }, [items]);
  
  // Handle adding a product to the bill
  const handleAddProduct = (product: Product) => {
    // Check if product already exists
    const existingItemIndex = items.findIndex(item => item.productId === product.id);
    
    if (existingItemIndex >= 0) {
      // Increment quantity if already exists
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += 1;
      setItems(updatedItems);
    } else {
      // Add new item
      setItems([
        ...items,
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          price: product.price,
          notes: '',
        }
      ]);
    }
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
  const saveItemsMutation = useMutation({
    mutationFn: async (data: BillingForm) => {
      const response = await apiRequest("POST", "/api/billing", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Items saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/service-entries"] });
      onClose();
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
    const billingData: BillingForm = {
      serviceEntryId,
      items,
      subtotal: totals.subtotal,
      taxRate: totals.taxRate,
      taxAmount: totals.taxAmount,
      totalAmount: totals.totalAmount,
      paymentMethod,
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
      totalAmount: totals.totalAmount,
      paymentMethod,
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
          {serviceEntry && (
            <div className="bg-neutral-100 p-3 rounded-md mb-4">
              <div className="flex items-center mb-2">
                <span className="material-icons text-primary mr-2">
                  {serviceEntry.vehicle.type === 'bike' ? 'two_wheeler' : 'directions_car'}
                </span>
                <span className="font-medium">
                  {serviceEntry.vehicle.make} {serviceEntry.vehicle.model}
                </span>
                <span className="ml-auto text-sm text-neutral-600">
                  {serviceEntry.vehicle.vehicleNumber}
                </span>
              </div>
              <div className="text-sm">
                {serviceEntry.vehicle.customer.name} • {serviceEntry.vehicle.customer.phone}
              </div>
            </div>
          )}
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">Products & Services</h4>
              <div className="relative">
                <button 
                  type="button" 
                  className="text-primary text-sm"
                  onClick={() => document.getElementById('productDropdown')?.classList.toggle('hidden')}
                >
                  + Add Item
                </button>
                
                <div 
                  id="productDropdown" 
                  className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg p-1 z-10 hidden"
                >
                  <div className="max-h-64 overflow-y-auto">
                    {products?.map((product: Product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => {
                          handleAddProduct(product);
                          document.getElementById('productDropdown')?.classList.add('hidden');
                        }}
                        className="w-full text-left p-2 hover:bg-gray-100 rounded-md flex justify-between items-center"
                      >
                        <span>{product.name}</span>
                        <span className="text-sm text-gray-600">{formatCurrency(product.price)}</span>
                      </button>
                    ))}
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
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-neutral-200">
              <span>Total</span>
              <span>{formatCurrency(totals.totalAmount)}</span>
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
            </div>
          </div>
          
          <div className="flex justify-between space-x-3 mt-6">
            <button 
              className="px-4 py-2 border border-neutral-300 rounded-md text-neutral-700 hover:bg-neutral-50 flex items-center justify-center flex-1"
              onClick={onClose}
              type="button"
            >
              <span className="material-icons mr-2">close</span>
              Cancel
            </button>
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
              onClick={handleCompleteBilling}
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
  );
}
