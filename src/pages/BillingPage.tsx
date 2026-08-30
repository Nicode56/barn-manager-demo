import React from "react";

export const BillingPage: React.FC = () => {
  // Mock invoices generated from lessons and services
  const mockInvoices = [
    {
      id: "INV-001",
      date: "June 1, 2026",
      client: "Emma Davis",
      amount: 150,
      items: ["Beginner flatwork lesson - 1 hour"],
      status: "paid",
    },
    {
      id: "INV-002",
      date: "June 5, 2026",
      client: "Ava Brooks",
      amount: 300,
      items: ["Trail prep lessons - 2 hours", "Farrier service"],
      status: "paid",
    },
    {
      id: "INV-003",
      date: "June 10, 2026",
      client: "Liam Carter",
      amount: 175,
      items: ["Jumping lesson - 1 hour", "Vet follow-up"],
      status: "pending",
    },
    {
      id: "INV-004",
      date: "June 8, 2026",
      client: "Mia James",
      amount: 450,
      items: ["Dressage training - 3 hours", "Dental cleaning", "Vet check"],
      status: "pending",
    },
  ];

  const paidTotal = mockInvoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const pendingTotal = mockInvoices
    .filter((inv) => inv.status === "pending")
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8 page-title-banner">QuickBooks Integration</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-green-100 p-4 rounded-lg border border-green-300">
          <p className="text-sm text-gray-600">Paid Invoices</p>
          <p className="text-2xl font-bold text-green-700">${paidTotal}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg border border-yellow-300">
          <p className="text-sm text-gray-600">Pending Invoices</p>
          <p className="text-2xl font-bold text-yellow-700">${pendingTotal}</p>
        </div>
      </div>

      {/* Invoices List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold mb-4 page-title-banner">Recent Invoices</h2>
        {mockInvoices.map((invoice) => (
          <div
            key={invoice.id}
            className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-lg">{invoice.id}</p>
                <p className="text-sm text-gray-600">{invoice.client}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">${invoice.amount}</p>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    invoice.status === "paid"
                      ? "bg-green-200 text-green-800"
                      : "bg-yellow-200 text-yellow-800"
                  }`}
                >
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-2">{invoice.date}</p>
            <ul className="text-sm text-gray-700 space-y-1">
              {invoice.items.map((item, idx) => (
                <li key={idx} className="ml-4">
                  • {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
