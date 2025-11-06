"use client";

import { useEffect, useState } from "react";
import { getGreeting } from "../../utils/greeting";
import { decodeToken, TokenPayload } from "../../utils/jwt";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Play, 
  Pause, 
  Calendar, 
  User, 
  Settings, 
  History,
  Bell,
  Car,
  Wrench,
  Timer
} from "lucide-react";

interface Task {
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
}

interface TimeLog {
  id: string;
  taskId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  status: 'active' | 'paused' | 'completed';
  updatedAt?: string;
}

export default function EmployeeDashboard() {
  const [user, setUser] = useState<TokenPayload | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'profile' | 'history'>('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [currentTimeLog, setCurrentTimeLog] = useState<TimeLog | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL as string;
  const USE_MOCK = (process.env.NEXT_PUBLIC_USE_MOCK || '').toLowerCase() === 'true';
  const [employeeId, setEmployeeId] = useState<string>('EMP001');

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = decodeToken(token);
      setUser(decoded);
      const maybeEmp = decoded?.sub?.toUpperCase?.() || '';
      setEmployeeId(maybeEmp.startsWith('EMP') ? maybeEmp : 'EMP001');
    } else {
      // Development bypass - create mock user for testing
      setUser({
        sub: "emp001",
        username: "John Employee",
        email: "john.employee@revamp.com",
        role: "EMPLOYEE"
      });
      setEmployeeId('EMP001');
    }
    // Load from API (no automatic mock fallback unless explicitly enabled)
    fetchTasks();
  }, []);

  // Load current time log from backend (active, otherwise latest paused)
  useEffect(() => {
    const loadCurrentLog = async () => {
      try {
        if (!GATEWAY_URL || !employeeId) return;
        // Try active first
        const activeRes = await fetch(`${GATEWAY_URL}/api/time-tracking/active/${employeeId}`, { cache: 'no-store' });
        if (activeRes.ok) {
          if (activeRes.status === 204) {
            // No active time log
            throw new Error('No active time log');
          }
          const log = await activeRes.json();
          const tl: TimeLog = {
            id: log.id,
            taskId: log.taskId,
            startTime: log.startTime,
            endTime: log.endTime,
            duration: log.duration,
            status: log.status,
            updatedAt: log.updatedAt
          };
          setCurrentTimeLog(tl);
          return;
        }
        // If not active, try to find the latest paused log
        const allRes = await fetch(`${GATEWAY_URL}/api/time-tracking/employee/${employeeId}`, { cache: 'no-store' });
        if (allRes.ok) {
          const logs = await allRes.json();
          const paused = (logs || []).filter((l: any) => l.status === 'paused');
          if (paused.length) {
            paused.sort((a: any, b: any) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
            const pl = paused[0];
            const tl: TimeLog = {
              id: pl.id,
              taskId: pl.taskId,
              startTime: pl.startTime,
              endTime: pl.endTime,
              duration: pl.duration,
              status: pl.status,
              updatedAt: pl.updatedAt
            };
            setCurrentTimeLog(tl);
            return;
          }
        }
        setCurrentTimeLog(null);
      } catch {
        // Ignore load errors on initial mount
      }
    };
    loadCurrentLog();
  }, [employeeId, GATEWAY_URL]);

  // Refetch tasks when employeeId or gateway changes so we don't wait for the next poll
  useEffect(() => {
    if (employeeId && GATEWAY_URL) {
      fetchTasks();
    }
  }, [employeeId, GATEWAY_URL]);

  const fetchTasks = async () => {
    try {
      if (!GATEWAY_URL) throw new Error('GATEWAY_URL not set');
      const res = await fetch(`${GATEWAY_URL}/api/tasks/employee/${employeeId}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data: any[] = await res.json();
      // Normalize fields if needed
      const normalized = data.map((t: any) => ({
        id: t.id,
        customerName: t.customerName,
        vehicleInfo: t.vehicleInfo,
        serviceType: t.serviceType,
        description: t.description,
        status: t.status,
        priority: t.priority || 'medium',
        estimatedHours: t.estimatedHours || 0,
        assignedDate: t.assignedDate || new Date().toISOString(),
        dueDate: t.dueDate || new Date().toISOString(),
        instructions: t.instructions || ''
      })) as Task[];
      setTasks(normalized);
    } catch (e) {
      // Only use mock data when explicitly enabled for development
      if (USE_MOCK) {
        loadMockData();
      } else {
        console.warn('Task fetch failed and mock fallback is disabled:', e);
        setTasks([]);
      }
    }
  };

  const loadMockData = () => {
    setTasks([
      {
        id: '1',
        customerName: 'John Smith',
        vehicleInfo: '2020 Honda Civic - Red',
        serviceType: 'service',
        description: 'Oil change and brake inspection',
        status: 'assigned',
        priority: 'medium',
        estimatedHours: 2,
        assignedDate: '2024-01-15',
        dueDate: '2024-01-16',
        instructions: 'Check brake pads and replace if needed'
      },
      {
        id: '2',
        customerName: 'Sarah Johnson',
        vehicleInfo: '2019 Toyota Camry - Blue',
        serviceType: 'modification',
        description: 'Engine upgrade and ECU tuning',
        status: 'in-progress',
        priority: 'high',
        estimatedHours: 8,
        assignedDate: '2024-01-14',
        dueDate: '2024-01-18',
        instructions: 'Follow manufacturer guidelines for engine swap'
      },
      {
        id: '3',
        customerName: 'Mike Wilson',
        vehicleInfo: '2021 Ford Mustang - Black',
        serviceType: 'service',
        description: 'Transmission service',
        status: 'completed',
        priority: 'low',
        estimatedHours: 3,
        assignedDate: '2024-01-13',
        dueDate: '2024-01-15',
        instructions: 'Replace transmission fluid and filter'
      }
    ]);

    setTimeLogs([
      {
        id: '1',
        taskId: '2',
        startTime: '2024-01-15T09:00:00',
        status: 'active'
      }
    ]);

    setCurrentTimeLog({
      id: '1',
      taskId: '2',
      startTime: '2024-01-15T09:00:00',
      status: 'active'
    });
  };

  const greeting = getGreeting();

  // Poll for new/updated tasks periodically so admin assignments appear without refresh
  useEffect(() => {
    const pollMs = 20000; // 20s
    const timer = setInterval(() => {
      fetchTasks();
    }, pollMs);
    return () => clearInterval(timer);
  }, [employeeId, GATEWAY_URL]);

  const handleTaskAction = async (taskId: string, action: 'accept' | 'reject' | 'start' | 'complete' | 'deliver') => {
    try {
      if (!GATEWAY_URL) throw new Error('GATEWAY_URL not set');
      const res = await fetch(`${GATEWAY_URL}/api/tasks/${taskId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId })
      });
      if (!res.ok) throw new Error('Task action failed');
      const updated = await res.json();
      setTasks(prev => prev.map(t => (t.id === taskId ? {
        id: updated.id,
        customerName: updated.customerName,
        vehicleInfo: updated.vehicleInfo,
        serviceType: updated.serviceType,
        description: updated.description,
        status: updated.status,
        priority: updated.priority || t.priority,
        estimatedHours: updated.estimatedHours || t.estimatedHours,
        assignedDate: updated.assignedDate || t.assignedDate,
        dueDate: updated.dueDate || t.dueDate,
        instructions: updated.instructions || t.instructions,
      } : t)));

      if (action === 'reject') sendNotificationToAdmin(taskId, 'rejected', updated);
      if (action === 'complete') sendNotificationToAdmin(taskId, 'completed', updated);
      if (action === 'deliver') sendNotificationToAdmin(taskId, 'delivered', updated);
    } catch (e) {
      // Optimistic fallback
      setTasks(prev => prev.map(task => task.id === taskId ? { ...task, status: action === 'start' ? 'in-progress' : action === 'accept' ? 'accepted' : action === 'complete' ? 'completed' : action === 'deliver' ? 'delivered' : task.status } : task));
    }
  };

  const sendNotificationToAdmin = (taskId: string, action: string, task: Task) => {
    const notification = {
      id: Date.now().toString(),
      type: action === 'rejected' ? 'warning' : 'success',
      title: `Task ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      message: `${task.customerName}'s ${task.serviceType} has been ${action}`,
      timestamp: new Date().toISOString(),
      read: false,
      taskId: taskId,
      employeeId: user?.sub || 'emp001',
      employeeName: user?.username || 'John Employee'
    };
    
    // In a real app, this would send to backend/WebSocket
    console.log('📤 Notification sent to admin:', notification);
    
    // Add to local notifications for demo
    addNotification(notification);
  };

  const addNotification = (notification: any) => {
    // Add to local notifications for demo
    setNotifications(prev => [notification, ...prev]);
    
    // Show a toast notification
    showToast(notification);
  };

  const showToast = (notification: any) => {
    // Create a temporary toast notification
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white max-w-sm ${
      notification.type === 'success' ? 'bg-green-500' : 
      notification.type === 'warning' ? 'bg-yellow-500' : 
      notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`;
    toast.innerHTML = `
      <div class="flex items-center">
        <div class="flex-1">
          <p class="font-semibold">${notification.title}</p>
          <p class="text-sm opacity-90">${notification.message}</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-white hover:text-gray-200">
          ×
        </button>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 5000);
  };

  const startTimeTracking = async (taskId: string) => {
    // Stop any existing time tracking first
    if (currentTimeLog) {
      stopTimeTracking();
    }
    try {
      await handleTaskAction(taskId, 'start');
      if (!GATEWAY_URL) throw new Error('GATEWAY_URL not set');
      const res = await fetch(`${GATEWAY_URL}/api/time-tracking/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, taskId })
      });
      if (!res.ok) throw new Error('Failed to start time tracking');
      const log = await res.json();
      const tl: TimeLog = { id: log.id, taskId: log.taskId, startTime: log.startTime, status: 'active' };
      setCurrentTimeLog(tl);
      setTimeLogs(prev => [...prev, tl]);
    } catch (e) {
      // Local fallback
      const newTimeLog: TimeLog = {
        id: Date.now().toString(),
        taskId,
        startTime: new Date().toISOString(),
        status: 'active'
      };
      setCurrentTimeLog(newTimeLog);
      setTimeLogs(prev => [...prev, newTimeLog]);
    }
  };

  const stopTimeTracking = async () => {
    if (currentTimeLog) {
      const endTime = new Date().toISOString();
      const duration = Math.floor((new Date(endTime).getTime() - new Date(currentTimeLog.startTime).getTime()) / (1000 * 60 * 60));
      try {
        if (GATEWAY_URL) {
          await fetch(`${GATEWAY_URL}/api/time-tracking/stop/${currentTimeLog.id}`, { method: 'POST' });
        }
      } catch {}
      setTimeLogs(prev => prev.map(log => 
        log.id === currentTimeLog.id 
          ? { ...log, endTime, duration, status: 'completed' }
          : log
      ));
      setCurrentTimeLog(null);
      
      console.log(`⏱️ Time tracking stopped. Duration: ${duration} hours`);
    }
  };

  const pauseTimeTracking = async () => {
    if (currentTimeLog) {
      try {
        if (GATEWAY_URL) {
          const res = await fetch(`${GATEWAY_URL}/api/time-tracking/pause/${currentTimeLog.id}`, { method: 'POST' });
          if (!res.ok) {
            throw new Error('Pause request failed');
          }
        }
      } catch (e) {
        console.warn('Pause request error (optimistic update applied):', e);
      } finally {
        // Optimistic UI update so the button always works
        setTimeLogs(prev => prev.map(log =>
          log.id === currentTimeLog.id
            ? { ...log, endTime: new Date().toISOString(), status: 'paused' }
            : log
        ));
        setCurrentTimeLog({ ...currentTimeLog, status: 'paused' });
        console.log('⏸️ Time tracking paused');
      }
    }
  };

  const resumeTimeTracking = async (taskId: string) => {
    try {
      if (!GATEWAY_URL) throw new Error('GATEWAY_URL not set');
      // If we already have a paused current log for this task, resume it
      if (currentTimeLog && currentTimeLog.taskId === taskId && currentTimeLog.status === 'paused') {
        const res = await fetch(`${GATEWAY_URL}/api/time-tracking/resume/${currentTimeLog.id}`, { method: 'POST' });
        if (res.ok) {
          const log = await res.json();
          const tl: TimeLog = { id: log.id, taskId: log.taskId, startTime: log.startTime, status: 'active' };
          setCurrentTimeLog(tl);
          setTimeLogs(prev => prev.map(l => l.id === tl.id ? { ...l, status: 'active', startTime: tl.startTime } : l));
          console.log('▶️ Time tracking resumed');
          return;
        }
      }

      // Else try to find a paused log for this employee and task
      const logsRes = await fetch(`${GATEWAY_URL}/api/time-tracking/employee/${employeeId}`, { cache: 'no-store' });
      if (logsRes.ok) {
        const logs = await logsRes.json();
        const paused = (logs || []).filter((l: any) => l.taskId === taskId && l.status === 'paused');
        if (paused.length) {
          paused.sort((a: any, b: any) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
          const pl = paused[0];
          const res = await fetch(`${GATEWAY_URL}/api/time-tracking/resume/${pl.id}`, { method: 'POST' });
          if (res.ok) {
            const log = await res.json();
            const tl: TimeLog = { id: log.id, taskId: log.taskId, startTime: log.startTime, status: 'active' };
            setCurrentTimeLog(tl);
            setTimeLogs(prev => prev.map(l => l.id === tl.id ? { ...l, status: 'active', startTime: tl.startTime } : l));
            console.log('▶️ Time tracking resumed');
            return;
          }
        }
      }

      // Fallback: start a new time log
      await startTimeTracking(taskId);
    } catch (e) {
      // Local fallback
      await startTimeTracking(taskId);
    }
  };

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

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const Sidebar = () => (
    <div className="w-64 bg-[#000042] shadow-lg rounded-l-2xl p-6 fixed left-0 top-0 h-screen overflow-y-auto">
      <div className="flex items-center mb-8">
        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
          {user?.username?.charAt(0) || 'E'}
        </div>
        <div className="ml-3">
          <h3 className="font-semibold text-white">{user?.username || 'Employee'}</h3>
          <p className="text-sm text-gray-300">{user?.email}</p>
        </div>
      </div>

      <nav className="space-y-2">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: Calendar },
          { id: 'tasks', label: 'My Tasks', icon: Wrench },
          { id: 'profile', label: 'Profile', icon: User },
          { id: 'history', label: 'History', icon: History }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
              activeTab === id 
                ? 'text-[#000042]' 
                : 'text-gray-300 hover:bg-blue-900 hover:text-white'
            }`}
            style={activeTab === id ? { backgroundColor: '#cde2ee' } : {}}
          >
            <Icon className="w-5 h-5 mr-3" />
            {label}
          </button>
        ))}
      </nav>

      <div className="mt-8 pt-6 border-t border-gray-600">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-white">Availability</span>
          <button
            onClick={() => setIsAvailable(!isAvailable)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isAvailable ? 'bg-green-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isAvailable ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        <p className="text-xs text-gray-300">
          {isAvailable ? 'Available for new tasks' : 'Currently unavailable'}
        </p>
      </div>
    </div>
  );

  const DashboardTab = () => (
    <div className="flex-1 p-6 relative">
      {/* Background Image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-fixed bg-no-repeat"
        style={{ 
          backgroundImage: 'url(/Bg.jpg)',
          opacity: 0.7
        }}
      ></div>
      
      {/* Light overlay for better readability */}
      <div className="absolute inset-0 bg-white/40"></div>
      
      <div className="relative z-10 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {greeting}, {user?.username || 'Employee'}!
        </h1>
        <p className="text-gray-600">Here's your work overview for today</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-10">
        <div className="rounded-xl p-6 shadow-sm border" style={{ backgroundColor: '#000042', borderColor: '#000042' }}>
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Wrench className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-white">Active Tasks</p>
              <p className="text-2xl font-bold text-white">
                {tasks.filter(t => t.status === 'in-progress').length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl p-6 shadow-sm border" style={{ backgroundColor: 'git ', borderColor: '#00571cff' }}>
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-white">Completed Today</p>
              <p className="text-2xl font-bold text-white">
                {tasks.filter(t => t.status === 'completed' || t.status === 'delivered').length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl p-6 shadow-sm border" style={{ backgroundColor: '#6c4133ff', borderColor: '#6c4133ff' }}>
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Timer className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-white">Hours Worked</p>
              <p className="text-2xl font-bold text-white">
                {currentTimeLog ? formatDuration(currentTimeLog.startTime).split('h')[0] : '0'}h
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Task */}
      {currentTimeLog && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Currently Working On</h3>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${currentTimeLog.status === 'paused' ? 'bg-yellow-500' : 'bg-green-500'} ${currentTimeLog.status === 'paused' ? '' : 'animate-pulse'}`}></div>
              <span className="text-sm text-gray-600">{currentTimeLog.status === 'paused' ? 'Timer Paused' : 'Timer Active'}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">
                {tasks.find(t => t.id === currentTimeLog.taskId)?.customerName}
              </p>
              <p className="text-sm text-gray-600">
                {tasks.find(t => t.id === currentTimeLog.taskId)?.description}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Status: {tasks.find(t => t.id === currentTimeLog.taskId)?.status.replace('-', ' ')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-blue-600">
                {formatDuration(currentTimeLog.startTime)}
              </p>
              <div className="flex space-x-2 mt-2">
                {currentTimeLog.status === 'active' ? (
                  <button
                    onClick={pauseTimeTracking}
                    className="px-3 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                  >
                    <Pause className="w-3 h-3 inline mr-1" />
                    Pause
                  </button>
                ) : (
                  <button
                    onClick={() => resumeTimeTracking(currentTimeLog.taskId)}
                    className="px-3 py-1 text-white rounded-lg transition-colors text-sm"
                    style={{ backgroundColor: '#000053' }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#000042'}
                    onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#000053'}
                  >
                    <Play className="w-3 h-3 inline mr-1" />
                    Resume
                  </button>
                )}
                <button
                  onClick={() => {
                    stopTimeTracking();
                    handleTaskAction(currentTimeLog.taskId, 'complete');
                  }}
                  className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <CheckCircle className="w-3 h-3 inline mr-1" />
                  Finish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Status */}
      <div className="rounded-xl p-6 shadow-sm border mb-6 relative z-10 overflow-hidden" style={{ borderColor: '#046169' }}>
        {/* Solid base layer to block dashboard background */}
        <div className="absolute inset-0" style={{ backgroundColor: '#041d3cff' }}></div>
        
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: 'url(/bg2.jpg)',
            opacity: 0.7
          }}
        ></div>
        
        <div className="relative z-10">
          <h3 className="text-lg font-semibold text-white mb-4">Workflow Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-yellow-600 font-bold">
                {tasks.filter(t => t.status === 'assigned').length}
              </span>
            </div>
            <p className="text-sm text-white">Assigned</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-600 font-bold">
                {tasks.filter(t => t.status === 'accepted').length}
              </span>
            </div>
            <p className="text-sm text-white">Accepted</p>
          </div>
          <div className="text-center">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2"
              style={{ backgroundColor: '#6c4133ff' }}
            >
              <span className="font-bold text-white">
                {tasks.filter(t => t.status === 'in-progress').length}
              </span>
            </div>
            <p className="text-sm text-white">In Progress</p>
          </div>
          <div className="text-center">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2"
              style={{ backgroundColor: '#00571cff' }}
            >
              <span className="font-bold text-white">
                {tasks.filter(t => t.status === 'completed' || t.status === 'delivered').length}
              </span>
            </div>
            <p className="text-sm text-white">Completed</p>
          </div>
        </div>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="rounded-xl p-6 shadow-sm border border-white/30 relative z-10" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Tasks</h3>
        <div className="space-y-3">
          {tasks.slice(0, 3).map((task) => (
            <div key={task.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
              <div className="flex items-center space-x-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: 
                      task.status === 'in-progress' ? '#6c4133ff' :
                      task.status === 'completed' ? '#00571cff' :
                      task.status === 'delivered' ? '#a855f7' : '#9ca3af'
                  }}
                ></div>
                <div>
                  <p className="font-medium text-white">{task.customerName}</p>
                  <p className="text-sm text-gray-200">{task.description}</p>
                </div>
              </div>
              <span 
                className="px-2 py-1 rounded-full text-xs font-medium text-white"
                style={{
                  backgroundColor: 
                    task.status === 'in-progress' ? '#6c4133ff' :
                    task.status === 'completed' ? '#00571cff' :
                    task.status === 'delivered' ? '#a855f7' : 
                    task.status === 'assigned' ? '#eab308' :
                    task.status === 'accepted' ? '#3b82f6' : '#6b7280'
                }}
              >
                {task.status.replace('-', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const TasksTab = () => (
    <div className="flex-1 p-6 relative">
      {/* Background Image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-fixed bg-no-repeat"
        style={{ 
          backgroundImage: 'url(/Bg.jpg)',
          opacity: 0.7
        }}
      ></div>
      
      {/* Light overlay for better readability */}
      <div className="absolute inset-0 bg-white/40"></div>
      
      <div className="relative z-10 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">My Tasks</h1>
        <p className="text-gray-600 flex items-center gap-2">Manage your assigned tasks and track progress
          <span className={`ml-2 px-2 py-0.5 rounded text-xs ${USE_MOCK ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
            {USE_MOCK ? 'Mock data (dev)' : 'Live data'}
          </span>
        </p>
      </div>

      <div className="space-y-4 relative z-10">
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">{task.customerName}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                    {task.status.replace('-', ' ')}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${task.serviceType === 'service' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                    {task.serviceType.charAt(0).toUpperCase() + task.serviceType.slice(1)}
                  </span>
                </div>
                <p className="text-gray-600 mb-2">{task.vehicleInfo}</p>
                <p className="text-gray-800 mb-2">{task.description}</p>
                {task.instructions && (
                  <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded-lg">
                    <strong>Instructions:</strong> {task.instructions}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Est. {task.estimatedHours}h</p>
                <p className="text-sm text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {task.serviceType === 'service' ? (
                  <Car className="w-4 h-4 text-blue-600" />
                ) : (
                  <Wrench className="w-4 h-4 text-orange-600" />
                )}
                <span className="text-sm text-gray-600 capitalize">{task.serviceType}</span>
              </div>

              <div className="flex space-x-2">
                {task.status === 'assigned' && (
                  <>
                    <button
                      onClick={() => handleTaskAction(task.id, 'accept')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Accept
                    </button>
                    <button
                      onClick={() => handleTaskAction(task.id, 'reject')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </button>
                  </>
                )}

                {task.status === 'accepted' && (
                  <button
                    onClick={() => startTimeTracking(task.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Work & Timer
                  </button>
                )}

                {task.status === 'in-progress' && (
                  <div className="flex space-x-2">
                    {currentTimeLog && currentTimeLog.taskId === task.id ? (
                      currentTimeLog.status === 'active' ? (
                        <>
                          <button
                            onClick={pauseTimeTracking}
                            className="px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center"
                          >
                            <Pause className="w-4 h-4 mr-2" />
                            Pause
                          </button>
                          <button
                            onClick={() => {
                              stopTimeTracking();
                              handleTaskAction(task.id, 'complete');
                            }}
                            className="px-4 py-2 text-white rounded-lg transition-colors flex items-center"
                            style={{ backgroundColor: '#11823b' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0f6e32'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#11823b'}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Finish & Complete
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => resumeTimeTracking(task.id)}
                            className="px-3 py-2 text-white rounded-lg transition-colors flex items-center"
                            style={{ backgroundColor: '#000053' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#000042'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#000053'}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Resume Timer
                          </button>
                          <button
                            onClick={() => {
                              stopTimeTracking();
                              handleTaskAction(task.id, 'complete');
                            }}
                            className="px-4 py-2 text-white rounded-lg transition-colors flex items-center"
                            style={{ backgroundColor: '#11823b' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0f6e32'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#11823b'}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Finish & Complete
                          </button>
                        </>
                      )
                    ) : (
                      <>
                        <button
                          onClick={() => resumeTimeTracking(task.id)}
                          className="px-3 py-2 text-white rounded-lg transition-colors flex items-center"
                          style={{ backgroundColor: '#000053' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#000042'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#000053'}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Resume Timer
                        </button>
                        <button
                          onClick={() => {
                            stopTimeTracking();
                            handleTaskAction(task.id, 'complete');
                          }}
                          className="px-4 py-2 text-white rounded-lg transition-colors flex items-center"
                          style={{ backgroundColor: '#11823b' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0f6e32'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#11823b'}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Finish & Complete
                        </button>
                      </>
                    )}
                  </div>
                )}

                {task.status === 'completed' && (
          <button
                    onClick={() => handleTaskAction(task.id, 'deliver')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark Delivered
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const ProfileTab = () => (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Profile</h1>
        <p className="text-gray-600">Manage your employee profile and settings</p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center mb-6">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
            {user?.username?.charAt(0) || 'E'}
          </div>
          <div className="ml-6">
            <h3 className="text-xl font-semibold text-gray-800">{user?.username || 'Employee'}</h3>
            <p className="text-gray-600">{user?.email}</p>
            <p className="text-sm text-gray-500">Employee ID: EMP001</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Personal Information</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  defaultValue={user?.username || 'Employee Name'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  defaultValue={user?.email || 'employee@revamp.com'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  defaultValue="+1 (555) 123-4567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Work Information</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  defaultValue="Service Department"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>General Service</option>
                  <option>Engine Specialist</option>
                  <option>Transmission Expert</option>
                  <option>Electrical Systems</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Junior (0-2 years)</option>
                  <option>Mid-level (2-5 years)</option>
                  <option>Senior (5+ years)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Save Changes
          </button>
          <audio id="bg-audio" src="/music/theme5.mp3" loop  />
        </div>
      </div>
    </div>
  );

  const HistoryTab = () => (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Work History</h1>
        <p className="text-gray-600">Track your completed tasks and time logs</p>
      </div>

      <div className="space-y-4">
        {timeLogs.map((log) => {
          const task = tasks.find(t => t.id === log.taskId);
          return (
            <div key={log.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-800">{task?.customerName}</h3>
                  <p className="text-gray-600">{task?.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">
                    {formatDuration(log.startTime, log.endTime)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(log.startTime).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Started: {new Date(log.startTime).toLocaleTimeString()}</span>
                {log.endTime && (
                  <span>Ended: {new Date(log.endTime).toLocaleTimeString()}</span>
                )}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  log.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {log.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64">
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 fixed top-0 right-0 left-64 z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <button className="px-3 py-2 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition">
                  ← Back to Home
                </button>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h2 className="text-lg font-semibold text-gray-800">
                {activeTab === 'dashboard' && 'Dashboard'}
                {activeTab === 'tasks' && 'My Tasks'}
                {activeTab === 'profile' && 'Profile'}
                {activeTab === 'history' && 'Work History'}
              </h2>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-[73px]">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && <DashboardTab />}
            {activeTab === 'tasks' && <TasksTab />}
            {activeTab === 'profile' && <ProfileTab />}
            {activeTab === 'history' && <HistoryTab />}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

