import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import MainLayout from "./components/layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import NewVehicleEntry from "./pages/NewVehicleEntry";
import ActiveVehicles from "./pages/ActiveVehicles";
import Customers from "./pages/Customers";
import Inventory from "./pages/Inventory";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/not-found";
import { useState } from "react";
import NewVehicleEntryModal from "./components/vehicles/NewVehicleEntryModal";

function App() {
  const [newVehicleModalOpen, setNewVehicleModalOpen] = useState(false);

  const openNewVehicleModal = () => setNewVehicleModalOpen(true);
  const closeNewVehicleModal = () => setNewVehicleModalOpen(false);

  return (
    <QueryClientProvider client={queryClient}>
      <MainLayout openNewVehicleModal={openNewVehicleModal}>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/new-entry">
            {() => <NewVehicleEntry openModal={openNewVehicleModal} />}
          </Route>
          <Route path="/vehicles" component={ActiveVehicles} />
          <Route path="/customers" component={Customers} />
          <Route path="/inventory" component={Inventory} />
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
