"use client";

import React from "react";
import { PageHeader } from "../../components/common/PageHeader";
import { DataTable } from "../../components/common/DataTable";
import { useBusiness } from "../context/BusinessContext";
import { ramesysData } from "../../data/ramesys";

export default function ClientsPage() {
  const { activeBusiness } = useBusiness();

  const columns = [
    { header: "ID", accessor: "id" as const },
    { header: "Client Name", accessor: "name" as const },
    { header: "Contact Person", accessor: "contactPerson" as const },
    { header: "Email", accessor: "email" as const },
    { header: "Active Projects", accessor: "activeProjects" as const },
    { 
      header: "Status", 
      accessor: (row: any) => (
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
          row.status === 'Active' 
            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' 
            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
        }`}>
          {row.status}
        </span>
      )
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Clients"
        description="Manage your IT client portfolio and contacts."
      />
      
      {activeBusiness === "ramesys" ? (
        <DataTable
          data={ramesysData.clients}
          columns={columns}
          keyExtractor={(row) => row.id}
        />
      ) : (
        <div className="p-8 text-center text-gray-500 border rounded-xl border-dashed">
          Switch to Ramesys to view Clients.
        </div>
      )}
    </div>
  );
}
