export const ramesysData = {
  clients: [
    { id: "CLI001", name: "Acme Corp", contactPerson: "Tom Hanks", email: "tom@acme.com", activeProjects: 2, status: "Active" },
    { id: "CLI002", name: "Stark Industries", contactPerson: "Tony Stark", email: "tony@stark.com", activeProjects: 1, status: "Active" },
    { id: "CLI003", name: "Wayne Enterprises", contactPerson: "Bruce Wayne", email: "bruce@wayne.com", activeProjects: 0, status: "Inactive" },
  ],
  projects: [
    { id: "PRJ001", title: "E-Commerce Replatforming", client: "Acme Corp", totalBudget: "$50,000", timeline: "Jan - Jun 2024", status: "In Progress" },
    { id: "PRJ002", title: "Mobile App Development", client: "Stark Industries", totalBudget: "$80,000", timeline: "Mar - Sep 2024", status: "Planning" },
    { id: "PRJ003", title: "CRM Migration", client: "Acme Corp", totalBudget: "$15,000", timeline: "Feb - Mar 2024", status: "Completed" },
  ],
  invoices: [
    { id: "INV-R001", client: "Acme Corp", project: "E-Commerce Replatforming", amount: "$10,000", date: "2024-04-01", status: "Paid" },
    { id: "INV-R002", client: "Stark Industries", project: "Mobile App Development", amount: "$20,000", date: "2024-04-05", status: "Pending" },
  ],
  payments: [
    { id: "PAY-R001", client: "Acme Corp", method: "Bank Transfer", amount: "$10,000", date: "2024-04-02", status: "Success" },
  ],
  enquiries: [
    { id: "ENQ-R001", name: "Clark Kent", email: "clark@dailyplanet.com", subject: "IT Support Services", date: "2024-04-06", status: "Unread" },
  ],
};
