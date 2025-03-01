const sequelize = require('../config/database');
const User = require('./User');
const Balance = require('./Balance');
const Loyalty = require('./Loyalty');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Product = require('./Product');
const Setting = require('./Setting');

// Define model associations
User.hasMany(Balance, { foreignKey: 'userId' });
Balance.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(Loyalty, { foreignKey: 'userId' });
Loyalty.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

User.hasMany(Setting, { foreignKey: 'updatedBy' });
Setting.belongsTo(User, { foreignKey: 'updatedBy' });

module.exports = {
  sequelize,
  User,
  Balance,
  Loyalty,
  Order,
  OrderItem,
  Product,
  Setting
};