const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Balance = sequelize.define('Balance', {
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
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      isDecimal: true
    }
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: [['deposit', 'withdrawal', 'refund']]
    }
  },
  referenceId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'reference_id'
  },
  balanceAfter: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'balance_after',
    validate: {
      isDecimal: true
    }
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'balances',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  underscored: true
});

// Class method to get current balance for a user
Balance.getCurrentBalance = async function(userId) {
  const latestTransaction = await this.findOne({
    where: { userId },
    order: [['created_at', 'DESC']]
  });
  
  return latestTransaction ? latestTransaction.balanceAfter : 0;
};

module.exports = Balance;