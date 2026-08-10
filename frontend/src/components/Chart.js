import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Card, CardContent, Typography } from '@mui/material';

const Chart = ({ type, data, title, colors, xAxisKey, yAxisKey }) => {
  const defaultColors = ['#1976d2', '#2e7d32', '#ed6c02', '#dc004e', '#9c27b0'];

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey || 'name'} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey={yAxisKey || 'value'}
              stroke={colors?.[0] || defaultColors[0]}
            />
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey || 'name'} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={yAxisKey || 'value'} fill={colors?.[0] || defaultColors[0]} />
          </BarChart>
        );
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors?.[index] || defaultColors[index % defaultColors.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="h-full">
      <CardContent>
        {title && (
          <Typography variant="h6" className="font-bold mb-4">
            {title}
          </Typography>
        )}
        <ResponsiveContainer width="100%" height={300}>
          {renderChart()}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default Chart;