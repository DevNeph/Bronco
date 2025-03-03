import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#5D4037', '#795548', '#8D6E63', '#A1887F', '#BCAAA4', '#D7CCC8'];

const PopularProductsChart = ({ data, title = "Popüler Ürünler" }) => {
  // Veri formatını kontrol edelim ve yoksa boş bir diziye varsayılan atayalım
  const chartData = data || [];
  
  // Tooltip özelleştirme
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const product = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium">{product.name}</p>
          <p>Satış: {product.value} adet</p>
          <p>Oran: {product.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  // Custom legend
  const renderCustomizedLegend = (props) => {
    const { payload } = props;
    
    return (
      <ul className="flex flex-wrap gap-4 justify-center mt-4">
        {payload.map((entry, index) => (
          <li key={`item-${index}`} className="flex items-center">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-700">{entry.value} ({chartData[index].percentage}%)</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-5">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
      
      {chartData.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-gray-500">Henüz veri yok</p>
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={renderCustomizedLegend} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default PopularProductsChart;