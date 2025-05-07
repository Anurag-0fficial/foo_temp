const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product'); // Adjust path if your model is elsewhere

// Load environment variables (especially MONGODB_URI)
dotenv.config();

// --- Dummy Product Data ---
// Using data similar to the previous JSON, ensure 'model' is defined for image naming
const dummyProducts = [
    // Category: UPS
    {
      name: "PowerPro 1000VA UPS",
      type: "UPS",
      brand: "PowerPro",
      model: "PP-1000VA", 
      description: "A reliable 1000VA UPS system with pure sine wave output.",
      specifications: {
        powerRating: "1000VA/600W",
        voltage: "230V",
        batteryCapacity: "12V/7Ah",
        dimensions: "300x150x200mm",
        weight: "8.5kg"
      },
      price: 8999,
      stock: 15,
      features: ["Pure sine wave output", "Automatic voltage regulation", "Surge protection"]
    },
    {
      name: "PowerLine 650VA UPS",
      type: "UPS",
      brand: "PowerLine",
      model: "PL-650VA", // Needs PL-650VA-1.jpg etc.
      description: "Compact 650VA UPS for basic home computer backup.",
      specifications: {
        powerRating: "650VA/360W",
        voltage: "230V",
        batteryCapacity: "12V/4.5Ah",
        dimensions: "280x100x140mm",
        weight: "4.2kg"
      },
      price: 3499,
      stock: 25,
      features: ["Modified sine wave output", "LED indicators", "Compact design"]
    },

    // Category: Inverter
    {
      name: "EcoPower 2000VA Inverter",
      type: "Inverter",
      brand: "EcoPower",
      model: "EP-2000VA", 
      description: "High-efficiency 2000VA sine wave inverter.",
      specifications: {
        powerRating: "2000VA/1600W",
        voltage: "230V",
        batteryCapacity: "12V/100Ah (External)",
        dimensions: "400x200x250mm",
        weight: "12kg"
      },
      price: 15999,
      stock: 8,
      features: ["Sine wave output", "Advanced battery management", "Overload protection"]
    },
     {
      name: "DuraVolt 1000VA Square Wave Inverter",
      type: "Inverter",
      brand: "DuraVolt",
      model: "DV-1000SQ", // Needs DV-1000SQ-1.jpg etc.
      description: "Economical 1000VA square wave inverter for basic loads.",
      specifications: {
        powerRating: "1000VA/800W",
        voltage: "230V",
        batteryCapacity: "12V/80Ah (External)",
        dimensions: "350x180x220mm",
        weight: "9.5kg"
      },
      price: 6999,
      stock: 12,
      features: ["Square wave output", "Low battery protection", "Cost-effective"]
    },

    // Category: Hybrid Inverter
    {
      name: "SolarMax 5KVA Hybrid Inverter",
      type: "Hybrid Inverter",
      brand: "SolarMax",
      model: "SM-5KVA", 
      description: "Advanced 5KVA hybrid inverter with solar charging.",
      specifications: {
        powerRating: "5000VA/4000W",
        voltage: "230V",
        batteryCapacity: "48V/200Ah (External)",
        dimensions: "500x300x300mm",
        weight: "25kg"
      },
      price: 45999,
      stock: 5,
      features: ["Solar charging capability", "Grid-tie functionality", "MPPT solar charger"]
    },
    {
      name: "SunFlow 3KVA Hybrid Inverter",
      type: "Hybrid Inverter",
      brand: "SunFlow",
      model: "SF-3KVA", // Needs SF-3KVA-1.jpg etc.
      description: "Efficient 3KVA hybrid inverter for smaller solar setups.",
      specifications: {
        powerRating: "3000VA/2400W",
        voltage: "230V",
        batteryCapacity: "24V/150Ah (External)",
        dimensions: "450x280x280mm",
        weight: "18kg"
      },
      price: 28999,
      stock: 7,
      features: ["PWM solar charger", "Battery backup mode", "LCD Display"]
    },

     // Category: Online UPS (Considered a type of UPS, but distinct)
     {
      name: "PowerGuard 10KVA Online UPS",
      type: "Online UPS", 
      brand: "PowerGuard",
      model: "PG-10KVA", 
      description: "Professional-grade 10KVA online UPS.",
      specifications: {
        powerRating: "10000VA/8000W",
        voltage: "400V",
        batteryCapacity: "192V/100Ah (External)",
        dimensions: "600x400x400mm",
        weight: "45kg"
      },
      price: 89999,
      stock: 3,
      features: ["Zero transfer time", "Double conversion technology", "Hot-swappable batteries"]
    },
     {
      name: "CritiSafe 6KVA Online UPS",
      type: "Online UPS",
      brand: "CritiSafe",
      model: "CS-6KVA", // Needs CS-6KVA-1.jpg etc.
      description: "Reliable 6KVA Online UPS for critical servers and equipment.",
      specifications: {
        powerRating: "6000VA/5400W",
        voltage: "230V",
        batteryCapacity: "192V/65Ah (External)",
        dimensions: "550x350x380mm",
        weight: "38kg"
      },
      price: 59999,
      stock: 4,
      features: ["Double conversion", "Pure sine wave output", "Network management card slot"]
    },
];

// --- Seeding Logic ---
const seedDB = async () => {
  try {
    const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ang-technologies';
    await mongoose.connect(dbURI);
    console.log('Connected to MongoDB for seeding...');

    // Optional: Clear existing products before seeding
    console.log('Clearing existing products...');
    await Product.deleteMany({});
    console.log('Existing products cleared.');

    console.log('Seeding new products...');
    for (const product of dummyProducts) {
      // Generate image paths based on naming convention (<model>-<index>.jpg)
      // Assumes you might provide up to 3 images named like this.
      // IMPORTANT: Ensure you have at least <model>-1.jpg in the uploads/products folder!
      const imagePaths = [];
      // You can adjust the number of images (e.g., loop to 1 if you only have one per product)
      for (let i = 1; i <= 3; i++) {
        // Assuming .jpg extension, adjust if you use .png, .webp etc.
        imagePaths.push(`/uploads/products/${product.model}-${i}.jpg`); 
      }

      // Convert specifications object to Map required by the schema
      const specificationsMap = new Map();
       if (product.specifications && typeof product.specifications === 'object') {
         Object.entries(product.specifications).forEach(([key, value]) => {
           if (value) { // Only add non-empty values
             specificationsMap.set(key, value.toString());
           }
         });
       }

      const productData = {
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.type, // Set category from type
        type: product.type,
        brand: product.brand,
        model: product.model,
        features: product.features || [],
        specifications: specificationsMap,
        images: imagePaths, // Add the generated image URLs
        stock: product.stock,
        isActive: true // Default to active
      };

      const newProduct = new Product(productData);
      await newProduct.save();
      console.log(` -> Product "${product.name}" added.`);
    }

    console.log('Database seeding completed successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
};

// Run the seeding function
seedDB(); 