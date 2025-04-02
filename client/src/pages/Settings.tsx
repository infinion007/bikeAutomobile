import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

// Define a type for our settings
interface ShopSettings {
  shopName: string;
  ownerName: string;
  address: string;
  phone: string;
  gstNumber: string;
  taxRate: string;
  printReceipt: boolean;
  darkMode: boolean;
  autoBackup: boolean;
}

// Default settings
const defaultSettings: ShopSettings = {
  shopName: "City Auto Shop",
  ownerName: "John Doe",
  address: "123 Workshop Street, City",
  phone: "9876543210",
  gstNumber: "22AAAAA0000A1Z5",
  taxRate: "18",
  printReceipt: true,
  darkMode: false,
  autoBackup: true
};

export default function Settings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<ShopSettings>(defaultSettings);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('shopSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }
  }, []);

  // Update individual setting field
  const updateSetting = (key: keyof ShopSettings, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save settings to localStorage
    localStorage.setItem('shopSettings', JSON.stringify(settings));
    
    // Document title update
    document.title = `${settings.shopName} - AutoShop Manager`;
    
    // Update shop name in the header if applicable
    const shopNameElements = document.querySelectorAll('.shop-name');
    shopNameElements.forEach(element => {
      element.textContent = settings.shopName;
    });
    
    toast({
      title: "Settings Saved",
      description: "Your settings have been updated successfully",
    });
  };

  const handleResetDefaults = () => {
    setSettings(defaultSettings);
    toast({
      title: "Settings Reset",
      description: "Settings have been reset to defaults",
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
                  value={settings.shopName}
                  onChange={(e) => updateSetting('shopName', e.target.value)}
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
                  value={settings.ownerName}
                  onChange={(e) => updateSetting('ownerName', e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 mb-1" htmlFor="address">
                  Address
                </label>
                <textarea 
                  id="address"
                  value={settings.address}
                  onChange={(e) => updateSetting('address', e.target.value)}
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
                  value={settings.phone}
                  onChange={(e) => updateSetting('phone', e.target.value)}
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
                  value={settings.gstNumber}
                  onChange={(e) => updateSetting('gstNumber', e.target.value)}
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
                  value={settings.taxRate}
                  onChange={(e) => updateSetting('taxRate', e.target.value)}
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
                    checked={settings.printReceipt}
                    onChange={(e) => updateSetting('printReceipt', e.target.checked)}
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
                    checked={settings.darkMode}
                    onChange={(e) => updateSetting('darkMode', e.target.checked)}
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
                    checked={settings.autoBackup}
                    onChange={(e) => updateSetting('autoBackup', e.target.checked)}
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
              onClick={handleResetDefaults}
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
