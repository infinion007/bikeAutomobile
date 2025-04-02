import { pgTable, text, serial, integer, boolean, timestamp, json, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Customers table
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
});

export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;

// Vehicle Types enum
export const vehicleTypeEnum = z.enum(["bike", "car", "other"]);
export type VehicleType = z.infer<typeof vehicleTypeEnum>;

// Vehicles table
export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  type: text("type").notNull(), // 'bike', 'car', 'other'
  make: text("make").notNull(),
  model: text("model"),
  vehicleNumber: text("vehicle_number").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
});

export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehicles.$inferSelect;

// Service Status enum
export const serviceStatusEnum = z.enum(["waiting", "in_progress", "completed", "delivered"]);
export type ServiceStatus = z.infer<typeof serviceStatusEnum>;

// Service entries table
export const serviceEntries = pgTable("service_entries", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").notNull(),
  entryDate: timestamp("entry_date").defaultNow().notNull(),
  complaint: text("complaint"),
  status: text("status").notNull().default("waiting"), // waiting, in_progress, completed, delivered
  totalAmount: real("total_amount").default(0),
  isPaid: boolean("is_paid").default(false),
  paymentMethod: text("payment_method"), // cash, card, upi
  notes: text("notes"),
  completedAt: timestamp("completed_at"),
});

export const insertServiceEntrySchema = createInsertSchema(serviceEntries).omit({
  id: true,
  entryDate: true,
  completedAt: true,
});

export type InsertServiceEntry = z.infer<typeof insertServiceEntrySchema>;
export type ServiceEntry = typeof serviceEntries.$inferSelect;

// Products/Services table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // 'product', 'service'
  price: real("price").notNull(),
  inStock: integer("in_stock").default(0),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Service items (products/services used in a service entry)
export const serviceItems = pgTable("service_items", {
  id: serial("id").primaryKey(),
  serviceEntryId: integer("service_entry_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  price: real("price").notNull(), // Price at the time of service
  notes: text("notes"),
});

export const insertServiceItemSchema = createInsertSchema(serviceItems).omit({
  id: true,
});

export type InsertServiceItem = z.infer<typeof insertServiceItemSchema>;
export type ServiceItem = typeof serviceItems.$inferSelect;

// Combined types for frontend use
export type VehicleWithCustomer = Vehicle & {
  customer: Customer;
};

export type ServiceEntryWithDetails = ServiceEntry & {
  vehicle: VehicleWithCustomer;
  items: (ServiceItem & { product: Product })[];
};

// Available bike makes
export const bikeMakes = [
  "Hero",
  "Honda",
  "Bajaj",
  "TVS",
  "Royal Enfield",
  "Yamaha",
  "Suzuki",
  "KTM",
  "Harley-Davidson",
  "Triumph",
  "Ducati",
  "Other"
] as const;

export const bikeMakeEnum = z.enum(bikeMakes);
export type BikeMake = z.infer<typeof bikeMakeEnum>;

// Form schemas with validation
export const vehicleEntryFormSchema = z.object({
  vehicleType: z.literal("bike"),
  make: bikeMakeEnum,
  model: z.string().optional(),
  customerName: z.string().min(1, "Customer name is required"),
  customerPhone: z.string().optional().or(z.literal("")),
  customerEmail: z.string().email().optional().or(z.literal("")),
  status: serviceStatusEnum.default("waiting"),
});

export type VehicleEntryForm = z.infer<typeof vehicleEntryFormSchema>;

export const serviceItemFormSchema = z.object({
  id: z.number().optional(),
  productId: z.number(),
  productName: z.string(),
  quantity: z.number().min(1),
  price: z.number().min(0),
  notes: z.string().optional(),
});

export type ServiceItemForm = z.infer<typeof serviceItemFormSchema>;

export const billingFormSchema = z.object({
  serviceEntryId: z.number(),
  items: z.array(serviceItemFormSchema),
  subtotal: z.number().min(0),
  taxRate: z.number().min(0),
  taxAmount: z.number().min(0),
  totalAmount: z.number().min(0),
  paymentMethod: z.enum(["cash", "card", "upi"]),
  isPaid: z.boolean().default(false),
  notes: z.string().optional(),
  markAsComplete: z.boolean().optional().default(true),
});

export type BillingForm = z.infer<typeof billingFormSchema>;
