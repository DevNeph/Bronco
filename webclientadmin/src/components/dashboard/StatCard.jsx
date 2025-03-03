import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ title, value, icon, change, changeType, color }) => {
  return (
    <div className="bg-white rounded-lg shadow p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full bg-${color || 'brown'}-100`}>
          {icon}
        </div>
      </div>
      
      {change && (
        <div className="flex items-center text-sm">
          <span className={`text-${changeType === 'increase' ? 'green' : 'red'}-500 flex items-center`}>
            {changeType === 'increase' ? 
              <TrendingUp size={16} className="mr-1" /> : 
              <TrendingDown size={16} className="mr-1" />
            }
            <span>{change}</span>
          </span>
          <span className="text-gray-400 ml-2">Önceki döneme göre</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;