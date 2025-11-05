"use client";

import React, { useState } from "react";
import { Calendar, Clock, User, Car, Wrench, CheckCircle, AlertTriangle } from "lucide-react";

interface TaskProgressProps {
  task: {
    id: string;
    customerName: string;
    vehicleInfo: string;
    serviceType: 'service' | 'modification';
    description: string;
    status: 'assigned' | 'accepted' | 'in-progress' | 'completed' | 'delivered';
    priority: 'low' | 'medium' | 'high';
    estimatedHours: number;
    assignedDate: string;
    dueDate: string;
    instructions?: string;
  };
}

export default function TaskProgress({ task }: TaskProgressProps) {
  const [currentStep, setCurrentStep] = useState(task.status);

  const steps = [
    { id: 'assigned', label: 'Assigned', icon: AlertTriangle },
    { id: 'accepted', label: 'Accepted', icon: CheckCircle },
    { id: 'in-progress', label: 'In Progress', icon: Clock },
    { id: 'completed', label: 'Completed', icon: CheckCircle },
    { id: 'delivered', label: 'Delivered', icon: CheckCircle }
  ];

  const getStepIndex = (status: string) => {
    return steps.findIndex(step => step.id === status);
  };

  const currentStepIndex = getStepIndex(currentStep);

  const getStepColor = (index: number) => {
    if (index < currentStepIndex) return 'bg-green-500 text-white';
    if (index === currentStepIndex) return 'bg-blue-500 text-white';
    return 'bg-gray-200 text-gray-500';
  };

  const getConnectorColor = (index: number) => {
    if (index < currentStepIndex) return 'bg-green-500';
    return 'bg-gray-200';
  };

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed' && task.status !== 'delivered';

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Task Progress</h3>
        {isOverdue && (
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            Overdue
          </span>
        )}
      </div>

      {/* Progress Steps */}
      <div className="relative">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${getStepColor(index)}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs mt-2 text-center ${
                  index <= currentStepIndex ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
        
        {/* Progress Line */}
        <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 -z-10">
          <div 
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Task Details */}
      <div className="mt-6 space-y-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            task.serviceType === 'service' ? 'bg-blue-100' : 'bg-orange-100'
          }`}>
            {task.serviceType === 'service' ? (
              <Car className="w-5 h-5 text-blue-600" />
            ) : (
              <Wrench className="w-5 h-5 text-orange-600" />
            )}
          </div>
          <div>
            <p className="font-medium text-gray-800">{task.customerName}</p>
            <p className="text-sm text-gray-600">{task.vehicleInfo}</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-800">{task.description}</p>
          {task.instructions && (
            <div className="mt-2 p-2 bg-blue-50 rounded border-l-4 border-blue-500">
              <p className="text-sm text-blue-800">
                <strong>Instructions:</strong> {task.instructions}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Est. {task.estimatedHours}h</span>
          </div>
        </div>
      </div>

      {/* Progress Percentage */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-bold text-gray-900">
            {Math.round((currentStepIndex / (steps.length - 1)) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
