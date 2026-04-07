export const vydhraData = {
  students: [
    { id: "S001", name: "Alice Johnson", email: "alice@example.com", courses: 2, joined: "2023-01-15", status: "Active" },
    { id: "S002", name: "Bob Smith", email: "bob@example.com", courses: 1, joined: "2023-03-22", status: "Inactive" },
    { id: "S003", name: "Charlie Davis", email: "charlie@example.com", courses: 4, joined: "2022-11-10", status: "Active" },
  ],
  agents: [
    { id: "A001", name: "John Doe", referralCode: "JDOE10", totalReferrals: 15, revenue: "$1,500", status: "Active" },
    { id: "A002", name: "Jane Smith", referralCode: "JANE20", totalReferrals: 8, revenue: "$800", status: "Active" },
  ],
  courses: [
    { id: "C001", title: "Full Stack Web Development", price: "$499", students: 120, rating: 4.8 },
    { id: "C002", title: "Data Science Bootcamp", price: "$699", students: 85, rating: 4.7 },
    { id: "C003", title: "UI/UX Design Masterclass", price: "$299", students: 200, rating: 4.9 },
  ],
  invoices: [
    { id: "INV-V001", student: "Alice Johnson", amount: "$499", date: "2024-04-01", status: "Paid" },
    { id: "INV-V002", student: "Bob Smith", amount: "$699", date: "2024-04-05", status: "Pending" },
  ],
  payments: [
    { id: "PAY-V001", student: "Alice Johnson", method: "Credit Card", amount: "$499", date: "2024-04-01", status: "Success" },
  ],
  coupons: [
    { id: "CPN001", code: "SUMMER20", discount: "20%", usageLimit: 100, used: 45, status: "Active" },
    { id: "CPN002", code: "WELCOME10", discount: "10%", usageLimit: 500, used: 480, status: "Active" },
  ],
  enquiries: [
    { id: "ENQ-V001", name: "David Lee", email: "david@example.com", subject: "Course Content Inquiry", date: "2024-04-06", status: "Unread" },
  ],
};
