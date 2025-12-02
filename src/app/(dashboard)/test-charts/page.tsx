"use client";

import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const testData = [
  { name: "Day 1", value: 10 },
  { name: "Day 2", value: 20 },
  { name: "Day 3", value: 15 },
  { name: "Day 4", value: 30 },
  { name: "Day 5", value: 25 },
];

export default function TestChartsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.log("Test Charts Page Mounted");
    console.log("Test Data:", testData);
  }, []);

  if (!mounted) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="bg-primary rounded-xl border border-default p-6">
        <h1 className="text-2xl font-bold text-primary mb-4">
          📊 Chart Test Page
        </h1>
        
        <div className="space-y-6">
          <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg">
            <p className="text-sm font-bold">Debug Info:</p>
            <p className="text-xs mt-2">Mounted: {mounted ? "✅ Yes" : "❌ No"}</p>
            <p className="text-xs">Data Points: {testData.length}</p>
            <p className="text-xs">Window Object: {typeof window !== 'undefined' ? "✅ Available" : "❌ Not Available"}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-primary mb-4">
              Simple Line Chart Test
            </h2>
            <div className="bg-secondary p-4 rounded-lg" style={{ height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={testData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">
              ✅ If you can see a blue line chart above with 5 data points, recharts is working!
            </p>
          </div>

          <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">
              ❌ If you see this text but no chart above, check the browser console (F12) for errors
            </p>
          </div>

          <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 Open browser console (F12) and look for any red error messages
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
