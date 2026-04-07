"use client";

import React from "react";
import { PageHeader } from "../../components/common/PageHeader";
import { useBusiness } from "../context/BusinessContext";

export default function CoursesPage() {
  const { activeBusiness } = useBusiness();

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Courses"
        description={`Manage ${name} for ${activeBusiness === "vydhra" ? "Vydhra" : "Ramesys"}`}
      />
      
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 text-blue-500">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Courses Module</h3>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
          This is the courses page for {activeBusiness}. The data table will be implemented here.
        </p>
      </div>
    </div>
  );
}
