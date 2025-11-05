"use client";

import { useEffect, useState, useCallback } from "react";
import { getGreeting } from "../../utils/greeting";
import { decodeToken, TokenPayload } from "../../utils/jwt";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  BarChart3, 
  UserCircle, 
  FileText,
  LogOut,
  Menu,
  X,
  CheckCircle2,
  Clock,
  Plus,
  Send,
  Edit,
  Settings,
  Search,
  Filter,
  TrendingUp,
  DollarSign,
  Bell,
  Trash2,
  Eye,
  Download,
  AlertCircle,
  UserPlus
} from "lucide-react";

type Appointment = {
  id: string;
  customerName: string;
  vehicle: string;
  serviceType: "Service" | "Modification";
  date: string;
  time: string;
  status: "Pending" | "Approved" | "In Progress" | "Completed" | "Delivered";
  assignedEmployee?: string;
  modifications?: string[];
  customerEmail?: string;
  estimatedCost?: number;
};

type Employee = {
  id: string;
  name: string;
  email: string;
  skillSet: string[];
  availability: "Available" | "Busy" | "On Leave";
  currentProjects: number;
  completedProjects: number;
  averageCompletionTime: string;
  phone?: string;
  joinDate?: string;
};

type EmployeeLog = {
  id: string;
  employeeName: string;
  projectName: string;
  date: string;
  hoursWorked: string;
  status: string;
  startTime?: string;
  endTime?: string;
};

type Analytics = {
  totalBookings: number;
  pendingApprovals: number;
  inProgress: number;
  completedToday: number;
  averageServiceTime: string;
  averageModificationTime: string;
  totalRevenue: number;
  thisMonthRevenue?: number;
  lastMonthRevenue?: number;
};

type Toast = {
  id: string;
  message: string;
  type: "success" | "error" | "info";
};

const AVAILABLE_SKILLS = ["Engine", "Electronics", "Bodywork", "Interior", "Painting", "Detailing", "Transmission", "Performance", "Audio", "Exhaust"];

export default function AdminDashboard() {
  const [user, setUser] = useState<TokenPayload | null>(null);
  const [activeView, setActiveView] = useState<"dashboard" | "appointments" | "employees" | "analytics" | "profile" | "employee-logs">("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showEditEmployeeModal, setShowEditEmployeeModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [timeSlotData, setTimeSlotData] = useState({ date: "", time: "", action: "block" });
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Search and filter states
  const [appointmentSearch, setAppointmentSearch] = useState("");
  const [appointmentFilter, setAppointmentFilter] = useState<string>("all");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");
  const [logSearch, setLogSearch] = useState("");
  const [profileForm, setProfileForm] = useState({
    username: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  // Enhanced mock data
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: "1",
      customerName: "John Doe",
      vehicle: "Toyota Camry 2020",
      serviceType: "Service",
      date: "2024-01-15",
      time: "10:00 AM",
      status: "Pending",
      customerEmail: "john@example.com",
      estimatedCost: 250
    },
    {
      id: "2",
      customerName: "Jane Smith",
      vehicle: "Honda Civic 2019",
      serviceType: "Modification",
      date: "2024-01-16",
      time: "2:00 PM",
      status: "Approved",
      assignedEmployee: "Mike Johnson",
      modifications: ["Engine Tune-up", "Exhaust Upgrade"],
      customerEmail: "jane@example.com",
      estimatedCost: 1200
    },
    {
      id: "3",
      customerName: "Robert Brown",
      vehicle: "Ford F-150 2021",
      serviceType: "Service",
      date: "2024-01-14",
      time: "9:00 AM",
      status: "In Progress",
      assignedEmployee: "Sarah Williams",
      customerEmail: "robert@example.com",
      estimatedCost: 350
    },
    {
      id: "4",
      customerName: "Emily Davis",
      vehicle: "BMW 3 Series 2022",
      serviceType: "Modification",
      date: "2024-01-13",
      time: "11:00 AM",
      status: "Completed",
      assignedEmployee: "Mike Johnson",
      modifications: ["Repainting", "Interior Upgrade"],
      customerEmail: "emily@example.com",
      estimatedCost: 2800
    },
    {
      id: "5",
      customerName: "Michael Chen",
      vehicle: "Tesla Model 3 2023",
      serviceType: "Service",
      date: "2024-01-17",
      time: "3:00 PM",
      status: "Pending",
      customerEmail: "michael@example.com",
      estimatedCost: 300
    }
  ]);

  const [employees, setEmployees] = useState<Employee[]>([]);

  const [employeeLogs, setEmployeeLogs] = useState<EmployeeLog[]>([
    {
      id: "1",
      employeeName: "Mike Johnson",
      projectName: "Toyota Camry Service",
      date: "2024-01-14",
      hoursWorked: "4.5",
      status: "Completed",
      startTime: "09:00",
      endTime: "13:30"
    },
    {
      id: "2",
      employeeName: "Sarah Williams",
      projectName: "Honda Civic Modification",
      date: "2024-01-13",
      hoursWorked: "6.2",
      status: "Completed",
      startTime: "08:00",
      endTime: "14:12"
    },
    {
      id: "3",
      employeeName: "David Lee",
      projectName: "Ford F-150 Service",
      date: "2024-01-12",
      hoursWorked: "3.8",
      status: "Completed",
      startTime: "10:00",
      endTime: "13:48"
    },
    {
      id: "4",
      employeeName: "Mike Johnson",
      projectName: "BMW 3 Series Modification",
      date: "2024-01-11",
      hoursWorked: "7.5",
      status: "Completed",
      startTime: "08:30",
      endTime: "16:00"
    }
  ]);

  const [analytics, setAnalytics] = useState<Analytics>({
    totalBookings: 156,
    pendingApprovals: 2,
    inProgress: 3,
    completedToday: 1,
    averageServiceTime: "3.5 hours",
    averageModificationTime: "6.2 hours",
    totalRevenue: 125000,
    thisMonthRevenue: 18500,
    lastMonthRevenue: 15200
  });

  const [employeeForm, setEmployeeForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    skillSet: [] as string[],
    isEdit: false
  });

  const loadEmployees = async () => {
    try {
      const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:4000";
      
      console.log("Loading employees from:", `${GATEWAY_URL}/api/auth/employees`);
      console.log("Loading employee details from:", `${GATEWAY_URL}/api/auth/employee-details`);
      
      // Fetch both employees and their details
      let employeesResponse: Response;
      let detailsResponse: Response | null = null;
      
      try {
        employeesResponse = await fetch(`${GATEWAY_URL}/api/auth/employees`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
      } catch (err: any) {
        console.error("Network error fetching employees:", err);
        throw new Error(`Failed to connect to gateway: ${err.message}`);
      }
      try {
        detailsResponse = await fetch(`${GATEWAY_URL}/api/auth/employee-details`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
      } catch (err: any) {
        console.error("Network error fetching employee details:", err);
        // Will handle empty details data below
      }
      
      console.log("Employees response status:", employeesResponse.status);
      if (detailsResponse) {
        console.log("Employee details response status:", detailsResponse.status);
      } else {
        console.log("Employee details response: failed to fetch");
      }
      
      if (employeesResponse.ok) {
        const employeesData = await employeesResponse.json();
        console.log("Employees data received:", employeesData);
        
        let detailsData = [];
        if (detailsResponse && detailsResponse.ok) {
          detailsData = await detailsResponse.json();
          console.log("Employee details data received:", detailsData);
        } else {
          if (detailsResponse && !detailsResponse.ok) {
            const errorData = await detailsResponse.json().catch(() => ({}));
            console.warn("Employee details fetch failed:", errorData);
          }
          console.warn("Employee details not available");
          showToast("Warning: Could not load employee details. Employees will be shown with basic information only.", "info");
        }
        
        // Create a map of userId -> employee details for quick lookup
        const detailsMap = new Map();
        if (Array.isArray(detailsData)) {
          detailsData.forEach((detail: any) => {
            if (detail && detail.userId) {
              detailsMap.set(detail.userId, detail);
            }
          });
        }
        
        // Convert User data to Employee format, merging with employee details
        const employeeData: Employee[] = Array.isArray(employeesData) 
          ? employeesData.map((user: any, index: number) => {
              const details = detailsMap.get(user.id || user._id);
              return {
                id: user.id || user._id || String(index + 1),
                name: details?.fullName || user.username || "Unknown",
                email: user.email || "",
                skillSet: details?.skills || (Array.isArray(details?.skills) ? details.skills : []),
                availability: "Available" as const,
                currentProjects: 0,
                completedProjects: 0,
                averageCompletionTime: "0 hours",
                phone: details?.phoneNumber || undefined,
                joinDate: undefined
              };
            })
          : [];
        
        console.log("Processed employee data:", employeeData);
        setEmployees(employeeData);
        
        if (employeeData.length === 0) {
          showToast("No employees found in database. Please add employees first.", "info");
        } else {
          showToast(`Loaded ${employeeData.length} employee(s) successfully`, "success");
        }
      } else {
        let errorData: any = { message: "Unknown error" };
        try {
          const responseText = await employeesResponse.text();
          console.error("Failed to load employees - Response status:", employeesResponse.status);
          console.error("Failed to load employees - Response text:", responseText);
          
          if (responseText) {
            try {
              errorData = JSON.parse(responseText);
            } catch (e) {
              errorData = { message: responseText || `HTTP ${employeesResponse.status} error` };
            }
          } else {
            errorData = { message: `HTTP ${employeesResponse.status} - No response body` };
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
          errorData = { message: `HTTP ${employeesResponse.status} error - Could not parse response` };
        }
        
        console.error("Failed to load employees - Full error data:", errorData);
        showToast(`Failed to load employees: ${errorData.message || "Server error. Check if MongoDB is connected and MONGO_URI is set."}`, "error");
        setEmployees([]);
      }
    } catch (error: any) {
      console.error("Error loading employees:", error);
      showToast(`Error loading employees: ${error.message || "Network error. Please check if the gateway and backend services are running."}`, "error");
      setEmployees([]);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = decodeToken(token);
      setUser(decoded);
      setProfileForm({
        username: decoded?.username || "",
        email: decoded?.email || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    }
    
    // Load employees from database
    loadEmployees();
  }, []);

  const greeting = getGreeting();

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = Date.now().toString();
    setToasts([...toasts, { id, message, type }]);
    setTimeout(() => {
      setToasts(toasts.filter(t => t.id !== id));
    }, 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const approveAppointment = (id: string) => {
    setAppointments(appointments.map(apt => 
      apt.id === id ? { ...apt, status: "Approved" as const } : apt
    ));
    setAnalytics({ ...analytics, pendingApprovals: Math.max(0, analytics.pendingApprovals - 1) });
    showToast("Appointment approved successfully!");
  };

  const rejectAppointment = (id: string) => {
    setAppointments(appointments.filter(apt => apt.id !== id));
    setAnalytics({ ...analytics, pendingApprovals: Math.max(0, analytics.pendingApprovals - 1) });
    showToast("Appointment rejected", "info");
  };

  const assignEmployee = (appointmentId: string, employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    setAppointments(appointments.map(apt => 
      apt.id === appointmentId 
        ? { ...apt, status: "Approved" as const, assignedEmployee: employee?.name }
        : apt
    ));
    if (employee) {
      setEmployees(employees.map(emp =>
        emp.id === employeeId ? { ...emp, currentProjects: emp.currentProjects + 1, availability: "Busy" as const } : emp
      ));
    }
    setShowAssignModal(false);
    setAnalytics({ ...analytics, pendingApprovals: Math.max(0, analytics.pendingApprovals - 1) });
    showToast(`Employee ${employee?.name} assigned successfully!`);
  };

  const toggleSkill = (skill: string) => {
    if (employeeForm.skillSet.includes(skill)) {
      setEmployeeForm({
        ...employeeForm,
        skillSet: employeeForm.skillSet.filter(s => s !== skill)
      });
    } else {
      setEmployeeForm({
        ...employeeForm,
        skillSet: [...employeeForm.skillSet, skill]
      });
    }
  };

  const openEditEmployee = (emp: Employee) => {
    setSelectedEmployee(emp);
    setEmployeeForm({
      name: emp.name,
      email: emp.email,
      password: "",
      phone: emp.phone || "",
      skillSet: emp.skillSet,
      isEdit: true
    });
    setShowEditEmployeeModal(true);
  };

  const addEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (employeeForm.skillSet.length === 0) {
      showToast("Please select at least one skill", "error");
      return;
    }
    
    if (employeeForm.isEdit && selectedEmployee) {
      // Update employee in database
      try {
        const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:4000";
        
        console.log("Updating employee with ID:", selectedEmployee.id);
        
        // Update both User and EmployeeDetail in parallel
        const [userResponse, detailsResponse] = await Promise.all([
          fetch(`${GATEWAY_URL}/api/auth/employees/${selectedEmployee.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: employeeForm.name,
              email: employeeForm.email,
            }),
          }),
          fetch(`${GATEWAY_URL}/api/auth/employee-details/${selectedEmployee.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: selectedEmployee.id,
              fullName: employeeForm.name,
              email: employeeForm.email,
              phoneNumber: employeeForm.phone || "",
              skills: employeeForm.skillSet,
            }),
          })
        ]);

        if (!userResponse.ok) {
          const errorData = await userResponse.json().catch(() => ({ message: "Failed to update employee" }));
          throw new Error(errorData.message || "Failed to update employee");
        }

        // Details update is optional (might not exist)
        if (!detailsResponse.ok) {
          console.warn("Employee user updated but details update failed or doesn't exist");
          // Try to create details if they don't exist
          try {
            await fetch(`${GATEWAY_URL}/api/auth/employee-details`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userId: selectedEmployee.id,
                fullName: employeeForm.name,
                email: employeeForm.email,
                phoneNumber: employeeForm.phone || "",
                skills: employeeForm.skillSet,
              }),
            });
          } catch (createError) {
            console.warn("Could not create employee details:", createError);
          }
        }

        showToast("Employee updated successfully in database!");
        
        // Reload employees to get updated data
        loadEmployees();
        
        setEmployeeForm({ name: "", email: "", password: "", phone: "", skillSet: [], isEdit: false });
        setShowEditEmployeeModal(false);
        setSelectedEmployee(null);
      } catch (error: any) {
        console.error("Error updating employee:", error);
        showToast(error.message || "Failed to update employee. Please try again.", "error");
      }
    } else {
      // Register new employee - Save to database
      try {
        const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:4000";
        
        const response = await fetch(`${GATEWAY_URL}/api/auth/register-employee`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: employeeForm.name,
            email: employeeForm.email,
            password: employeeForm.password,
          }),
        });

        const data = await response.json();
        
        console.log("Register employee response:", data);
        console.log("Employee ID:", data.id);

        if (!response.ok) {
          throw new Error(data.message || "Failed to register employee");
        }

        // Step 2: Save employee details to EAD-Employes database (if user was created successfully and has an ID)
        if (data.id) {
          console.log("Saving employee details to EAD-Employes database...");
          console.log("Employee details payload:", {
            userId: data.id,
            fullName: employeeForm.name,
            email: employeeForm.email,
            phoneNumber: employeeForm.phone || "",
            skills: employeeForm.skillSet,
          });
          try {
            const detailsResponse = await fetch(`${GATEWAY_URL}/api/auth/employee-details`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userId: data.id,
                fullName: employeeForm.name,
                email: employeeForm.email,
                phoneNumber: employeeForm.phone || "",
                skills: employeeForm.skillSet,
              }),
            });

            const detailsData = await detailsResponse.json();
            
            console.log("Employee details save response:", detailsData);
            
            if (!detailsResponse.ok) {
              console.error("Failed to save employee details:", detailsData);
              showToast("Employee registered but details could not be saved: " + (detailsData.message || "Unknown error"), "error");
            } else {
              console.log("✓ Employee details saved successfully to EAD-Employes database");
              showToast("Employee registered successfully with all details saved!");
            }
          } catch (detailsError: any) {
            console.error("Error saving employee details:", detailsError);
            showToast("Employee registered but some details could not be saved: " + detailsError.message, "error");
          }
        } else {
          console.warn("Employee registered but no ID returned, cannot save employee details");
          console.warn("Response data:", data);
          showToast("Employee registered successfully, but employee details could not be saved (no ID returned)");
        }
        
        // Reset form
        setEmployeeForm({ name: "", email: "", password: "", phone: "", skillSet: [], isEdit: false });
        setShowEditEmployeeModal(false);
        setSelectedEmployee(null);
        
        // Reload employees from database to get the new one
        loadEmployees();
      } catch (error: any) {
        console.error("Error registering employee:", error);
        showToast(error.message || "Failed to register employee. Please try again.", "error");
      }
    }
  };

  const deleteEmployee = async (id: string) => {
    if (!confirm("Are you sure you want to delete this employee? This action cannot be undone.")) {
      return;
    }

    try {
      const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:4000";
      
      console.log("Deleting employee with ID:", id);
      
      // Delete employee from User database (this also deletes employee details)
      const userResponse = await fetch(`${GATEWAY_URL}/api/auth/employees/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      console.log("Delete response status:", userResponse.status);

      if (userResponse.ok) {
        const responseData = await userResponse.json().catch(() => null);
        console.log("Delete successful:", responseData);
        
        setEmployees(employees.filter(emp => emp.id !== id));
        showToast("Employee deleted successfully from database!");
      } else {
        // Try to parse error message
        let errorMessage = "Failed to delete employee";
        try {
          const errorData = await userResponse.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          console.error("Delete failed with response:", errorData);
        } catch (parseError) {
          // If response is not JSON, check status
          if (userResponse.status === 404) {
            errorMessage = "Employee not found";
          } else if (userResponse.status === 500) {
            errorMessage = "Server error while deleting employee";
          } else {
            errorMessage = `Failed to delete employee (Status: ${userResponse.status})`;
          }
          console.error("Delete failed - Status:", userResponse.status);
        }
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error("Error deleting employee:", error);
      showToast(error.message || "Failed to delete employee. Please try again.", "error");
    }
  };

  const sendNotification = () => {
    if (!notificationMessage.trim()) {
      showToast("Please enter a notification message", "error");
      return;
    }
    showToast("Notification sent successfully!");
    setShowNotificationModal(false);
    setNotificationMessage("");
  };

  const adjustTimeSlot = () => {
    if (!timeSlotData.date || !timeSlotData.time) {
      showToast("Please fill in all fields", "error");
      return;
    }
    showToast(`Time slot ${timeSlotData.action}ed successfully!`);
    setShowTimeSlotModal(false);
    setTimeSlotData({ date: "", time: "", action: "block" });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Approved": return "bg-blue-100 text-blue-800 border-blue-200";
      case "In Progress": return "bg-purple-100 text-purple-800 border-purple-200";
      case "Completed": return "bg-green-100 text-green-800 border-green-200";
      case "Delivered": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "Available": return "bg-green-100 text-green-800 border-green-200";
      case "Busy": return "bg-red-100 text-red-800 border-red-200";
      case "On Leave": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.customerName.toLowerCase().includes(appointmentSearch.toLowerCase()) ||
                         apt.vehicle.toLowerCase().includes(appointmentSearch.toLowerCase());
    const matchesFilter = appointmentFilter === "all" || apt.status === appointmentFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
                         emp.email.toLowerCase().includes(employeeSearch.toLowerCase());
    const matchesFilter = employeeFilter === "all" || emp.availability === employeeFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredLogs = employeeLogs.filter(log => 
    log.employeeName.toLowerCase().includes(logSearch.toLowerCase()) ||
    log.projectName.toLowerCase().includes(logSearch.toLowerCase())
  );

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "appointments", label: "Appointments", icon: Calendar },
    { id: "employees", label: "Employees", icon: Users },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "employee-logs", label: "Employee Logs", icon: FileText },
    { id: "profile", label: "Profile", icon: UserCircle },
  ];

  // Dashboard View
  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <button
          onClick={() => setShowTimeSlotModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-md transition-all"
        >
          <Settings className="w-4 h-4" />
          Adjust Time Slots
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Bookings</p>
              <p className="text-3xl font-bold mt-2 text-blue-700">{analytics.totalBookings}</p>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </div>
            <div className="bg-blue-600 p-3 rounded-lg">
              <Calendar className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl shadow-lg border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pending Approvals</p>
              <p className="text-3xl font-bold mt-2 text-yellow-700">{analytics.pendingApprovals}</p>
              <p className="text-xs text-gray-500 mt-1">Requires action</p>
            </div>
            <div className="bg-yellow-600 p-3 rounded-lg">
              <Clock className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">In Progress</p>
              <p className="text-3xl font-bold mt-2 text-purple-700">{analytics.inProgress}</p>
              <p className="text-xs text-gray-500 mt-1">Active projects</p>
            </div>
            <div className="bg-purple-600 p-3 rounded-lg">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Completed Today</p>
              <p className="text-3xl font-bold mt-2 text-green-700">{analytics.completedToday}</p>
              <p className="text-xs text-gray-500 mt-1">Finished projects</p>
            </div>
            <div className="bg-green-600 p-3 rounded-lg">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Appointments</h2>
            <button
              onClick={() => setActiveView("appointments")}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All →
            </button>
          </div>
          <div className="space-y-3">
            {appointments.slice(0, 4).map((apt) => (
              <div key={apt.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-gray-900">{apt.customerName}</p>
                    <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(apt.status)}`}>
                      {apt.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{apt.vehicle} • {apt.serviceType}</p>
                  <p className="text-xs text-gray-500 mt-1">{apt.date} at {apt.time}</p>
                </div>
                {apt.estimatedCost && (
                  <div className="text-right">
                    <p className="font-semibold text-green-600">${apt.estimatedCost}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Employee Status</h2>
            <button
              onClick={() => setActiveView("employees")}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All →
            </button>
          </div>
          <div className="space-y-3">
            {employees.map((emp) => (
              <div key={emp.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{emp.name}</p>
                  <p className="text-sm text-gray-600">{emp.currentProjects} active • {emp.completedProjects} completed</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs border ${getAvailabilityColor(emp.availability)}`}>
                  {emp.availability}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Card */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-xl shadow-lg text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm font-medium">Total Revenue</p>
            <p className="text-4xl font-bold mt-2">${analytics.totalRevenue.toLocaleString()}</p>
            {analytics.thisMonthRevenue && analytics.lastMonthRevenue && (
              <div className="flex items-center gap-2 mt-3">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">
                  ${((analytics.thisMonthRevenue / analytics.lastMonthRevenue - 1) * 100).toFixed(1)}% vs last month
                </span>
              </div>
            )}
          </div>
          <DollarSign className="w-16 h-16 text-green-200 opacity-50" />
        </div>
      </div>
    </div>
  );

  // Appointments View
  const renderAppointments = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500 mt-1">Manage and track all customer appointments</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowNotificationModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 shadow-md transition-all"
          >
            <Send className="w-4 h-4" />
            Send Notification
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-xl shadow border flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search appointments..."
            value={appointmentSearch}
            onChange={(e) => setAppointmentSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={appointmentFilter}
          onChange={(e) => setAppointmentFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Delivered">Delivered</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Vehicle</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date/Time</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Assigned</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Cost</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    No appointments found
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="font-medium text-gray-900">{apt.customerName}</p>
                        {apt.customerEmail && (
                          <p className="text-sm text-gray-500">{apt.customerEmail}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">{apt.vehicle}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        apt.serviceType === "Service" 
                          ? "bg-blue-100 text-blue-800" 
                          : "bg-purple-100 text-purple-800"
                      }`}>
                        {apt.serviceType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{apt.date}</div>
                      <div className="text-sm text-gray-500">{apt.time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">{apt.assignedEmployee || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {apt.estimatedCost ? (
                        <span className="font-semibold text-green-600">${apt.estimatedCost}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {apt.status === "Pending" && (
                          <>
                            <button
                              onClick={() => approveAppointment(apt.id)}
                              className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                              title="Approve"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedAppointment(apt);
                                setShowAssignModal(true);
                              }}
                              className="text-green-600 hover:text-green-800 p-1 hover:bg-green-50 rounded"
                              title="Assign"
                            >
                              <UserPlus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => rejectAppointment(apt.id)}
                              className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          className="text-gray-600 hover:text-gray-800 p-1 hover:bg-gray-50 rounded"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Employees View
  const renderEmployees = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-gray-500 mt-1">Manage employee profiles and assignments</p>
        </div>
        <button
          onClick={() => {
            setEmployeeForm({ name: "", email: "", password: "", phone: "", skillSet: [], isEdit: false });
            setSelectedEmployee(null);
            setShowEditEmployeeModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-xl shadow border flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search employees..."
            value={employeeSearch}
            onChange={(e) => setEmployeeSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={employeeFilter}
          onChange={(e) => setEmployeeFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Availability</option>
          <option value="Available">Available</option>
          <option value="Busy">Busy</option>
          <option value="On Leave">On Leave</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Skills</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Availability</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Projects</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Avg Time</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No employees found
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="font-semibold text-gray-900">{emp.name}</p>
                        {emp.joinDate && (
                          <p className="text-xs text-gray-500">Joined {emp.joinDate}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{emp.email}</div>
                      {emp.phone && (
                        <div className="text-sm text-gray-500">{emp.phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {emp.skillSet.map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getAvailabilityColor(emp.availability)}`}>
                        {emp.availability}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <span className="font-medium text-gray-900">{emp.currentProjects}</span>
                        <span className="text-gray-500"> / {emp.completedProjects}</span>
                      </div>
                      <div className="text-xs text-gray-500">active / completed</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">{emp.averageCompletionTime}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditEmployee(emp)}
                          className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteEmployee(emp.id)}
                          className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Analytics View
  const renderAnalytics = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Analytics</h1>
        <p className="text-gray-500 mt-1">Comprehensive insights and performance metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Booking Statistics</h3>
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Total Bookings:</span>
              <span className="font-bold text-blue-600 text-lg">{analytics.totalBookings}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <span className="text-gray-700">Pending:</span>
              <span className="font-bold text-yellow-600 text-lg">{analytics.pendingApprovals}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-gray-700">In Progress:</span>
              <span className="font-bold text-purple-600 text-lg">{analytics.inProgress}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-gray-700">Completed Today:</span>
              <span className="font-bold text-green-600 text-lg">{analytics.completedToday}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Completion Times</h3>
            <Clock className="w-6 h-6 text-purple-600" />
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Avg Service Time</span>
                <span className="font-bold text-blue-700">{analytics.averageServiceTime}</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: "70%" }}></div>
              </div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Avg Modification Time</span>
                <span className="font-bold text-purple-700">{analytics.averageModificationTime}</span>
              </div>
              <div className="w-full bg-purple-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: "85%" }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Revenue</h3>
            <DollarSign className="w-6 h-6" />
          </div>
          <div className="mt-4">
            <div className="text-4xl font-bold mb-2">${analytics.totalRevenue.toLocaleString()}</div>
            <p className="text-green-100 text-sm">Total Revenue</p>
            {analytics.thisMonthRevenue && (
              <div className="mt-4 pt-4 border-t border-green-400">
                <p className="text-sm text-green-100">This Month</p>
                <p className="text-2xl font-bold">${analytics.thisMonthRevenue.toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {employees.map((emp) => (
              <div key={emp.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{emp.name}</p>
                    <p className="text-sm text-gray-500">{emp.email}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs border ${getAvailabilityColor(emp.availability)}`}>
                    {emp.availability}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <p className="text-2xl font-bold text-blue-600">{emp.completedProjects}</p>
                    <p className="text-xs text-gray-600">Completed</p>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded">
                    <p className="text-2xl font-bold text-purple-600">{emp.currentProjects}</p>
                    <p className="text-xs text-gray-600">Active</p>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <p className="text-lg font-bold text-green-600">{emp.averageCompletionTime}</p>
                    <p className="text-xs text-gray-600">Avg Time</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  
  // Employee Logs View
  const renderEmployeeLogs = () => {
    const totalHours = employeeLogs.reduce((sum, log) => sum + parseFloat(log.hoursWorked), 0);
    const avgHours = totalHours / employeeLogs.length || 0;
    const uniqueEmployees = new Set(employeeLogs.map(log => log.employeeName)).size;
    
    // Group logs by employee for stats
    const employeeStats = employees.map(emp => {
      const empLogs = employeeLogs.filter(log => log.employeeName === emp.name);
      const empHours = empLogs.reduce((sum, log) => sum + parseFloat(log.hoursWorked), 0);
      return {
        name: emp.name,
        totalHours: empHours,
        projectCount: empLogs.length
      };
    }).sort((a, b) => b.totalHours - a.totalHours);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employee Logs</h1>
            <p className="text-gray-500 mt-1">Track employee work hours and project logs</p>
          </div>
          <button
            onClick={() => {
              const csv = [
                ["Employee", "Project", "Date", "Hours Worked", "Start Time", "End Time", "Status"],
                ...filteredLogs.map(log => [
                  log.employeeName,
                  log.projectName,
                  log.date,
                  log.hoursWorked,
                  log.startTime || "-",
                  log.endTime || "-",
                  log.status
                ])
              ].map(row => row.join(",")).join("\n");
              
              const blob = new Blob([csv], { type: "text/csv" });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `employee-logs-${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
              showToast("Logs exported successfully!");
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md transition-all"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl shadow-md border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Hours</p>
                <p className="text-2xl font-bold text-blue-700 mt-1">{totalHours.toFixed(1)}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl shadow-md border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Average Hours</p>
                <p className="text-2xl font-bold text-purple-700 mt-1">{avgHours.toFixed(1)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl shadow-md border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Logs</p>
                <p className="text-2xl font-bold text-green-700 mt-1">{employeeLogs.length}</p>
              </div>
              <FileText className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-xl shadow-md border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Active Employees</p>
                <p className="text-2xl font-bold text-orange-700 mt-1">{uniqueEmployees}</p>
              </div>
              <Users className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-xl shadow-md border">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by employee or project..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Employees</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.name}>{emp.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Employee Performance Summary */}
        <div className="bg-white p-6 rounded-xl shadow-md border">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Employee Performance Summary</h2>
          <div className="space-y-3">
            {employeeStats.map((stat, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {stat.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{stat.name}</p>
                    <p className="text-sm text-gray-500">{stat.projectCount} projects</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">{stat.totalHours.toFixed(1)} hrs</p>
                  <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(stat.totalHours / totalHours) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-xl shadow-md border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Time Range</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Hours</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredLogs
                  .filter(log => employeeFilter === "all" || log.employeeName === employeeFilter)
                  .map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-sm">
                          {log.employeeName.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">{log.employeeName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{log.projectName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {log.startTime && log.endTime ? (
                        <span className="text-sm">{log.startTime} - {log.endTime}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-gray-900">{log.hoursWorked} hrs</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredLogs.filter(log => employeeFilter === "all" || log.employeeName === employeeFilter).length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <FileText className="w-12 h-12 text-gray-400 mb-3" />
                        <p className="text-gray-500 font-medium">No logs found</p>
                        <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Profile View
  const renderProfile = () => {
    const handleSaveProfile = () => {
      if (!profileForm.username.trim() || !profileForm.email.trim()) {
        showToast("Please fill in all required fields", "error");
        return;
      }
      if (!profileForm.email.includes("@")) {
        showToast("Please enter a valid email address", "error");
        return;
      }
      showToast("Profile updated successfully!");
    };

    const handleChangePassword = () => {
      if (!profileForm.currentPassword || !profileForm.newPassword || !profileForm.confirmPassword) {
        showToast("Please fill in all password fields", "error");
        return;
      }
      if (profileForm.newPassword !== profileForm.confirmPassword) {
        showToast("New passwords do not match", "error");
        return;
      }
      if (profileForm.newPassword.length < 6) {
        showToast("Password must be at least 6 characters", "error");
        return;
      }
      showToast("Password changed successfully!");
      setProfileForm({ ...profileForm, currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordSection(false);
    };

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile Management</h1>
          <p className="text-gray-500 mt-1">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {user?.username?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{user?.username || "Admin User"}</h2>
                <p className="text-gray-600 mt-1">{user?.email || "admin@revamp.com"}</p>
                <div className="mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    {user?.role || "ADMIN"}
                  </span>
                </div>
              </div>
              <button className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors">
                <Edit className="w-4 h-4 inline mr-2" />
                Change Avatar
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={profileForm.username}
                  onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                  className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                <input
                  type="text"
                  value={user?.role || "ADMIN"}
                  disabled
                  className="w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Role cannot be changed</p>
              </div>
              <button
                onClick={handleSaveProfile}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-md transition-all font-medium"
              >
                Save Changes
              </button>
            </div>
          </div>

          {/* Password Section */}
          <div className="bg-white p-6 rounded-xl shadow-lg border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Security</h3>
              <button
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {showPasswordSection ? "Cancel" : "Change Password"}
              </button>
            </div>

            {showPasswordSection ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={profileForm.currentPassword}
                    onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                    className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={profileForm.newPassword}
                    onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                    className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={profileForm.confirmPassword}
                    onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirm new password"
                  />
                </div>
                <button
                  onClick={handleChangePassword}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 shadow-md transition-all font-medium"
                >
                  Update Password
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Password</p>
                    <p className="text-sm text-gray-500">Last changed 30 days ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Two-Factor Auth</p>
                    <p className="text-sm text-gray-500">Not enabled</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Activity Summary */}
        <div className="bg-white p-6 rounded-xl shadow-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Settings className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Profile updated</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Logged in from Chrome</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Employee assigned</p>
                <p className="text-xs text-gray-500">2 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? "w-64" : "w-20"} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
        <div className="p-4 flex items-center justify-between border-b">
          <h2 className={`${sidebarOpen ? "block" : "hidden"} text-xl font-bold text-blue-600`}>
            Revamp Admin
          </h2>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-5 h-5" />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="mb-6">
            <p className="text-gray-600">{greeting}, {user?.username || "Admin"}</p>
          </div>

          {activeView === "dashboard" && renderDashboard()}
          {activeView === "appointments" && renderAppointments()}
          {activeView === "employees" && renderEmployees()}
          {activeView === "analytics" && renderAnalytics()}
          {activeView === "employee-logs" && renderEmployeeLogs()}
          {activeView === "profile" && renderProfile()}
        </div>
      </div>

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-[100] space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-6 py-4 rounded-lg shadow-lg border flex items-center gap-3 min-w-[300px] animate-slide-in ${
              toast.type === "success" 
                ? "bg-green-50 border-green-200 text-green-800"
                : toast.type === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-blue-50 border-blue-200 text-blue-800"
            }`}
          >
            {toast.type === "success" && <CheckCircle2 className="w-5 h-5" />}
            {toast.type === "error" && <AlertCircle className="w-5 h-5" />}
            {toast.type === "info" && <Bell className="w-5 h-5" />}
            <span className="flex-1 font-medium">{toast.message}</span>
            <button
              onClick={() => setToasts(toasts.filter(t => t.id !== toast.id))}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Assign Employee Modal */}
      {showAssignModal && selectedAppointment && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAssignModal(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Assign Employee</h2>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600">Appointment Details:</p>
              <p className="font-semibold text-gray-900">{selectedAppointment.customerName}</p>
              <p className="text-sm text-gray-700">{selectedAppointment.vehicle}</p>
              <p className="text-xs text-gray-500 mt-1">{selectedAppointment.serviceType} • {selectedAppointment.date} at {selectedAppointment.time}</p>
            </div>
            <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
              {employees.filter(emp => emp.availability === "Available").length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">No available employees</p>
                  <p className="text-sm">All employees are currently busy</p>
                </div>
              ) : (
                employees
                  .filter(emp => emp.availability === "Available")
                  .map((emp) => (
                    <button
                      key={emp.id}
                      onClick={() => assignEmployee(selectedAppointment.id, emp.id)}
                      className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {emp.name.charAt(0)}
                            </div>
                            <div className="font-semibold text-gray-900 group-hover:text-blue-700">{emp.name}</div>
                          </div>
                          <div className="text-sm text-gray-600 ml-10">{emp.email}</div>
                          <div className="mt-2 ml-10 flex flex-wrap gap-1">
                            {emp.skillSet.map((skill, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-gray-300 group-hover:text-blue-600" />
                      </div>
                    </button>
                  ))
              )}
            </div>
            <button
              onClick={() => setShowAssignModal(false)}
              className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {showNotificationModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowNotificationModal(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Send className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Send Notification</h2>
              </div>
              <button
                onClick={() => setShowNotificationModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                placeholder="Enter notification message to send to customers..."
                className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                rows={5}
              />
              <p className="text-xs text-gray-500 mt-1">
                {notificationMessage.length} characters
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={sendNotification}
                disabled={!notificationMessage.trim()}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md transition-all"
              >
                <Send className="w-4 h-4 inline mr-2" />
                Send Notification
              </button>
              <button
                onClick={() => setShowNotificationModal(false)}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Time Slot Modal */}
      {showTimeSlotModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowTimeSlotModal(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Settings className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Adjust Time Slot</h2>
              </div>
              <button
                onClick={() => setShowTimeSlotModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={timeSlotData.date}
                  onChange={(e) => setTimeSlotData({ ...timeSlotData, date: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={timeSlotData.time}
                  onChange={(e) => setTimeSlotData({ ...timeSlotData, time: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Action <span className="text-red-500">*</span>
                </label>
                <select
                  value={timeSlotData.action}
                  onChange={(e) => setTimeSlotData({ ...timeSlotData, action: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="block">🔒 Block Slot</option>
                  <option value="unblock">🔓 Unblock Slot</option>
                  <option value="modify">✏️ Modify Slot</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {timeSlotData.action === "block" && "Prevent bookings for this time slot"}
                  {timeSlotData.action === "unblock" && "Make this time slot available for bookings"}
                  {timeSlotData.action === "modify" && "Change the time slot details"}
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={adjustTimeSlot}
                disabled={!timeSlotData.date || !timeSlotData.time}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md transition-all"
              >
                Confirm {timeSlotData.action === "block" ? "Block" : timeSlotData.action === "unblock" ? "Unblock" : "Modify"}
              </button>
              <button
                onClick={() => setShowTimeSlotModal(false)}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Employee Registration/Edit Modal */}
      {showEditEmployeeModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={() => {
            setShowEditEmployeeModal(false);
            setSelectedEmployee(null);
            setEmployeeForm({ name: "", email: "", password: "", phone: "", skillSet: [], isEdit: false });
          }}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 my-8 transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  employeeForm.isEdit ? "bg-blue-100" : "bg-green-100"
                }`}>
                  {employeeForm.isEdit ? (
                    <Edit className="w-5 h-5 text-blue-600" />
                  ) : (
                    <UserPlus className="w-5 h-5 text-green-600" />
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {employeeForm.isEdit ? "Edit Employee" : "Register New Employee"}
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowEditEmployeeModal(false);
                  setSelectedEmployee(null);
                  setEmployeeForm({ name: "", email: "", password: "", phone: "", skillSet: [], isEdit: false });
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={addEmployee} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={employeeForm.name}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter employee name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={employeeForm.email}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="employee@revamp.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {employeeForm.isEdit ? "New Password (leave empty to keep current)" : "Password"} 
                    {!employeeForm.isEdit && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="password"
                    required={!employeeForm.isEdit}
                    value={employeeForm.password}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, password: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder={employeeForm.isEdit ? "Enter new password (optional)" : "Enter password"}
                    minLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={employeeForm.phone}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="+1 234-567-8900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Skills <span className="text-red-500">*</span>
                  <span className="text-gray-500 font-normal ml-2">
                    (Select at least one skill)
                  </span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4 border-2 rounded-lg bg-gray-50">
                  {AVAILABLE_SKILLS.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        employeeForm.skillSet.includes(skill)
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-500"
                      }`}
                    >
                      {skill}
                      {employeeForm.skillSet.includes(skill) && (
                        <CheckCircle2 className="w-4 h-4 inline ml-1" />
                      )}
                    </button>
                  ))}
                </div>
                {employeeForm.skillSet.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-sm text-gray-600">Selected:</span>
                    {employeeForm.skillSet.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {employeeForm.isEdit && selectedEmployee && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Editing employee {selectedEmployee.name}. 
                    Current projects and performance metrics will be preserved.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium shadow-md transition-all"
                >
                  {employeeForm.isEdit ? (
                    <>
                      <Edit className="w-4 h-4 inline mr-2" />
                      Update Employee
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 inline mr-2" />
                      Register Employee
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditEmployeeModal(false);
                    setSelectedEmployee(null);
                    setEmployeeForm({ name: "", email: "", password: "", phone: "", skillSet: [], isEdit: false });
                  }}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}