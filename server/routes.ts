import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertCustomerSchema, 
  insertVehicleSchema, 
  insertServiceEntrySchema, 
  insertServiceItemSchema,
  vehicleEntryFormSchema,
  serviceItemFormSchema,
  billingFormSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Helper function to handle validation errors
  function handleZodError(err: unknown, res: Response) {
    if (err instanceof ZodError) {
      const validationError = fromZodError(err);
      console.log("Validation error:", validationError);
      console.log("Detailed validation errors:", err.errors);
      return res.status(400).json({ 
        message: validationError.message,
        details: err.errors 
      });
    }
    console.error("Non-validation error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }

  // API Routes
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const date = req.query.date ? new Date(req.query.date as string) : new Date();
      const stats = await storage.getDailyStats(date);
      res.json(stats);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Customers
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      
      // Check if customer already exists with the same phone
      const existingCustomer = await storage.getCustomerByPhone(customerData.phone);
      if (existingCustomer) {
        return res.status(400).json({ message: "Customer with this phone number already exists" });
      }
      
      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  // Vehicles
  app.get("/api/vehicles", async (req, res) => {
    try {
      const vehicles = await storage.getVehicles();
      res.json(vehicles);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch vehicles" });
    }
  });

  app.get("/api/vehicles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vehicle = await storage.getVehicle(id);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch vehicle" });
    }
  });

  app.get("/api/customers/:id/vehicles", async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      const vehicles = await storage.getVehiclesByCustomerId(customerId);
      res.json(vehicles);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch customer vehicles" });
    }
  });

  app.post("/api/vehicles", async (req, res) => {
    try {
      const vehicleData = insertVehicleSchema.parse(req.body);
      
      // Check if vehicle already exists with the same number
      const existingVehicle = await storage.getVehicleByNumber(vehicleData.vehicleNumber);
      if (existingVehicle) {
        return res.status(400).json({ message: "Vehicle with this number already exists" });
      }
      
      const vehicle = await storage.createVehicle(vehicleData);
      res.status(201).json(vehicle);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  // Service Entries
  app.get("/api/service-entries", async (req, res) => {
    try {
      let entries;
      
      if (req.query.status === 'active') {
        entries = await storage.getActiveServiceEntries();
      } else if (req.query.date) {
        const date = new Date(req.query.date as string);
        entries = await storage.getServiceEntriesByDate(date);
      } else {
        entries = await storage.getServiceEntries();
      }
      
      res.json(entries);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch service entries" });
    }
  });

  app.get("/api/service-entries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const entry = await storage.getServiceEntry(id);
      if (!entry) {
        return res.status(404).json({ message: "Service entry not found" });
      }
      res.json(entry);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch service entry" });
    }
  });

  app.get("/api/service-entries/:id/details", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const entry = await storage.getServiceEntryWithDetails(id);
      if (!entry) {
        return res.status(404).json({ message: "Service entry not found" });
      }
      res.json(entry);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch service entry details" });
    }
  });

  app.get("/api/vehicles/:id/service-entries", async (req, res) => {
    try {
      const vehicleId = parseInt(req.params.id);
      const entries = await storage.getServiceEntriesByVehicleId(vehicleId);
      res.json(entries);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch vehicle service entries" });
    }
  });

  app.post("/api/service-entries/direct", async (req, res) => {
    try {
      const entryData = insertServiceEntrySchema.parse(req.body);
      const entry = await storage.createServiceEntry(entryData);
      res.status(201).json(entry);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.patch("/api/service-entries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const entryData = req.body;
      
      const updatedEntry = await storage.updateServiceEntry(id, entryData);
      if (!updatedEntry) {
        return res.status(404).json({ message: "Service entry not found" });
      }
      
      res.json(updatedEntry);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to update service entry" });
    }
  });

  // Service Items
  app.get("/api/service-entries/:id/items", async (req, res) => {
    try {
      const serviceEntryId = parseInt(req.params.id);
      
      if (req.query.withProductDetails === 'true') {
        const items = await storage.getServiceItemsWithProductDetails(serviceEntryId);
        return res.json(items);
      }
      
      const items = await storage.getServiceItems(serviceEntryId);
      res.json(items);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch service items" });
    }
  });

  app.post("/api/service-items", async (req, res) => {
    try {
      const itemData = insertServiceItemSchema.parse(req.body);
      const item = await storage.createServiceItem(itemData);
      res.status(201).json(item);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.patch("/api/service-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const itemData = req.body;
      
      const updatedItem = await storage.updateServiceItem(id, itemData);
      if (!updatedItem) {
        return res.status(404).json({ message: "Service item not found" });
      }
      
      res.json(updatedItem);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to update service item" });
    }
  });

  app.delete("/api/service-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storage.deleteServiceItem(id);
      
      if (!result) {
        return res.status(404).json({ message: "Service item not found" });
      }
      
      res.status(204).end();
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to delete service item" });
    }
  });

  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // New Vehicle Entry (combined endpoint)
  app.post("/api/vehicle-entries", async (req, res) => {
    try {
      console.log("Received vehicle entry request:", req.body);
      
      // Parse and validate the form data
      const formData = vehicleEntryFormSchema.parse(req.body);
      
      // 1. Create a new customer (or use a generic one if no phone provided)
      let customer;
      
      if (formData.customerPhone && formData.customerPhone.trim() !== "") {
        // Check if customer exists by phone
        customer = await storage.getCustomerByPhone(formData.customerPhone);
      }
      
      if (!customer) {
        // Create a new customer with provided info
        customer = await storage.createCustomer({
          name: formData.customerName,
          phone: formData.customerPhone || "not provided",
          email: formData.customerEmail || undefined,
        });
      }
      
      // 2. Create vehicle (using an auto-generated vehicle number)
      const generatedVehicleNumber = "AUTO-" + Date.now().toString().slice(-6);
      
      // Since our form no longer has vehicleNumber, we need to check if this make/model combination exists
      const existingVehicles = await storage.getVehiclesByCustomerId(customer.id);
      let vehicle = existingVehicles.find(v => 
        v.make === formData.make && 
        v.model === (formData.model || "")
      );
      
      if (!vehicle) {
        vehicle = await storage.createVehicle({
          customerId: customer.id,
          type: formData.vehicleType,
          make: formData.make,
          model: formData.model || undefined,
          vehicleNumber: generatedVehicleNumber,
        });
      }
      
      // 3. Create service entry
      const serviceEntry = await storage.createServiceEntry({
        vehicleId: vehicle.id,
        complaint: "Service for " + formData.make + " " + (formData.model || "bike"),
        status: formData.status,
        totalAmount: 0,
        isPaid: false,
      });
      
      // Return the created data with details
      const entryWithDetails = await storage.getServiceEntryWithDetails(serviceEntry.id);
      
      res.status(201).json(entryWithDetails);
    } catch (err) {
      console.error("Error creating vehicle entry:", err);
      handleZodError(err, res);
    }
  });

  // Billing (combined endpoint)
  app.post("/api/billing", async (req, res) => {
    try {
      // Parse and validate the billing form
      const billingData = billingFormSchema.parse(req.body);
      
      // 1. Update service entry with payment information
      const updatedEntry = await storage.updateServiceEntry(billingData.serviceEntryId, {
        totalAmount: billingData.totalAmount,
        isPaid: billingData.isPaid,
        paymentMethod: billingData.paymentMethod,
        status: 'completed',
        notes: billingData.notes,
        completedAt: new Date(),
      });
      
      if (!updatedEntry) {
        return res.status(404).json({ message: "Service entry not found" });
      }
      
      // 2. Sync service items with the latest data from billing form
      const existingItems = await storage.getServiceItems(billingData.serviceEntryId);
      
      // Delete items that are no longer in the billing form
      const itemIdsInForm = new Set(billingData.items.filter(item => item.id).map(item => item.id));
      
      for (const existingItem of existingItems) {
        if (existingItem.id && !itemIdsInForm.has(existingItem.id)) {
          await storage.deleteServiceItem(existingItem.id);
        }
      }
      
      // Update or create items
      for (const itemData of billingData.items) {
        if (itemData.id) {
          await storage.updateServiceItem(itemData.id, {
            quantity: itemData.quantity,
            price: itemData.price,
            notes: itemData.notes,
          });
        } else {
          await storage.createServiceItem({
            serviceEntryId: billingData.serviceEntryId,
            productId: itemData.productId,
            quantity: itemData.quantity,
            price: itemData.price,
            notes: itemData.notes,
          });
        }
      }
      
      // Return the updated service entry with details
      const updatedEntryWithDetails = await storage.getServiceEntryWithDetails(billingData.serviceEntryId);
      
      res.json(updatedEntryWithDetails);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  // Create the HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
