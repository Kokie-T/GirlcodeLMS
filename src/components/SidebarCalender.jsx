import React, { useState, useEffect, useMemo } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { getAuth } from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { FaBars } from "react-icons/fa";
import LearnerSidebar from "../components/LearnerSidebar";

// ---------- Event Card ----------
const EventCard = ({ event }) => (
  <div className="p-4 rounded-xl shadow hover:shadow-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200">
    <h3 className="font-semibold">{event.title}</h3>
    <p className="text-xs text-gray-500 dark:text-gray-400">{event.type}</p>
  </div>
);

export default function CalendarPage() {
  const auth = getAuth();
  const user = auth.currentUser;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("Calendar");
  const [darkMode, setDarkMode] = useState(
    JSON.parse(localStorage.getItem("darkMode")) || false
  );
  const [events, setEvents] = useState([]);
  const [calendarDate, setCalendarDate] = useState(new Date());

  // ---------------- Fetch Learner Events ----------------
  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(collection(db, "events"), (snapshot) => {
      const evs = snapshot.docs
        .map((doc) => {
          const data = doc.data();

          let startDate;
          if (typeof data.date === "string") {
            startDate = new Date(data.date);
          } else if (data.date?.toDate) {
            startDate = data.date.toDate();
          }

          return {
            id: doc.id,
            title: data.title,
            start: startDate,
            type: data.type || "",
            studentIds: data.studentIds || [],
            allStudents: data.allStudents || false,
          };
        })
        .filter((ev) => ev.allStudents || ev.studentIds.includes(user.uid));

      setEvents(evs);
    });

    return () => unsubscribe();
  }, [user]);

  // ---------------- Dark Mode ----------------
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  // ---------------- Memoize Event Dates for calendar styling ----------------
  const eventDates = useMemo(
    () => new Set(events.map((ev) => ev.start.toDateString())),
    [events]
  );

  // ---------------- Events for selected date ----------------
  const eventsForDate = useMemo(
    () => events.filter((ev) => ev.start.toDateString() === calendarDate.toDateString()),
    [events, calendarDate]
  );

  return (
    <div className={`flex h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Sidebar */}
      <LearnerSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activePage={activePage}
        setActivePage={setActivePage}
        darkMode={darkMode}
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

        {/* Calendar Header Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow hover:shadow-xl mb-6 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
            📅 My Calendar
          </h1>
        </div>

        {/* Calendar */}
        <Calendar
          value={calendarDate}
          onChange={setCalendarDate}
          tileClassName={({ date, view }) =>
            view === "month" && eventDates.has(date.toDateString())
              ? "bg-blue-500 text-white rounded-full"
              : null
          }
          className="rounded-lg shadow-lg w-full max-w-md"
        />

        {/* Events for selected date */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {eventsForDate.length > 0 ? (
            eventsForDate.map((ev) => <EventCard key={ev.id} event={ev} />)
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic col-span-full">
              No events
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
