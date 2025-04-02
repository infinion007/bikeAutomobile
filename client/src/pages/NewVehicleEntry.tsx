import { useEffect } from "react";
import { useLocation } from "wouter";

interface NewVehicleEntryProps {
  openModal: () => void;
}

export default function NewVehicleEntry({ openModal }: NewVehicleEntryProps) {
  const [, navigate] = useLocation();

  // Open modal automatically when this route is visited
  useEffect(() => {
    openModal();
    
    // Add event listener to handle modal close
    const handleModalClose = () => {
      navigate("/");
    };
    
    // Save the original onClose function
    const originalOnClose = window.onclose;
    
    // Setup listener for modal close events from NewVehicleEntryModal
    window.addEventListener("vehicleModalClosed", handleModalClose);
    
    // Cleanup listeners on unmount
    return () => {
      window.removeEventListener("vehicleModalClosed", handleModalClose);
      window.onclose = originalOnClose;
    };
  }, [openModal, navigate]);

  return (
    <div className="py-4">
      <h2 className="text-xl font-bold mb-6">New Vehicle Entry</h2>
      
      <div className="bg-white rounded-lg p-6 shadow-md text-center">
        <div className="flex flex-col items-center mb-4">
          <span className="material-icons text-5xl text-primary mb-2">add_circle</span>
          <h3 className="text-lg font-medium">Add a New Vehicle</h3>
          <p className="text-neutral-600 mb-4">
            Click the button below to add a new vehicle entry
          </p>
          <button
            onClick={openModal}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            Open Entry Form
          </button>
        </div>
        <div className="mt-6 pt-6 border-t border-neutral-200">
          <button
            onClick={() => navigate("/")}
            className="text-primary hover:text-blue-700 flex items-center mx-auto"
          >
            <span className="material-icons mr-1">arrow_back</span>
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
