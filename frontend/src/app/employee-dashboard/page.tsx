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
  Timer,
  LogOut
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
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL as string;
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [isLoadingEmployee, setIsLoadingEmployee] = useState(true);

  // Fetch employee record by userId from token to get the correct employeeId
  useEffect(() => {
    const fetchEmployeeId = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsLoadingEmployee(false);
          return;
        }

        const decoded = decodeToken(token);
        setUser(decoded);
        
        if (!decoded?.sub) {
          console.warn('No userId found in token');
          setIsLoadingEmployee(false);
          return;
        }

        const userId = decoded.sub;
        const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:4000";
        
        // Fetch employee record by userId
        const res = await fetch(`${GATEWAY_URL}/api/employees/by-user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const employee = await res.json();
          if (employee?.employeeId) {
            setEmployeeId(employee.employeeId);
            console.log('Employee ID found:', employee.employeeId);
          } else {
            console.warn('Employee record found but no employeeId field');
            setEmployeeId(null);
          }
        } else if (res.status === 404) {
          // Employee record doesn't exist yet - this is a new employee
          console.log('Employee record not found for userId:', userId);
          setEmployeeId(null);
        } else {
          console.error('Failed to fetch employee:', res.status);
          setEmployeeId(null);
        }
      } catch (error) {
        console.error('Error fetching employee ID:', error);
        setEmployeeId(null);
      } finally {
        setIsLoadingEmployee(false);
      }
    };

    fetchEmployeeId();
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
    if (!isLoadingEmployee && employeeId && GATEWAY_URL) {
      fetchTasks();
    } else if (!isLoadingEmployee && !employeeId) {
      // New employee with no record - show empty state
      setTasks([]);
    }
  }, [employeeId, GATEWAY_URL, isLoadingEmployee]);

  const fetchTasks = async () => {
    // Don't fetch tasks if employeeId is not set (new employee with no record)
    if (!employeeId) {
      setTasks([]);
      return;
    }

    // Don't fetch if GATEWAY_URL is not set
    if (!GATEWAY_URL) {
      console.warn('GATEWAY_URL not set, skipping task fetch');
      return;
    }

    let timeoutId: NodeJS.Timeout | null = null;
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const res = await fetch(`${GATEWAY_URL}/api/tasks/employee/${employeeId}`, { 
        cache: 'no-store',
        signal: controller.signal
      });
      
      if (timeoutId) clearTimeout(timeoutId);
      
      if (res.status === 503) {
        // Service unavailable - don't show error, just log it
        // Tasks will be empty, which is fine
        return;
      }
      
      if (!res.ok) {
        const errorText = await res.text().catch(() => 'Unknown error');
        console.error('Failed to fetch tasks:', res.status, errorText);
        return;
      }
      
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
    } catch (e: any) {
      // Clear timeout if still active
      if (timeoutId) clearTimeout(timeoutId);
      
      // Handle network errors gracefully - don't break polling
      if (e.name === 'AbortError' || e.name === 'TimeoutError') {
        console.warn('Task fetch timeout - service may be slow or unavailable');
      } else if (e.message?.includes('Failed to fetch') || e.message?.includes('NetworkError')) {
        console.warn('Network error fetching tasks - service may be unavailable');
      } else {
        console.error('Failed to fetch tasks from database:', e);
      }
      // Don't clear tasks on error - keep existing tasks visible
      // setTasks([]); // Commented out to preserve existing tasks
    }
  };

  const greeting = getGreeting();

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    if (!employeeId || !GATEWAY_URL) return;
    
    let timeoutId: NodeJS.Timeout | null = null;
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const res = await fetch(`${GATEWAY_URL}/api/notifications/employee/${employeeId}`, {
        cache: 'no-store',
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (timeoutId) clearTimeout(timeoutId);
      
      if (res.status === 503) {
        // Service unavailable - don't show error
        return;
      }
      
      if (res.ok) {
        const data = await res.json();
        // Transform backend notifications to frontend format
        const transformed = (data || []).map((n: any) => ({
          id: n.id,
          type: n.type || 'info',
          title: n.title || 'Notification',
          message: n.message || '',
          timestamp: n.timestamp || n.createdAt || new Date().toISOString(),
          read: n.isRead || false,
          taskId: n.taskId
        }));
        
        // Detect new notifications (not in current state)
        const currentIds = new Set(notifications.map(n => n.id));
        const newNotifications = transformed.filter(n => !currentIds.has(n.id));
        
        // Show toast for new unread notifications
        newNotifications.filter(n => !n.read).forEach(notification => {
          showToast(notification);
        });
        
        setNotifications(transformed);
      }
    } catch (e: any) {
      // Clear timeout if still active
      if (timeoutId) clearTimeout(timeoutId);
      
      // Handle network errors gracefully - don't break polling
      if (e.name === 'AbortError' || e.name === 'TimeoutError') {
        console.warn('Notification fetch timeout - service may be slow or unavailable');
      } else if (e.message?.includes('Failed to fetch') || e.message?.includes('NetworkError')) {
        console.warn('Network error fetching notifications - service may be unavailable');
      } else {
        console.error('Failed to fetch notifications:', e);
      }
      // Don't clear notifications on error - keep existing notifications visible
    }
  };

  // Fetch notifications when employeeId is available
  useEffect(() => {
    if (!isLoadingEmployee && employeeId && GATEWAY_URL) {
      fetchNotifications();
    }
  }, [employeeId, GATEWAY_URL, isLoadingEmployee]);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isNotificationOpen && !target.closest('.notification-dropdown')) {
        setIsNotificationOpen(false);
      }
    };

    if (isNotificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isNotificationOpen]);

  // Poll for new/updated tasks and notifications periodically
  useEffect(() => {
    if (!employeeId || isLoadingEmployee) return;
    
    const pollMs = 20000; // 20s
    const timer = setInterval(() => {
      fetchTasks();
      fetchNotifications();
    }, pollMs);
    return () => clearInterval(timer);
  }, [employeeId, GATEWAY_URL, isLoadingEmployee]);

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
      
      // If task is rejected, remove it from the task list immediately
      if (action === 'reject') {
        setTasks(prev => prev.filter(t => t.id !== taskId));
        sendNotificationToAdmin(taskId, 'rejected', updated);
        // Show toast notification
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white max-w-sm bg-blue-500';
        toast.innerHTML = `
          <div class="flex items-center">
            <div class="flex-1">
              <p class="font-semibold">Task Rejected</p>
              <p class="text-sm opacity-90">Task has been rejected and removed from your list. Admin will be notified for reassignment.</p>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-white hover:text-gray-200">
              ×
            </button>
          </div>
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
          if (toast.parentElement) {
            toast.remove();
          }
        }, 5000);
      } else {
        // For other actions, update the task
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

        if (action === 'complete') sendNotificationToAdmin(taskId, 'completed', updated);
        if (action === 'deliver') sendNotificationToAdmin(taskId, 'delivered', updated);
      }
    } catch (e) {
      // Optimistic fallback - for reject, still remove from list
      if (action === 'reject') {
        setTasks(prev => prev.filter(task => task.id !== taskId));
      } else {
        setTasks(prev => prev.map(task => task.id === taskId ? { ...task, status: action === 'start' ? 'in-progress' : action === 'accept' ? 'accepted' : action === 'complete' ? 'completed' : action === 'deliver' ? 'delivered' : task.status } : task));
      }
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
      employeeId: employeeId || user?.sub || '',
      employeeName: user?.username || ''
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

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      if (!GATEWAY_URL) return;
      
      const res = await fetch(`${GATEWAY_URL}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (res.ok) {
        // Update local state
        setNotifications(prev => prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        ));
      }
    } catch (e) {
      console.error('Failed to mark notification as read:', e);
      // Optimistic update
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
    }
  };

  const markAllNotificationsAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    for (const notification of unreadNotifications) {
      await markNotificationAsRead(notification.id);
    }
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const Sidebar = () => (
    <div className="w-64 bg-gray-800 shadow-lg rounded-l-2xl p-6 fixed left-0 top-0 h-screen overflow-y-auto flex flex-col">
      <div className="flex items-center mb-8">
        <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
          {user?.username?.charAt(0) || 'E'}
        </div>
        <div className="ml-3">
          <h3 className="font-semibold text-white">{user?.username || 'Employee'}</h3>
          <p className="text-sm text-gray-300">{user?.email}</p>
        </div>
      </div>

      <nav className="space-y-2 flex-1">
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
                ? 'bg-gray-700 text-white' 
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
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

      <div className="pt-4 border-t border-gray-700 mt-auto">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-3 rounded-lg transition-colors text-gray-300 hover:bg-gray-700 hover:text-white"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
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
        <div className="bg-gray-700 rounded-xl p-6 shadow-lg border border-gray-600">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Wrench className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Active Tasks</p>
              <p className="text-2xl font-bold text-white">
                {tasks.filter(t => t.status === 'in-progress').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-700 rounded-xl p-6 shadow-lg border border-gray-600">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Completed Today</p>
              <p className="text-2xl font-bold text-white">
                {tasks.filter(t => t.status === 'completed' || t.status === 'delivered').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-700 rounded-xl p-6 shadow-lg border border-gray-600">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Timer className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Hours Worked</p>
              <p className="text-2xl font-bold text-white">
                {currentTimeLog ? formatDuration(currentTimeLog.startTime).split('h')[0] : '0'}h
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Task */}
      {currentTimeLog && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 mb-6 relative z-10">
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
                    className="px-3 py-1 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors text-sm"
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
      <div className="bg-gray-700 rounded-xl p-6 shadow-lg border border-gray-600 mb-6 relative z-10">
        <h3 className="text-lg font-semibold text-white mb-4">Workflow Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-yellow-600 font-bold">
                {tasks.filter(t => t.status === 'assigned').length}
              </span>
            </div>
            <p className="text-sm text-gray-300">Assigned</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-600 font-bold">
                {tasks.filter(t => t.status === 'accepted').length}
              </span>
            </div>
            <p className="text-sm text-gray-300">Accepted</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-orange-600 font-bold">
                {tasks.filter(t => t.status === 'in-progress').length}
              </span>
            </div>
            <p className="text-sm text-gray-300">In Progress</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-green-600 font-bold">
                {tasks.filter(t => t.status === 'completed' || t.status === 'delivered').length}
              </span>
            </div>
            <p className="text-sm text-gray-300">Completed</p>
          </div>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="bg-gray-700 rounded-xl p-6 shadow-lg border border-gray-600 relative z-10">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Tasks</h3>
        <div className="space-y-3">
          {tasks.slice(0, 3).map((task) => (
            <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-600 border border-gray-500">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: 
                      task.status === 'in-progress' ? '#f97316' :
                      task.status === 'completed' ? '#16a34a' :
                      task.status === 'delivered' ? '#a855f7' : '#9ca3af'
                  }}
                ></div>
                <div>
                  <p className="font-medium text-white">{task.customerName}</p>
                  <p className="text-sm text-gray-300">{task.description}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
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
        <h1 className="text-3xl font-bold text-white mb-2">My Tasks</h1>
        <p className="text-gray-300">Manage your assigned tasks and track progress</p>
      </div>

      <div className="space-y-4 relative z-10">
        {isLoadingEmployee ? (
          <div className="bg-gray-700 rounded-xl p-8 shadow-lg border border-gray-600 text-center">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-600 rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-600 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-gray-700 rounded-xl p-8 shadow-lg border border-gray-600 text-center">
            <Wrench className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Tasks Assigned</h3>
            <p className="text-gray-300">
              {employeeId 
                ? "You don't have any tasks assigned yet. Tasks will appear here when an admin assigns them to you."
                : "Your employee profile is being set up. Once your profile is created and tasks are assigned, they will appear here."}
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-700 rounded-xl p-6 shadow-lg border border-gray-600"
            >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-white">{task.customerName}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                    {task.status.replace('-', ' ')}
                  </span>
                </div>
                <p className="text-gray-300 mb-2">{task.vehicleInfo}</p>
                <p className="text-white mb-2">{task.description}</p>
                {task.instructions && (
                  <p className="text-sm text-blue-300 bg-gray-600 p-2 rounded-lg border border-gray-500">
                    <strong className="text-white">Instructions:</strong> <span className="text-gray-300">{task.instructions}</span>
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-300">Est. {task.estimatedHours}h</p>
                <p className="text-sm text-gray-300">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {task.serviceType === 'service' ? (
                  <Car className="w-4 h-4 text-blue-400" />
                ) : (
                  <Wrench className="w-4 h-4 text-orange-400" />
                )}
                <span className="text-sm text-gray-300 capitalize">{task.serviceType}</span>
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
                      className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors flex items-center"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </button>
                  </>
                )}

                {task.status === 'accepted' && (
                  <button
                    onClick={() => startTimeTracking(task.id)}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors flex items-center"
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
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Finish & Complete
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => resumeTimeTracking(task.id)}
                            className="px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors flex items-center"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Resume Timer
                          </button>
                          <button
                            onClick={() => {
                              stopTimeTracking();
                              handleTaskAction(task.id, 'complete');
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
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
                          className="px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors flex items-center"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Resume Timer
                        </button>
                        <button
                          onClick={() => {
                            stopTimeTracking();
                            handleTaskAction(task.id, 'complete');
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
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
          ))
        )}
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
            <p className="text-sm text-gray-500">Employee ID: {employeeId || 'Not assigned yet'}</p>
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
          <button className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors">
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
    <div className="min-h-screen bg-yellow-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64">
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 fixed top-0 right-0 left-64 z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <button className="px-3 py-2 text-sm rounded-lg bg-gray-800 text-white hover:bg-gray-900 transition">
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
              <div className="relative notification-dropdown">
                <button 
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>
                
                {isNotificationOpen && (
                  <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 notification-dropdown">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-800">Notifications</h3>
                        <div className="flex items-center space-x-2">
                          {notifications.filter(n => !n.read).length > 0 && (
                            <button
                              onClick={markAllNotificationsAsRead}
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              Mark all read
                            </button>
                          )}
                          <button
                            onClick={() => setIsNotificationOpen(false)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                          <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <p>No notifications</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-200">
                          {notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-4 border-l-4 ${
                                notification.type === 'success' ? 'border-l-green-500 bg-green-50' :
                                notification.type === 'warning' ? 'border-l-yellow-500 bg-yellow-50' :
                                notification.type === 'error' ? 'border-l-red-500 bg-red-50' :
                                'border-l-blue-500 bg-blue-50'
                              } ${
                                !notification.read ? 'bg-white' : 'bg-gray-50'
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                {notification.type === 'success' ? (
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : notification.type === 'warning' ? (
                                  <XCircle className="w-5 h-5 text-yellow-600" />
                                ) : notification.type === 'error' ? (
                                  <XCircle className="w-5 h-5 text-red-600" />
                                ) : (
                                  <Bell className="w-5 h-5 text-blue-600" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p className={`text-sm font-medium ${
                                      !notification.read ? 'text-gray-900' : 'text-gray-700'
                                    }`}>
                                      {notification.title}
                                    </p>
                                    {!notification.read && (
                                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {notification.message}
                                  </p>
                                  <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-gray-500 flex items-center">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {new Date(notification.timestamp).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                                {!notification.read && (
                                  <button
                                    onClick={() => markNotificationAsRead(notification.id)}
                                    className="p-1 hover:bg-gray-200 rounded"
                                  >
                                    <XCircle className="w-3 h-3 text-gray-400" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
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

