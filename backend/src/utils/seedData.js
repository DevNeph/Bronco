require('dotenv').config();
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { sequelize, User, Product, Setting, Loyalty } = require('../models');

/**
 * Seed the database with sample data
 */
async function seedData() {
  try {
    console.log('Starting database seed...');
    
    // Connect to database
    await sequelize.authenticate();
    console.log('Database connection established.');
    
    // Sync database models - ONLY FOR DEVELOPMENT!
    await sequelize.sync({ force: true });
    console.log('Database synced.');
    
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await User.create({
      email: 'admin@broncocoffee.com',
      passwordHash: adminPassword,
      phone: '+901234567890',
      firstName: 'Admin',
      lastName: 'User',
      isAdmin: true
    });
    console.log('Admin user created.');
    
    // Create sample user
    const userPassword = await bcrypt.hash('user123', 10);
    const sampleUser = await User.create({
      email: 'user@example.com',
      passwordHash: userPassword,
      phone: '+901234567891',
      firstName: 'Sample',
      lastName: 'User',
      isAdmin: false
    });
    console.log('Sample user created.');
    
    // Initialize loyalty program for users
    await Loyalty.create({
      userId: adminUser.id,
      coffeeCount: 5,
      freeCoffees: 0,
      usedCoffees: 0
    });
    
    await Loyalty.create({
      userId: sampleUser.id,
      coffeeCount: 12,
      freeCoffees: 1,
      usedCoffees: 0
    });
    console.log('Loyalty records created.');
    
    // Create sample products
    const products = [
      {
        id: uuidv4(),
        name: 'Espresso',
        description: 'A concentrated form of coffee served in a small, strong shot.',
        price: 10.00,
        category: 'coffee',
        imageUrl: 'https://example.com/images/espresso.jpg',
        isAvailable: true,
        customizationOptions: {
          size: ['small', 'double'],
          sugar: ['none', 'low', 'medium', 'high']
        }
      },
      {
        id: uuidv4(),
        name: 'Americano',
        description: 'Espresso diluted with hot water.',
        price: 12.00,
        category: 'coffee',
        imageUrl: 'https://example.com/images/americano.jpg',
        isAvailable: true,
        customizationOptions: {
          size: ['small', 'medium', 'large'],
          sugar: ['none', 'low', 'medium', 'high']
        }
      },
      {
        id: uuidv4(),
        name: 'Latte',
        description: 'Espresso with steamed milk and a small amount of milk foam.',
        price: 15.00,
        category: 'coffee',
        imageUrl: 'https://example.com/images/latte.jpg',
        isAvailable: true,
        customizationOptions: {
          size: ['small', 'medium', 'large'],
          milk: ['whole', 'skim', 'soy', 'almond', 'oat'],
          sugar: ['none', 'low', 'medium', 'high']
        }
      },
      {
        id: uuidv4(),
        name: 'Cappuccino',
        description: 'Equal parts espresso, steamed milk, and milk foam.',
        price: 15.00,
        category: 'coffee',
        imageUrl: 'https://example.com/images/cappuccino.jpg',
        isAvailable: true,
        customizationOptions: {
          size: ['small', 'medium', 'large'],
          milk: ['whole', 'skim', 'soy', 'almond', 'oat'],
          sugar: ['none', 'low', 'medium', 'high']
        }
      },
      {
        id: uuidv4(),
        name: 'Mocha',
        description: 'Espresso with chocolate and steamed milk.',
        price: 18.00,
        category: 'coffee',
        imageUrl: 'https://example.com/images/mocha.jpg',
        isAvailable: true,
        customizationOptions: {
          size: ['small', 'medium', 'large'],
          milk: ['whole', 'skim', 'soy', 'almond', 'oat'],
          sugar: ['none', 'low', 'medium', 'high'],
          whippedCream: [true, false]
        }
      },
      {
        id: uuidv4(),
        name: 'Turkish Tea',
        description: 'Traditional Turkish black tea.',
        price: 8.00,
        category: 'tea',
        imageUrl: 'https://example.com/images/turkish-tea.jpg',
        isAvailable: true,
        customizationOptions: {
          sugar: ['none', 'low', 'medium', 'high']
        }
      },
      {
        id: uuidv4(),
        name: 'Chocolate Chip Cookie',
        description: 'Freshly baked chocolate chip cookie.',
        price: 9.00,
        category: 'food',
        imageUrl: 'https://example.com/images/cookie.jpg',
        isAvailable: true,
        customizationOptions: {}
      },
      {
        id: uuidv4(),
        name: 'Croissant',
        description: 'Buttery, flaky pastry.',
        price: 12.00,
        category: 'food',
        imageUrl: 'https://example.com/images/croissant.jpg',
        isAvailable: true,
        customizationOptions: {}
      },
      {
        id: uuidv4(),
        name: 'Cheesecake',
        description: 'Creamy New York style cheesecake.',
        price: 20.00,
        category: 'dessert',
        imageUrl: 'https://example.com/images/cheesecake.jpg',
        isAvailable: true,
        customizationOptions: {}
      },
      {
        id: uuidv4(),
        name: 'Soda',
        description: 'Assorted carbonated beverages.',
        price: 7.00,
        category: 'other',
        imageUrl: 'https://example.com/images/soda.jpg',
        isAvailable: true,
        customizationOptions: {
          type: ['cola', 'lemon', 'orange', 'soda water']
        }
      }
    ];
    
    // Insert products
    await Product.bulkCreate(products);
    console.log('Sample products created.');
    
    // Create settings
    const settings = [
      {
        id: 'loyalty_program',
        value: {
          coffeeThreshold: 10,
          enabled: true
        },
        updatedBy: adminUser.id
      },
      {
        id: 'store_hours',
        value: {
          monday: { open: '08:00', close: '22:00' },
          tuesday: { open: '08:00', close: '22:00' },
          wednesday: { open: '08:00', close: '22:00' },
          thursday: { open: '08:00', close: '22:00' },
          friday: { open: '08:00', close: '23:00' },
          saturday: { open: '09:00', close: '23:00' },
          sunday: { open: '09:00', close: '21:00' }
        },
        updatedBy: adminUser.id
      },
      {
        id: 'app_info',
        value: {
          name: 'Bronco Coffee',
          version: '1.0.0',
          contact: {
            phone: '+901234567892',
            email: 'info@broncocoffee.com',
            address: '123 Coffee Street, Istanbul'
          }
        },
        updatedBy: adminUser.id
      }
    ];
    
    // Insert settings
    await Setting.bulkCreate(settings);
    console.log('Settings created.');
    
    console.log('Database seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run seed function
seedData();