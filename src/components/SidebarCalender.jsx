import React, { useState, useEffect } from "react";
import { getAuth, signOut } from "firebase/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { FaTachometerAlt, FaBook, FaEnvelope, FaSignOutAlt, FaBars, FaTimes, FaScrewdriver, FaCalendar } from "react-icons/fa";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

// Sidebar and layout components
const Sidebar = ({ sidebarOpen, setSidebarOpen, activePage, setActivePage, darkMode }) => {
  const navigate = useNavigate();

  const sidebarItems = [
    { icon: <FaTachometerAlt />, label: "Dashboard", path: "/learner-dashboard" },
    { icon: <FaBook />, label: "My Courses", path: "/courses" },
    { icon: <FaEnvelope />, label: "Messages", path: "/learner/messages" },
    { icon: <FaScrewdriver />, label: "Settings", path: "/learner-settings" },
    { icon: <FaCalendar />, label: "Calendar", path: "/learner/calendar" },
  ];

  return (
    <aside
      className={`fixed md:static top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col justify-between transition-transform duration-300 z-50 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0`}
    >
      <div>
        <button className="md:hidden p-4 self-end text-xl" onClick={() => setSidebarOpen(false)}>
          <FaTimes className={darkMode ? "text-white" : ""} />
        </button>
        <h2 className="text-xl font-bold text-center py-6 border-b dark:border-gray-700 dark:text-white">
          LMS Pro <br />
          <span className="text-sm text-gray-500 dark:text-gray-300">Learner Portal</span>
        </h2>
        <nav className="mt-6 space-y-2">
          {sidebarItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActivePage(item.label);
                navigate(item.path);
                setSidebarOpen(false);
              }}
              className={`flex items-center gap-3 w-full px-4 py-2 text-sm rounded-lg ${
                activePage === item.label
                  ? "bg-blue-100 text-blue-600 font-semibold"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t dark:border-gray-700">
        <LogoutButton />
      </div>
    </aside>
  );
};

// Logout button
const LogoutButton = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };
  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm bg-red-500 text-white hover:bg-red-600 rounded-lg"
    >
      <FaSignOutAlt /> Logout
    </button>
  );
};

// Main Calendar Page
export default function CalendarPage() {
  const auth = getAuth();
  const user = auth.currentUser;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("Calendar");
  const [darkMode, setDarkMode] = useState(JSON.parse(localStorage.getItem("darkMode")) || false);
  const [events, setEvents] = useState([]);
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Fetch learner events
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "events"), where("studentIds", "array-contains", user.uid));
    const unsubscribe = onSnapshot(q, snapshot => {
      const evs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          title: data.title,
          start: data.date.toDate(),
          type: data.type,
        };
      });
      setEvents(evs);
    });
    return () => unsubscribe();
  }, [user]);

  // Dark mode persistence
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  return (
    <div className={`flex h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activePage={activePage} setActivePage={setActivePage} darkMode={darkMode} />

      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <button className="md:hidden p-2 bg-blue-500 text-white rounded-lg" onClick={() => setSidebarOpen(true)}>
            <FaBars />
          </button>
          <h1 className="text-2xl font-bold dark:text-white">📅 My Calendar</h1>
        </div>

        <Calendar
          value={calendarDate}
          onChange={setCalendarDate}
          tileClassName={({ date, view }) =>
            view === "month" && events.map(ev => ev.start.toDateString()).includes(date.toDateString())
              ? "bg-blue-500 text-white rounded-full"
              : null
          }
          className="rounded-lg shadow-lg w-full max-w-md"
        />

        <div className="mt-4">
          {events
            .filter(ev => ev.start.toDateString() === calendarDate.toDateString())
            .map((ev, idx) => (
              <div key={idx} className="p-2 mb-2 rounded bg-blue-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                <p className="font-medium">{ev.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{ev.type}</p>
              </div>
            ))}
          {events.filter(ev => ev.start.toDateString() === calendarDate.toDateString()).length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 italic">No events</p>
          )}
        </div>
      </main>
    </div>
  );
}
