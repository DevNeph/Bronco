const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id'
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled']]
    }
  },
  pickupTime: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'pickup_time'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'total_amount',
    validate: {
      isDecimal: true
    }
  },
  paymentMethod: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'payment_method',
    validate: {
      isIn: [['balance', 'cash', 'card']]
    }
  },
  isFreeCoffee: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_free_coffee'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'completed_at'
  }
}, {
  tableName: 'orders',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeUpdate: async (order) => {
      // Set completed_at timestamp when order status changes to completed
      if (order.changed('status') && order.status === 'completed' && !order.completedAt) {
        order.completedAt = new Date();
      }
    }
  }
});

module.exports = Order;