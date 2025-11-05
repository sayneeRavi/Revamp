"use client";

import React from "react";
import { TrendingUp, TrendingDown, Clock, CheckCircle, AlertTriangle } from "lucide-react";

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon?: React.ReactNode;
  subtitle?: string;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
}

export default function AnalyticsCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon, 
  subtitle,
  color = 'blue'
}: AnalyticsCardProps) {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-100 text-blue-600';
      case 'green': return 'bg-green-100 text-green-600';
      case 'orange': return 'bg-orange-100 text-orange-600';
      case 'red': return 'bg-red-100 text-red-600';
      case 'purple': return 'bg-purple-100 text-purple-600';
      default: return 'bg-blue-100 text-blue-600';
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${getColorClasses(color)}`}>
          {icon}
        </div>
        {change !== undefined && (
          <div className={`flex items-center text-sm font-medium ${
            changeType === 'increase' ? 'text-green-600' : 'text-red-600'
          }`}>
            {changeType === 'increase' ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

interface WorkloadChartProps {
  data: {
    day: string;
    hours: number;
    tasks: number;
  }[];
}

export function WorkloadChart({ data }: WorkloadChartProps) {
  const maxHours = Math.max(...data.map(d => d.hours));
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Workload</h3>
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className="w-16 text-sm text-gray-600">{item.day}</div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(item.hours / maxHours) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-700">{item.hours}h</span>
              </div>
              <div className="text-xs text-gray-500">{item.tasks} tasks</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface PerformanceMetricsProps {
  metrics: {
    efficiency: number;
    onTimeDelivery: number;
    customerSatisfaction: number;
    averageTaskTime: number;
  };
}

export function PerformanceMetrics({ metrics }: PerformanceMetricsProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">Performance Metrics</h3>
      
      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Efficiency</span>
            <span className="text-sm font-bold text-gray-900">{metrics.efficiency}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${metrics.efficiency}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">On-Time Delivery</span>
            <span className="text-sm font-bold text-gray-900">{metrics.onTimeDelivery}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${metrics.onTimeDelivery}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Customer Satisfaction</span>
            <span className="text-sm font-bold text-gray-900">{metrics.customerSatisfaction}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${metrics.customerSatisfaction}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Avg. Task Time</span>
            <span className="text-sm font-bold text-gray-900">{metrics.averageTaskTime}h</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-orange-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(metrics.averageTaskTime / 8) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
