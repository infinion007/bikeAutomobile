import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch customers
  const { data: customers, isLoading } = useQuery({
    queryKey: ["/api/customers"],
  });
  
  // Filter customers by search term
  const filteredCustomers = customers?.filter((customer: any) => 
    !searchTerm ||
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <section className="py-4">
      <h2 className="text-xl font-bold mb-4">Customers</h2>
      
      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Search customers by name, phone or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 pl-10 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <span className="material-icons absolute left-2 top-2 text-neutral-600">search</span>
      </div>
      
      <div className="bg-white rounded-lg overflow-hidden shadow-md">
        {isLoading ? (
          <div className="p-4 text-center">Loading customers...</div>
        ) : filteredCustomers?.length ? (
          filteredCustomers.map((customer: any) => (
            <div key={customer.id} className="border-b border-neutral-200 last:border-b-0 p-4 hover:bg-neutral-50">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    <span className="material-icons text-primary mr-2">person</span>
                    <span className="font-medium">{customer.name}</span>
                  </div>
                  <div className="text-sm text-neutral-600 mt-1">
                    <span className="material-icons text-xs mr-1">phone</span>
                    {customer.phone}
                    {customer.email && (
                      <>
                        <span className="mx-2">•</span>
                        <span className="material-icons text-xs mr-1">email</span>
                        {customer.email}
                      </>
                    )}
                  </div>
                </div>
                <button className="text-primary hover:text-blue-700">
                  <span className="material-icons">more_vert</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-neutral-500">
            No customers found matching your criteria.
          </div>
        )}
      </div>
    </section>
  );
}
