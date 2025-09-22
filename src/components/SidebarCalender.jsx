// src/pages/StudentCalendarPage.jsx
import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import LearnerSidebar from "../components/LearnerSidebar";
import { FaBars, FaCalendarAlt } from "react-icons/fa";

export default function StudentCalendarPage() {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("Calendar");
  const [hoveredDate, setHoveredDate] = useState(null);

  // Fetch events (facilitator + admin)
  const fetchEvents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "events"));
      const eventsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(eventsData);
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Calendar tile content with custom tooltip
  const tileContent = ({ date: tileDate, view }) => {
    if (view === "month") {
      const dayEvents = events.filter(
        (event) => new Date(event.date).toDateString() === tileDate.toDateString()
      );

      if (dayEvents.length === 0) return null;

      return (
        <div
          className="relative mt-1 w-full text-center bg-blue-500 text-white rounded-full text-xs cursor-pointer"
          onMouseEnter={() => setHoveredDate(tileDate.toDateString())}
          onMouseLeave={() => setHoveredDate(null)}
        >
          {dayEvents.length}
          {/* Custom Tooltip */}
          {hoveredDate === tileDate.toDateString() && (
            <div className="absolute z-50 top-8 left-1/2 transform -translate-x-1/2 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-lg rounded-md p-2 text-sm text-gray-800 dark:text-gray-200">
              {dayEvents.map((ev) => (
                <div key={ev.id} className="mb-1 last:mb-0">
                  • {ev.title}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
  };

  const eventsForSelectedDate = events.filter(
    (event) => new Date(event.date).toDateString() === date.toDateString()
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <LearnerSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activePage={activePage}
        setActivePage={setActivePage}
      />

      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto md:ml-64">
        {/* Mobile menu button */}
        <div className="flex items-center justify-between mb-6 md:hidden">
          <button
            className="p-2 bg-blue-500 text-white rounded-lg"
            onClick={() => setSidebarOpen(true)}
          >
            <FaBars />
          </button>
        </div>

        {/* Calendar Header */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-6 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <FaCalendarAlt /> My Calendar
          </h1>
        </div>

        {/* Calendar */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md w-full max-w-3xl mx-auto mb-6">
          <Calendar
            onChange={setDate}
            value={date}
            tileContent={tileContent}
            className="rounded-xl shadow-inner border border-gray-200 dark:border-gray-700 overflow-hidden"
          />
        </div>

        {/* Events List */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Events on {date.toDateString()}
          </h2>

          {eventsForSelectedDate.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 bg-gray-100 dark:bg-gray-700 rounded-xl">
              <FaCalendarAlt className="text-4xl text-gray-400 dark:text-gray-300 mb-2" />
              <p className="text-gray-500 dark:text-gray-300 italic">
                No events scheduled for this day.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {eventsForSelectedDate.map((event) => (
                <div
                  key={event.id}
                  className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg border border-gray-200 dark:border-gray-700 transition"
                >
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {event.title}
                  </h3>
                  {event.description && (
                    <p className="text-gray-600 dark:text-gray-300 mt-2">
                      {event.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(event.date).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
