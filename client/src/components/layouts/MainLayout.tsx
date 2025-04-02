import { ReactNode, useState } from "react";
import AppHeader from "./AppHeader";
import SideNavigation from "./SideNavigation";
import BottomNavigation from "./BottomNavigation";

interface MainLayoutProps {
  children: ReactNode;
  openNewVehicleModal: () => void;
}

export default function MainLayout({ children, openNewVehicleModal }: MainLayoutProps) {
  const [sideNavOpen, setSideNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleSideNav = () => setSideNavOpen(prev => !prev);
  const toggleSearch = () => setSearchOpen(prev => !prev);
  const closeSideNav = () => setSideNavOpen(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <AppHeader 
        toggleSideNav={toggleSideNav} 
        toggleSearch={toggleSearch}
        searchOpen={searchOpen}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      
      <SideNavigation isOpen={sideNavOpen} onClose={closeSideNav} />
      
      {/* Overlay for when side nav is open */}
      {sideNavOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={closeSideNav}
          aria-hidden="true"
        />
      )}
      
      {/* Main Content */}
      <main className="pt-16 pb-16 px-4 max-w-5xl mx-auto">
        {children}
      </main>
      
      <BottomNavigation openNewVehicleModal={openNewVehicleModal} />
    </div>
  );
}
