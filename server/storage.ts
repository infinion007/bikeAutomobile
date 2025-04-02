import { 
  customers, type Customer, type InsertCustomer,
  vehicles, type Vehicle, type InsertVehicle,
  serviceEntries, type ServiceEntry, type InsertServiceEntry,
  products, type Product, type InsertProduct,
  serviceItems, type ServiceItem, type InsertServiceItem,
  type VehicleWithCustomer,
  type ServiceEntryWithDetails
} from "@shared/schema";

// Storage interface with CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<any | undefined>;
  getUserByUsername(username: string): Promise<any | undefined>;
  createUser(user: any): Promise<any>;

  // Customer operations
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomerByPhone(phone: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<Customer>): Promise<Customer | undefined>;

  // Vehicle operations
  getVehicles(): Promise<Vehicle[]>;
  getVehicle(id: number): Promise<Vehicle | undefined>;
  getVehicleByNumber(vehicleNumber: string): Promise<Vehicle | undefined>;
  getVehiclesByCustomerId(customerId: number): Promise<Vehicle[]>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: number, vehicle: Partial<Vehicle>): Promise<Vehicle | undefined>;
  getVehicleWithCustomer(id: number): Promise<VehicleWithCustomer | undefined>;
  
  // Service entry operations
  getServiceEntries(): Promise<ServiceEntry[]>;
  getServiceEntry(id: number): Promise<ServiceEntry | undefined>;
  getServiceEntriesByVehicleId(vehicleId: number): Promise<ServiceEntry[]>;
  getServiceEntriesByDate(date: Date): Promise<ServiceEntry[]>;
  getActiveServiceEntries(): Promise<ServiceEntry[]>;
  createServiceEntry(entry: InsertServiceEntry): Promise<ServiceEntry>;
  updateServiceEntry(id: number, entry: Partial<ServiceEntry>): Promise<ServiceEntry | undefined>;
  getServiceEntryWithDetails(id: number): Promise<ServiceEntryWithDetails | undefined>;

  // Product operations
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<Product>): Promise<Product | undefined>;

  // Service item operations
  getServiceItems(serviceEntryId: number): Promise<ServiceItem[]>;
  getServiceItem(id: number): Promise<ServiceItem | undefined>;
  createServiceItem(item: InsertServiceItem): Promise<ServiceItem>;
  updateServiceItem(id: number, item: Partial<ServiceItem>): Promise<ServiceItem | undefined>;
  deleteServiceItem(id: number): Promise<boolean>;
  getServiceItemsWithProductDetails(serviceEntryId: number): Promise<(ServiceItem & { product: Product })[]>;
  
  // Dashboard and reporting operations
  getDailyStats(date: Date): Promise<{
    vehicleCount: number;
    activeJobs: number;
    totalRevenue: number;
    pendingPayments: number;
  }>;
}

// Memory storage implementation
export class MemStorage implements IStorage {
  private customers: Map<number, Customer>;
  private vehicles: Map<number, Vehicle>;
  private serviceEntries: Map<number, ServiceEntry>;
  private products: Map<number, Product>;
  private serviceItems: Map<number, ServiceItem>;
  private users: Map<number, any>;
  
  private customerIdCounter: number;
  private vehicleIdCounter: number;
  private serviceEntryIdCounter: number;
  private productIdCounter: number;
  private serviceItemIdCounter: number;
  private userIdCounter: number;

  constructor() {
    this.customers = new Map();
    this.vehicles = new Map();
    this.serviceEntries = new Map();
    this.products = new Map();
    this.serviceItems = new Map();
    this.users = new Map();
    
    this.customerIdCounter = 1;
    this.vehicleIdCounter = 1;
    this.serviceEntryIdCounter = 1;
    this.productIdCounter = 1;
    this.serviceItemIdCounter = 1;
    this.userIdCounter = 1;
    
    // Add some default products
    this.initializeProducts();
  }

  private initializeProducts() {
    const defaultProducts: InsertProduct[] = [
      { name: "Oil Change Service", description: "Engine oil + labor", type: "service", price: 500 },
      { name: "Air Filter", description: "New air filter element", type: "product", price: 250, inStock: 10 },
      { name: "Brake Adjustment", description: "Labor only", type: "service", price: 100 },
      { name: "Engine Tuning", description: "Basic engine tune-up service", type: "service", price: 600 },
      { name: "Wheel Alignment", description: "Full wheel alignment", type: "service", price: 800 },
      { name: "Brake Pads (Front)", description: "Set of front brake pads", type: "product", price: 450, inStock: 5 },
      { name: "Brake Pads (Rear)", description: "Set of rear brake pads", type: "product", price: 400, inStock: 5 },
      { name: "Clutch Plates", description: "Clutch plate set", type: "product", price: 1200, inStock: 3 },
      { name: "Battery", description: "12V battery", type: "product", price: 1500, inStock: 4 },
      { name: "Spark Plugs", description: "Set of spark plugs", type: "product", price: 350, inStock: 20 },
    ];

    defaultProducts.forEach(product => this.createProduct(product));
  }

  // User methods
  async getUser(id: number): Promise<any | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<any | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(user: any): Promise<any> {
    const id = this.userIdCounter++;
    const newUser = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  // Customer methods
  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async getCustomerByPhone(phone: string): Promise<Customer | undefined> {
    return Array.from(this.customers.values()).find(
      (customer) => customer.phone === phone
    );
  }

  async createCustomer(customerData: InsertCustomer): Promise<Customer> {
    const id = this.customerIdCounter++;
    const customer: Customer = {
      ...customerData,
      id,
      createdAt: new Date()
    };
    this.customers.set(id, customer);
    return customer;
  }

  async updateCustomer(id: number, customerData: Partial<Customer>): Promise<Customer | undefined> {
    const customer = this.customers.get(id);
    if (!customer) return undefined;
    
    const updatedCustomer = { ...customer, ...customerData };
    this.customers.set(id, updatedCustomer);
    return updatedCustomer;
  }

  // Vehicle methods
  async getVehicles(): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values());
  }

  async getVehicle(id: number): Promise<Vehicle | undefined> {
    return this.vehicles.get(id);
  }

  async getVehicleByNumber(vehicleNumber: string): Promise<Vehicle | undefined> {
    return Array.from(this.vehicles.values()).find(
      (vehicle) => vehicle.vehicleNumber === vehicleNumber
    );
  }

  async getVehiclesByCustomerId(customerId: number): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values()).filter(
      (vehicle) => vehicle.customerId === customerId
    );
  }

  async createVehicle(vehicleData: InsertVehicle): Promise<Vehicle> {
    const id = this.vehicleIdCounter++;
    const vehicle: Vehicle = {
      ...vehicleData,
      id,
      createdAt: new Date()
    };
    this.vehicles.set(id, vehicle);
    return vehicle;
  }

  async updateVehicle(id: number, vehicleData: Partial<Vehicle>): Promise<Vehicle | undefined> {
    const vehicle = this.vehicles.get(id);
    if (!vehicle) return undefined;
    
    const updatedVehicle = { ...vehicle, ...vehicleData };
    this.vehicles.set(id, updatedVehicle);
    return updatedVehicle;
  }

  async getVehicleWithCustomer(id: number): Promise<VehicleWithCustomer | undefined> {
    const vehicle = this.vehicles.get(id);
    if (!vehicle) return undefined;
    
    const customer = this.customers.get(vehicle.customerId);
    if (!customer) return undefined;
    
    return { ...vehicle, customer };
  }

  // Service entry methods
  async getServiceEntries(): Promise<ServiceEntry[]> {
    return Array.from(this.serviceEntries.values());
  }

  async getServiceEntry(id: number): Promise<ServiceEntry | undefined> {
    return this.serviceEntries.get(id);
  }

  async getServiceEntriesByVehicleId(vehicleId: number): Promise<ServiceEntry[]> {
    return Array.from(this.serviceEntries.values()).filter(
      (entry) => entry.vehicleId === vehicleId
    );
  }

  async getServiceEntriesByDate(date: Date): Promise<ServiceEntry[]> {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    return Array.from(this.serviceEntries.values()).filter(
      (entry) => {
        const entryDate = new Date(entry.entryDate);
        return entryDate >= startDate && entryDate <= endDate;
      }
    );
  }

  async getActiveServiceEntries(): Promise<ServiceEntry[]> {
    return Array.from(this.serviceEntries.values()).filter(
      (entry) => entry.status !== 'delivered'
    );
  }

  async createServiceEntry(entryData: InsertServiceEntry): Promise<ServiceEntry> {
    const id = this.serviceEntryIdCounter++;
    const entry: ServiceEntry = {
      ...entryData,
      id,
      entryDate: new Date(),
      totalAmount: entryData.totalAmount || 0
    };
    this.serviceEntries.set(id, entry);
    return entry;
  }

  async updateServiceEntry(id: number, entryData: Partial<ServiceEntry>): Promise<ServiceEntry | undefined> {
    const entry = this.serviceEntries.get(id);
    if (!entry) return undefined;
    
    const updatedEntry = { ...entry, ...entryData };
    
    // If status is changed to completed, set the completedAt date
    if (entryData.status === 'completed' && entry.status !== 'completed') {
      updatedEntry.completedAt = new Date();
    }
    
    this.serviceEntries.set(id, updatedEntry);
    return updatedEntry;
  }

  async getServiceEntryWithDetails(id: number): Promise<ServiceEntryWithDetails | undefined> {
    const entry = this.serviceEntries.get(id);
    if (!entry) return undefined;
    
    const vehicle = await this.getVehicleWithCustomer(entry.vehicleId);
    if (!vehicle) return undefined;
    
    const items = await this.getServiceItemsWithProductDetails(id);
    
    return {
      ...entry,
      vehicle,
      items
    };
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    const id = this.productIdCounter++;
    const product: Product = {
      ...productData,
      id
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, productData: Partial<Product>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...productData };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  // Service item methods
  async getServiceItems(serviceEntryId: number): Promise<ServiceItem[]> {
    return Array.from(this.serviceItems.values()).filter(
      (item) => item.serviceEntryId === serviceEntryId
    );
  }

  async getServiceItem(id: number): Promise<ServiceItem | undefined> {
    return this.serviceItems.get(id);
  }

  async createServiceItem(itemData: InsertServiceItem): Promise<ServiceItem> {
    const id = this.serviceItemIdCounter++;
    const item: ServiceItem = {
      ...itemData,
      id
    };
    this.serviceItems.set(id, item);
    
    // Update the total amount of the service entry
    await this.updateServiceEntryTotal(itemData.serviceEntryId);
    
    return item;
  }

  async updateServiceItem(id: number, itemData: Partial<ServiceItem>): Promise<ServiceItem | undefined> {
    const item = this.serviceItems.get(id);
    if (!item) return undefined;
    
    const updatedItem = { ...item, ...itemData };
    this.serviceItems.set(id, updatedItem);
    
    // Update the total amount of the service entry
    await this.updateServiceEntryTotal(item.serviceEntryId);
    
    return updatedItem;
  }

  async deleteServiceItem(id: number): Promise<boolean> {
    const item = this.serviceItems.get(id);
    if (!item) return false;
    
    const serviceEntryId = item.serviceEntryId;
    const result = this.serviceItems.delete(id);
    
    // Update the total amount of the service entry
    await this.updateServiceEntryTotal(serviceEntryId);
    
    return result;
  }

  async getServiceItemsWithProductDetails(serviceEntryId: number): Promise<(ServiceItem & { product: Product })[]> {
    const items = await this.getServiceItems(serviceEntryId);
    const result: (ServiceItem & { product: Product })[] = [];
    
    for (const item of items) {
      const product = this.products.get(item.productId);
      if (product) {
        result.push({
          ...item,
          product
        });
      }
    }
    
    return result;
  }

  // Helper method to update the total amount of a service entry
  private async updateServiceEntryTotal(serviceEntryId: number): Promise<void> {
    const entry = this.serviceEntries.get(serviceEntryId);
    if (!entry) return;
    
    const items = await this.getServiceItems(serviceEntryId);
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    entry.totalAmount = totalAmount;
    this.serviceEntries.set(serviceEntryId, entry);
  }

  // Dashboard and reporting operations
  async getDailyStats(date: Date): Promise<{
    vehicleCount: number;
    activeJobs: number;
    totalRevenue: number;
    pendingPayments: number;
  }> {
    const entries = await this.getServiceEntriesByDate(date);
    
    const vehicleCount = entries.length;
    
    const activeJobs = entries.filter(
      (entry) => entry.status === 'waiting' || entry.status === 'in_progress'
    ).length;
    
    const totalRevenue = entries
      .filter((entry) => entry.isPaid)
      .reduce((sum, entry) => sum + entry.totalAmount, 0);
    
    const pendingPayments = entries
      .filter((entry) => !entry.isPaid && entry.status === 'completed')
      .reduce((sum, entry) => sum + entry.totalAmount, 0);
    
    return {
      vehicleCount,
      activeJobs,
      totalRevenue,
      pendingPayments
    };
  }
}

export const storage = new MemStorage();
