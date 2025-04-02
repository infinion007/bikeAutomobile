import { useEffect } from "react";
import { useLocation } from "wouter";
import NewVehicleEntryModal from "@/components/vehicles/NewVehicleEntryModal";

interface NewVehicleEntryProps {
  openModal: () => void;
}

export default function NewVehicleEntry({ openModal }: NewVehicleEntryProps) {
  const [, navigate] = useLocation();
  
  // Open the modal when this component mounts
  useEffect(() => {
    openModal();
    
    // Listen for modal close event to navigate back
    const handleModalClose = () => {
      navigate("/");
    };
    
    window.addEventListener("vehicleModalClosed", handleModalClose);
    
    return () => {
      window.removeEventListener("vehicleModalClosed", handleModalClose);
    };
  }, [openModal, navigate]);
  
  // This component doesn't render anything visible
  // It just manages the modal and navigation
  return null;
}