"use client";

import { useState } from "react";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: Date | null;
  project: {
    name: string;
    color: string;
  } | null;
  assignee: {
    name: string | null;
    email: string;
  } | null;
};

type CalendarViewProps = {
  tasks: Task[];
};

export default function CalendarView({ tasks }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // Get previous month's last days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const prevMonthDays = Array.from(
    { length: startingDayOfWeek },
    (_, i) => prevMonthLastDay - startingDayOfWeek + i + 1
  );

  // Get next month's first days
  const remainingDays = 42 - (daysInMonth + startingDayOfWeek);
  const nextMonthDays = Array.from({ length: remainingDays }, (_, i) => i + 1);

  // Group tasks by date
  const tasksByDate = tasks.reduce((acc, task) => {
    if (task.dueDate) {
      const dateKey = new Date(task.dueDate).toDateString();
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(task);
    }
    return acc;
  }, {} as Record<string, Task[]>);

  const getTasksForDay = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return [];
    const date = new Date(year, month, day);
    return tasksByDate[date.toDateString()] || [];
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      URGENT: "bg-red-500",
      HIGH: "bg-orange-500",
      MEDIUM: "bg-yellow-500",
      LOW: "bg-blue-500",
    };
    return colors[priority as keyof typeof colors] || colors.MEDIUM;
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  return (
    <div className="bg-primary rounded-lg border border-default">
      {/* Calendar Header */}
      <div className="p-6 border-b border-default">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-primary">
            {monthNames[month]} {year}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={goToToday}
              className="px-4 py-2 text-sm text-primary bg-secondary rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Today
            </button>
            <button
              onClick={goToPreviousMonth}
              className="p-2 text-primary hover:bg-secondary rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 text-primary hover:bg-secondary rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {/* Day Names */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-semibold text-secondary py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {/* Previous Month Days */}
          {prevMonthDays.map((day, index) => (
            <div
              key={`prev-${index}`}
              className="min-h-[120px] p-2 bg-primary rounded-lg border border-default"
            >
              <span className="text-sm text-secondary dark:text-gray-600">
                {day}
              </span>
            </div>
          ))}

          {/* Current Month Days */}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const dayTasks = getTasksForDay(day, true);
            const isTodayDate = isToday(day);

            return (
              <div
                key={day}
                className={`min-h-[120px] p-2 rounded-lg border transition-all ${
                  isTodayDate
                    ? "bg-accent-secondary border-accent dark:border-accent"
                    : "bg-primary border-default"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-sm font-semibold ${
                      isTodayDate
                        ? "text-accent"
                        : "text-primary"
                    }`}
                  >
                    {day}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-xs text-secondary">
                      {dayTasks.length}
                    </span>
                  )}
                </div>

                {/* Tasks */}
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className="group relative cursor-pointer"
                    >
                      <div
                        className="text-xs p-1.5 rounded truncate hover:shadow-md transition-shadow"
                        style={{
                          backgroundColor: task.project ? task.project.color + "20" : "#6b7280" + "20",
                          borderLeft: `3px solid ${task.project ? task.project.color : "#6b7280"}`,
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${getPriorityColor(
                              task.priority
                            )}`}
                          />
                          <span className="text-primary font-medium truncate">
                            {task.title}
                          </span>
                        </div>
                      </div>

                      {/* Tooltip */}
                      <div className="absolute z-10 hidden group-hover:block left-0 top-full mt-1 w-64 p-3 bg-[rgb(var(--card-background))] text-white rounded-lg shadow-xl">
                        <p className="font-semibold mb-1">{task.title}</p>
                        {task.description && (
                          <p className="text-xs text-gray-300 mb-2">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs">
                          {task.project && (
                            <span
                              className="px-2 py-0.5 rounded"
                              style={{ backgroundColor: task.project.color }}
                            >
                              {task.project.name}
                            </span>
                          )}
                          <span className="text-gray-300">
                            {task.status.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Show more indicator */}
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-secondary pl-1.5">
                      +{dayTasks.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Next Month Days */}
          {nextMonthDays.map((day, index) => (
            <div
              key={`next-${index}`}
              className="min-h-[120px] p-2 bg-primary rounded-lg border border-default"
            >
              <span className="text-sm text-secondary dark:text-gray-600">
                {day}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="px-6 pb-6">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-secondary">Urgent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full" />
            <span className="text-secondary">High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <span className="text-secondary">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span className="text-secondary">Low</span>
          </div>
        </div>
      </div>
    </div>
  );
}
