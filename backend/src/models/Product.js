const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      isDecimal: true,
      min: 0
    }
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      isIn: [['coffee', 'tea', 'food', 'dessert', 'other']]
    }
  },
  imageUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'image_url'
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_available'
  },
  customizationOptions: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    field: 'customization_options'
  }
}, {
  tableName: 'products',
  timestamps: true,
  underscored: true
});

module.exports = Product;