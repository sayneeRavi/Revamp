"use client";

import React, { useState, useEffect } from "react";
import { Play, Pause, Square } from "lucide-react";

interface TimeTrackerProps {
  taskId: string;
  taskName: string;
  onStart: (taskId: string) => void;
  onStop: () => void;
  isActive: boolean;
  startTime?: string;
}

export default function TimeTracker({ 
  taskId, 
  taskName, 
  onStart, 
  onStop, 
  isActive, 
  startTime 
}: TimeTrackerProps) {
  const [elapsedTime, setElapsedTime] = useState("00:00:00");

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isActive && startTime) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const start = new Date(startTime).getTime();
        const diff = now - start;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setElapsedTime(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, startTime]);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Time Tracker</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {isActive ? 'Active' : 'Inactive'}
        </div>
      </div>

      <div className="text-center mb-6">
        <div className="text-4xl font-mono font-bold text-blue-600 mb-2">
          {elapsedTime}
        </div>
        <p className="text-gray-600">{taskName}</p>
      </div>

      <div className="flex justify-center space-x-4">
        {!isActive ? (
          <button
            onClick={() => onStart(taskId)}
            className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Tracking
          </button>
        ) : (
          <button
            onClick={onStop}
            className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Pause className="w-5 h-5 mr-2" />
            Stop Tracking
          </button>
        )}
      </div>

      {isActive && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-800 text-center">
            ⏱️ Time is being tracked automatically. Your work hours will be logged.
          </p>
        </div>
      )}
    </div>
  );
}
