export const mockIssues = [
  { id: 1, title: 'Large pothole on MG Road near bus stop', category: 'Road Damage', status: 'IN_PROGRESS', priority: 'HIGH', zone: 'North Zone', createdAt: '2025-02-10', updatedAt: '2025-02-15', assignedOfficer: 'Rajan Kumar', department: 'Public Works', description: 'A large pothole has formed causing traffic disruption and vehicle damage.', attachments: 2, updates: 3 },
  { id: 2, title: 'Broken street light on Anna Nagar 4th Street', category: 'Electricity', status: 'ASSIGNED', priority: 'MEDIUM', zone: 'West Zone', createdAt: '2025-02-12', updatedAt: '2025-02-13', assignedOfficer: 'Priya Sharma', department: 'Electricity Board', description: 'Street light has been non-functional for 2 weeks causing safety issues at night.', attachments: 1, updates: 1 },
  { id: 3, title: 'Garbage not collected for 5 days in Sector 7', category: 'Waste Management', status: 'REPORTED', priority: 'HIGH', zone: 'South Zone', createdAt: '2025-02-14', updatedAt: '2025-02-14', assignedOfficer: null, department: null, description: 'Garbage collection has been skipped for multiple days causing health hazards.', attachments: 3, updates: 0 },
  { id: 4, title: 'Water leakage from main pipeline on Gandhi Street', category: 'Water', status: 'RESOLVED', priority: 'HIGH', zone: 'East Zone', createdAt: '2025-02-05', updatedAt: '2025-02-18', assignedOfficer: 'Mohammed Ali', department: 'Water Works', description: 'Major water leakage wasting municipal water supply.', attachments: 2, updates: 5 },
  { id: 5, title: 'Overgrown trees blocking road visibility', category: 'Road Damage', status: 'CLOSED', priority: 'LOW', zone: 'Central Zone', createdAt: '2025-01-28', updatedAt: '2025-02-10', assignedOfficer: 'Suresh Babu', department: 'Public Works', description: 'Trees have grown over the road blocking visibility for drivers.', attachments: 1, updates: 4 },
  { id: 6, title: 'Drainage overflow near main market', category: 'Drainage', status: 'IN_PROGRESS', priority: 'HIGH', zone: 'North Zone', createdAt: '2025-02-16', updatedAt: '2025-02-19', assignedOfficer: 'Kavitha Nair', department: 'Sanitation', description: 'Drainage is overflowing onto the road causing unhygienic conditions.', attachments: 4, updates: 2 },
];

export const mockDepartments = [
  { id: 1, name: 'Public Works Department', description: 'Handles roads, drainage, and infrastructure', officerCount: 12, openIssues: 34 },
  { id: 2, name: 'Electricity Board', description: 'Manages street lights and electrical infrastructure', officerCount: 8, openIssues: 18 },
  { id: 3, name: 'Water Works', description: 'Manages water supply and pipeline issues', officerCount: 10, openIssues: 22 },
  { id: 4, name: 'Sanitation Department', description: 'Handles waste collection and drainage', officerCount: 15, openIssues: 41 },
];

export const mockUsers = [
  { id: 1, name: 'John Citizen', email: 'john@example.com', phone: '9876543210', role: 'CITIZEN', zone: 'North Zone', joinedAt: '2025-01-15', issues: 5 },
  { id: 2, name: 'Jane Officer', email: 'jane.officer@example.com', phone: '9876543211', role: 'OFFICER', department: 'Public Works', zone: 'South Zone', joinedAt: '2024-12-01', resolvedIssues: 28 },
  { id: 3, name: 'Rajan Kumar', email: 'rajan@example.com', phone: '9876543213', role: 'OFFICER', department: 'Public Works', zone: 'North Zone', joinedAt: '2024-11-10', resolvedIssues: 45 },
  { id: 4, name: 'Priya Sharma', email: 'priya@example.com', phone: '9876543214', role: 'OFFICER', department: 'Electricity Board', zone: 'West Zone', joinedAt: '2025-01-05', resolvedIssues: 19 },
  { id: 5, name: 'Admin User', email: 'admin@example.com', phone: '9876543212', role: 'ADMIN', zone: 'Central Zone', joinedAt: '2024-10-01' },
];

export const mockCategories = [
  { id: 1, name: 'Road Damage', baseScore: 70, department: 'Public Works', issueCount: 45 },
  { id: 2, name: 'Electricity', baseScore: 65, department: 'Electricity Board', issueCount: 23 },
  { id: 3, name: 'Water', baseScore: 80, department: 'Water Works', issueCount: 31 },
  { id: 4, name: 'Waste Management', baseScore: 60, department: 'Sanitation', issueCount: 52 },
  { id: 5, name: 'Drainage', baseScore: 75, department: 'Sanitation', issueCount: 28 },
];

export const mockNotifications = [
  { id: 1, message: 'Your issue #1 has been assigned to an officer.', type: 'ASSIGNMENT', read: false, createdAt: '2025-02-15 10:30' },
  { id: 2, message: 'Issue #4 has been resolved. Thank you for reporting!', type: 'RESOLVED', read: false, createdAt: '2025-02-18 14:22' },
  { id: 3, message: 'Status update on Issue #1: Work is now In Progress.', type: 'UPDATE', read: true, createdAt: '2025-02-15 15:00' },
  { id: 4, message: 'System maintenance scheduled Sunday 2 AM - 4 AM.', type: 'SYSTEM_UPDATE', read: true, createdAt: '2025-02-14 09:00' },
];

export const mockStats = {
  totalIssues: 248,
  resolvedIssues: 189,
  pendingIssues: 59,
  totalUsers: 1420,
  totalOfficers: 45,
  avgResolutionDays: 4.2,
  resolutionRate: 76.2,
  issuesByStatus: [
    { name: 'Reported', value: 23, color: '#3b82f6' },
    { name: 'Assigned', value: 18, color: '#f59e0b' },
    { name: 'In Progress', value: 18, color: '#8b5cf6' },
    { name: 'Resolved', value: 165, color: '#10b981' },
    { name: 'Closed', value: 24, color: '#6b7280' },
  ],
  issuesByMonth: [
    { month: 'Sep', issues: 32, resolved: 28 },
    { month: 'Oct', issues: 45, resolved: 39 },
    { month: 'Nov', issues: 38, resolved: 35 },
    { month: 'Dec', issues: 29, resolved: 25 },
    { month: 'Jan', issues: 52, resolved: 44 },
    { month: 'Feb', issues: 52, resolved: 18 },
  ],
  departmentPerformance: [
    { name: 'Public Works', resolved: 89, pending: 14 },
    { name: 'Electricity', resolved: 45, pending: 8 },
    { name: 'Water Works', resolved: 62, pending: 12 },
    { name: 'Sanitation', resolved: 78, pending: 25 },
  ],
};