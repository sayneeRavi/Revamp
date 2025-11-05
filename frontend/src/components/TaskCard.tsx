"use client";

import React, { useState } from "react";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

interface TaskCardProps {
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
  onAction: (taskId: string, action: string) => void;
  onStartTimeTracking: (taskId: string) => void;
}

export default function TaskCard({ task, onAction, onStartTimeTracking }: TaskCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'assigned': return <Clock className="w-4 h-4" />;
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'in-progress': return <AlertCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed' && task.status !== 'delivered';

  return (
    <div className={`bg-white rounded-xl shadow-sm border transition-all duration-200 ${
      isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200'
    }`}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-800">{task.customerName}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(task.status)}`}>
                {getStatusIcon(task.status)}
                <span className="ml-1">{task.status.replace('-', ' ')}</span>
              </span>
              {isOverdue && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Overdue
                </span>
              )}
            </div>
            <p className="text-gray-600 mb-2">{task.vehicleInfo}</p>
            <p className="text-gray-800 mb-2">{task.description}</p>
            
            {showDetails && task.instructions && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Instructions:</strong> {task.instructions}
                </p>
              </div>
            )}
          </div>
          
          <div className="text-right ml-4">
            <p className="text-sm text-gray-500">Est. {task.estimatedHours}h</p>
            <p className={`text-sm ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </p>
            <p className="text-xs text-gray-400">
              Assigned: {new Date(task.assignedDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg ${
              task.serviceType === 'service' ? 'bg-blue-100' : 'bg-orange-100'
            }`}>
              {task.serviceType === 'service' ? (
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </div>
            <span className="text-sm text-gray-600 capitalize">{task.serviceType}</span>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>

            {task.status === 'assigned' && (
              <>
                <button
                  onClick={() => onAction(task.id, 'accept')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Accept
                </button>
                <button
                  onClick={() => onAction(task.id, 'reject')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </button>
              </>
            )}

            {task.status === 'accepted' && (
              <button
                onClick={() => {
                  onAction(task.id, 'start');
                  onStartTimeTracking(task.id);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" />
                </svg>
                Start Work
              </button>
            )}

            {task.status === 'in-progress' && (
              <button
                onClick={() => onAction(task.id, 'complete')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark Complete
              </button>
            )}

            {task.status === 'completed' && (
              <button
                onClick={() => onAction(task.id, 'deliver')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark Delivered
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
