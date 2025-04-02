import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  const [shopName, setShopName] = useState("City Auto Shop");
  const [ownerName, setOwnerName] = useState("John Doe");
  const [address, setAddress] = useState("123 Workshop Street, City");
  const [phone, setPhone] = useState("9876543210");
  const [gstNumber, setGstNumber] = useState("22AAAAA0000A1Z5");
  const [taxRate, setTaxRate] = useState("18");
  const [printReceipt, setPrintReceipt] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);
  
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real application, this would save the settings to the database
    toast({
      title: "Settings Saved",
      description: "Your settings have been updated successfully",
    });
  };
  
  return (
    <section className="py-4">
      <h2 className="text-xl font-bold mb-6">Settings</h2>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-blue-50 border-b border-neutral-200">
          <div className="flex items-center">
            <span className="material-icons text-primary mr-2">settings</span>
            <h3 className="font-bold">Shop Settings</h3>
          </div>
        </div>
        
        <form onSubmit={handleSaveSettings} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shop Information */}
            <div>
              <h4 className="font-medium text-lg mb-4">Shop Information</h4>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 mb-1" htmlFor="shopName">
                  Shop Name
                </label>
                <input 
                  id="shopName"
                  type="text" 
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 mb-1" htmlFor="ownerName">
                  Owner Name
                </label>
                <input 
                  id="ownerName"
                  type="text" 
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 mb-1" htmlFor="address">
                  Address
                </label>
                <textarea 
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent h-20" 
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 mb-1" htmlFor="phone">
                  Phone Number
                </label>
                <input 
                  id="phone"
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                />
              </div>
            </div>
            
            {/* Billing & Preferences */}
            <div>
              <h4 className="font-medium text-lg mb-4">Billing & Preferences</h4>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 mb-1" htmlFor="gstNumber">
                  GST Number
                </label>
                <input 
                  id="gstNumber"
                  type="text" 
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 mb-1" htmlFor="taxRate">
                  Default Tax Rate (%)
                </label>
                <input 
                  id="taxRate"
                  type="number" 
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  min="0"
                  max="100"
                  className="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                />
              </div>
              
              <div className="mb-4">
                <div className="flex items-center">
                  <input 
                    id="printReceipt" 
                    type="checkbox"
                    checked={printReceipt}
                    onChange={(e) => setPrintReceipt(e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded"
                  />
                  <label htmlFor="printReceipt" className="ml-2 block text-sm text-neutral-700">
                    Automatically print receipt after billing
                  </label>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center">
                  <input 
                    id="darkMode" 
                    type="checkbox"
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded"
                  />
                  <label htmlFor="darkMode" className="ml-2 block text-sm text-neutral-700">
                    Dark mode (Coming soon)
                  </label>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center">
                  <input 
                    id="autoBackup" 
                    type="checkbox"
                    checked={autoBackup}
                    onChange={(e) => setAutoBackup(e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded"
                  />
                  <label htmlFor="autoBackup" className="ml-2 block text-sm text-neutral-700">
                    Enable automatic data backup
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-neutral-200 pt-6 mt-6 flex justify-end">
            <button
              type="button"
              className="px-4 py-2 border border-neutral-300 rounded-md text-neutral-700 hover:bg-neutral-50 mr-3"
            >
              Reset to Defaults
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
        <div className="p-4 bg-blue-50 border-b border-neutral-200">
          <div className="flex items-center">
            <span className="material-icons text-primary mr-2">info</span>
            <h3 className="font-bold">About AutoShop Manager</h3>
          </div>
        </div>
        
        <div className="p-6">
          <p className="text-neutral-700 mb-2">
            <strong>Version:</strong> 1.0.0
          </p>
          <p className="text-neutral-700 mb-4">
            <strong>Released:</strong> October 2023
          </p>
          
          <p className="text-neutral-600 mb-2">
            AutoShop Manager is designed to help automobile workshop owners manage their daily operations efficiently.
          </p>
          
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <button
              type="button"
              className="text-primary hover:text-blue-700 text-sm flex items-center"
              onClick={() => window.open('https://github.com', '_blank')}
            >
              <span className="material-icons text-sm mr-1">help_outline</span>
              Help & Documentation
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
