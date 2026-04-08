"use client";

import React from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { useBusiness } from "@/context/BusinessContext";
import { vydhraData } from "@/data/vydhra";

export default function StudentsPage() {
  const { activeBusiness } = useBusiness();

  const columns = [
    { header: "ID", accessor: "id" as const },
    { header: "Name", accessor: "name" as const },
    { header: "Email", accessor: "email" as const },
    { header: "Courses Enrolled", accessor: "courses" as const },
    { header: "Joined", accessor: "joined" as const },
    { 
      header: "Status", 
      accessor: (row: any) => (
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
          row.status === 'Active' 
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {row.status}
        </span>
      )
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Students"
        description="Manage all enrolled students on the platform."
      />
      
      {activeBusiness === "vydhra" ? (
        <DataTable
          data={vydhraData.students}
          columns={columns}
          keyExtractor={(row) => row.id}
        />
      ) : (
        <div className="p-8 text-center text-gray-500 border rounded-xl border-dashed">
          Switch to Vydhra to view Students.
        </div>
      )}
    </div>
  );
}
