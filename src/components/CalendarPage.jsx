import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function CalendarPage() {
  const [date, setDate] = useState(new Date());

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-4 dark:text-white">Calendar</h2>
      <Calendar onChange={setDate} value={date} className="dark:bg-gray-700" />
    </div>
  );
}
