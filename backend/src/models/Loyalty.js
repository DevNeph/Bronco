const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Loyalty = sequelize.define('Loyalty', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    field: 'user_id'
  },
  coffeeCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'coffee_count'
  },
  freeCoffees: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'free_coffees'
  },
  usedCoffees: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'used_coffees'
  }
}, {
  tableName: 'loyalty',
  timestamps: true,
  createdAt: false,
  updatedAt: 'updated_at',
  underscored: true
});

// Instance method to calculate available free coffees
Loyalty.prototype.getAvailableFreeCoffees = function() {
  return this.freeCoffees - this.usedCoffees;
};

// Instance method to add a coffee purchase
Loyalty.prototype.addCoffee = function(coffeeCount = 1) {
  this.coffeeCount += coffeeCount;
  
  // Check if user qualifies for free coffee
  // Rule: Every 10 coffees, get 1 free
  const coffeeThreshold = 10;
  const newFreeCoffees = Math.floor(this.coffeeCount / coffeeThreshold);
  
  if (newFreeCoffees > this.freeCoffees) {
    this.freeCoffees = newFreeCoffees;
  }
  
  return this.save();
};

// Instance method to use a free coffee
Loyalty.prototype.useFreeCoffee = function() {
  if (this.getAvailableFreeCoffees() <= 0) {
    throw new Error('No free coffees available');
  }
  
  this.usedCoffees += 1;
  return this.save();
};

module.exports = Loyalty;