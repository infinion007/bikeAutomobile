import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  
  // Fetch products
  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/products"],
  });
  
  // Filter products by search term and type
  const filteredProducts = products?.filter((product: any) => {
    const matchesSearch = 
      !searchTerm ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = 
      typeFilter === "all" || 
      product.type === typeFilter;
    
    return matchesSearch && matchesType;
  });
  
  return (
    <section className="py-4">
      <h2 className="text-xl font-bold mb-4">Inventory</h2>
      
      <div className="mb-4 flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <span className="material-icons absolute left-2 top-2 text-neutral-600">search</span>
        </div>
        
        <div className="flex space-x-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Types</option>
            <option value="product">Products</option>
            <option value="service">Services</option>
          </select>
          
          <button className="p-2 text-white bg-primary rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 flex items-center">
            <span className="material-icons mr-1">add</span>
            Add New
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg overflow-hidden shadow-md">
        {isLoading ? (
          <div className="p-4 text-center">Loading inventory...</div>
        ) : filteredProducts?.length ? (
          <div className="divide-y divide-neutral-200">
            {filteredProducts.map((product: any) => (
              <div key={product.id} className="p-4 hover:bg-neutral-50">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <span className="material-icons text-primary mr-2">
                        {product.type === 'product' ? 'inventory_2' : 'build'}
                      </span>
                      <span className="font-medium">{product.name}</span>
                      <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs capitalize">
                        {product.type}
                      </span>
                    </div>
                    <div className="text-sm text-neutral-600 mt-1">
                      {product.description || "No description"}
                    </div>
                    {product.type === 'product' && (
                      <div className="text-sm mt-1">
                        Stock: <span className={product.inStock > 0 ? "text-green-600" : "text-red-600"}>
                          {product.inStock || 0} units
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatCurrency(product.price)}</div>
                    <div className="flex mt-2 space-x-1">
                      <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                        <span className="material-icons text-sm">edit</span>
                      </button>
                      <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                        <span className="material-icons text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-neutral-500">
            No products found matching your criteria.
          </div>
        )}
      </div>
    </section>
  );
}
