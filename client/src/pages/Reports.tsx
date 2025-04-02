import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function Reports() {
  const [reportType, setReportType] = useState("daily");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Get formatted date for display
  const formattedDate = selectedDate ? formatDate(new Date(selectedDate)) : "Today";
  
  // Fetch stats for the selected date
  const { data: stats, isLoading } = useQuery({
    queryKey: [`/api/dashboard/stats?date=${selectedDate}`],
  });
  
  return (
    <section className="py-4">
      <h2 className="text-xl font-bold mb-4">Reports</h2>
      
      <div className="mb-4 flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex space-x-2">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="daily">Daily Report</option>
            <option value="weekly">Weekly Report</option>
            <option value="monthly">Monthly Report</option>
          </select>
          
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        <div className="flex-grow"></div>
        
        <button className="p-2 text-primary border border-primary rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-200 flex items-center">
          <span className="material-icons mr-1">print</span>
          Print Report
        </button>
      </div>
      
      <div className="bg-white rounded-lg p-4 mb-6 shadow-md">
        <h3 className="font-bold text-lg mb-3">Summary for {formattedDate}</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-neutral-600 text-sm">Vehicles Serviced</div>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats?.vehicleCount || 0}
            </div>
          </div>
          
          <div>
            <div className="text-neutral-600 text-sm">Completed Jobs</div>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : (stats?.vehicleCount - stats?.activeJobs) || 0}
            </div>
          </div>
          
          <div>
            <div className="text-neutral-600 text-sm">Total Revenue</div>
            <div className="text-2xl font-bold text-green-600">
              {isLoading ? "..." : formatCurrency(stats?.totalRevenue || 0)}
            </div>
          </div>
          
          <div>
            <div className="text-neutral-600 text-sm">Pending Payments</div>
            <div className="text-2xl font-bold text-orange-600">
              {isLoading ? "..." : formatCurrency(stats?.pendingPayments || 0)}
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-4 shadow-md">
          <h3 className="font-bold mb-3">Revenue Breakdown</h3>
          <div className="h-64 flex items-center justify-center text-neutral-500">
            Revenue chart will be displayed here
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-md">
          <h3 className="font-bold mb-3">Top Services/Products</h3>
          <div className="h-64 flex items-center justify-center text-neutral-500">
            Top services chart will be displayed here
          </div>
        </div>
      </div>
    </section>
  );
}
