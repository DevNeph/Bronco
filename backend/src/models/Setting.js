const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Setting = sequelize.define('Setting', {
  id: {
    type: DataTypes.STRING(100),
    primaryKey: true
  },
  value: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {}
  },
  updatedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'updated_by'
  }
}, {
  tableName: 'settings',
  timestamps: true,
  createdAt: false,
  updatedAt: 'updated_at',
  underscored: true
});

// Class method to get a setting by key
Setting.getSetting = async function(key, defaultValue = null) {
  const setting = await this.findByPk(key);
  return setting ? setting.value : defaultValue;
};

// Class method to set a setting
Setting.setSetting = async function(key, value, userId) {
  const [setting, created] = await this.findOrCreate({
    where: { id: key },
    defaults: {
      value,
      updatedBy: userId
    }
  });
  
  if (!created) {
    setting.value = value;
    setting.updatedBy = userId;
    await setting.save();
  }
  
  return setting;
};

module.exports = Setting;