import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import MainLayout from "./components/layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import NewVehicleEntry from "./pages/NewVehicleEntry";
import ActiveVehicles from "./pages/ActiveVehicles";
import PreOrders from "./pages/PreOrders";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/not-found";
import { useState, useEffect } from "react";
import NewVehicleEntryModal from "./components/vehicles/NewVehicleEntryModal";

function App() {
  const [newVehicleModalOpen, setNewVehicleModalOpen] = useState(false);

  const openNewVehicleModal = () => setNewVehicleModalOpen(true);
  const closeNewVehicleModal = () => setNewVehicleModalOpen(false);
  
  // Listen for the custom event to open the vehicle modal
  useEffect(() => {
    const handleOpenVehicleModal = () => {
      setNewVehicleModalOpen(true);
    };
    
    window.addEventListener('openVehicleModal', handleOpenVehicleModal);
    
    return () => {
      window.removeEventListener('openVehicleModal', handleOpenVehicleModal);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <MainLayout openNewVehicleModal={openNewVehicleModal}>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/new-entry">
            {() => <NewVehicleEntry openModal={openNewVehicleModal} />}
          </Route>
          <Route path="/vehicles" component={ActiveVehicles} />
          <Route path="/pre-orders" component={PreOrders} />
          <Route path="/reports" component={Reports} />
          <Route path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>
      </MainLayout>
      <NewVehicleEntryModal
        isOpen={newVehicleModalOpen}
        onClose={closeNewVehicleModal}
      />
    </QueryClientProvider>
  );
}

export default App;
