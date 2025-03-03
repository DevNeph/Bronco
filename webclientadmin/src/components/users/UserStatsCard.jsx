import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const UserStatsCard = ({ title, data, dataKey, total, increase, color }) => {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200">
        <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
      </div>
      <div className="px-6 py-5">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-2xl font-semibold">{total}</p>
            <p className="text-sm text-gray-500">
              {increase > 0 ? (
                <span className="text-green-600">
                  ↑ {increase}% artış
                </span>
              ) : (
                <span className="text-red-600">
                  ↓ {Math.abs(increase)}% azalış
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 25,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => {
                  if (value >= 1000) {
                    return `${(value / 1000).toFixed(0)}k`;
                  }
                  return value;
                }}
              />
              <Tooltip
                formatter={(value) => [`${value}`, dataKey]}
                labelFormatter={(label) => `${label}`}
              />
              <Bar
                dataKey="value"
                fill={color || '#8884d8'}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default UserStatsCard;