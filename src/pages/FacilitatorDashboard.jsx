import React, { useState, useEffect } from "react";
import {
  FaTachometerAlt,
  FaEnvelope,
  FaUser,
  FaBook,
  FaCheckSquare,
  FaFileAlt,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUsers,
  FaCalendarAlt,
} from "react-icons/fa";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function FacilitatorDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("Dashboard");
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("English");
  const [profilePopup, setProfilePopup] = useState(false);
  const [profileColor, setProfileColor] = useState("#4F46E5");
  const [firstName, setFirstName] = useState("John");
  const [lastName, setLastName] = useState("Doe");
  const [email, setEmail] = useState("johndoe@example.com");
  const [password, setPassword] = useState("password123");

  // Toggle dark mode on body
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  const texts = {
    dashboard: "Dashboard",
    messages: "Messages",
    courses: "Course Management",
    grading: "Grading",
    materials: "Learning Materials",
    calendar: "Calendar",
    settings: "Settings",
  };

  return (
    <div className={`flex h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Sidebar */}
      <div
        className={`fixed md:static top-0 left-0 h-full w-64 
          bg-white dark:bg-gray-800 shadow-lg flex flex-col justify-between transform transition-transform duration-300 z-50
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div>
          <button
            className="md:hidden p-4 self-end text-xl"
            onClick={() => setIsSidebarOpen(false)}
          >
            <FaTimes className={darkMode ? "text-white" : ""} />
          </button>

          <h2 className="text-xl font-bold text-center py-6 border-b dark:border-gray-700 dark:text-white">
            LMS Pro <br />
            <span className="text-sm text-gray-500 dark:text-gray-300">
              Facilitator Portal
            </span>
          </h2>

          <nav className="mt-6 space-y-2">
            <SidebarItem
              icon={<FaTachometerAlt />}
              label="Dashboard"
              active={activePage === "Dashboard"}
              onClick={() => setActivePage("Dashboard")}
            />
            <SidebarItem
              icon={<FaEnvelope />}
              label="Messages"
              active={activePage === "Messages"}
              onClick={() => setActivePage("Messages")}
            />
            <SidebarItem
              icon={<FaBook />}
              label="Course Management"
              active={activePage === "Courses"}
              onClick={() => setActivePage("Courses")}
            />
            <SidebarItem
              icon={<FaCheckSquare />}
              label="Grading"
              active={activePage === "Grading"}
              onClick={() => setActivePage("Grading")}
            />
            <SidebarItem
              icon={<FaFileAlt />}
              label="Learning Materials"
              active={activePage === "Materials"}
              onClick={() => setActivePage("Materials")}
            />
            <SidebarItem
              icon={<FaCalendarAlt />}
              label="Calendar"
              active={activePage === "Calendar"}
              onClick={() => setActivePage("Calendar")}
            />
          </nav>
        </div>

        <div className="p-4 border-t dark:border-gray-700">
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to logout?")) {
                alert("Logged out!");
              }
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm bg-red-500 text-white hover:bg-red-600 rounded-lg"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            className="md:hidden p-2 bg-blue-500 text-white rounded-lg"
            onClick={() => setIsSidebarOpen(true)}
          >
            <FaBars />
          </button>
          <input
            type="text"
            placeholder="Search..."
            className="flex-1 mx-4 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: profileColor }}
            onClick={() => setProfilePopup(true)}
          >
            {firstName[0]}
            {lastName[0]}
          </button>
        </div>

        {profilePopup && (
          <ProfilePopup
            firstName={firstName}
            lastName={lastName}
            setFirstName={setFirstName}
            setLastName={setLastName}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            language={language}
            setLanguage={setLanguage}
            profileColor={profileColor}
            setProfileColor={setProfileColor}
            close={() => setProfilePopup(false)}
          />
        )}

        {activePage === "Dashboard" && <DashboardContent />}
        {activePage === "Messages" && <MessagesPage />}
        {activePage === "Courses" && <CourseManagementPage texts={texts} />}
        {activePage === "Grading" && <GradingPage texts={texts} />}
        {activePage === "Materials" && <LearningMaterialsPage texts={texts} />}
        {activePage === "Calendar" && <CalendarPage />}
      </div>
    </div>
  );
}

/* ------------------- Sidebar Item ------------------- */
const SidebarItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 w-full px-4 py-2 text-sm transition rounded-lg ${
      active
        ? "bg-blue-100 text-blue-600 font-semibold"
        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
    }`}
  >
    {icon} {label}
  </button>
);

/* ------------------- Profile Popup ------------------- */
const ProfilePopup = ({
  firstName,
  lastName,
  setFirstName,
  setLastName,
  email,
  setEmail,
  password,
  setPassword,
  darkMode,
  setDarkMode,
  language,
  setLanguage,
  profileColor,
  setProfileColor,
  close,
}) => {
  const languages = [
    "English",
    "Afrikaans",
    "Zulu",
    "Xhosa",
    "Sesotho",
    "Sepedi",
    "Tswana",
    "Venda",
    "Tsonga",
    "Swazi",
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96 relative">
        <button
          className="absolute top-2 right-2 text-gray-500 dark:text-gray-200"
          onClick={close}
        >
          <FaTimes />
        </button>
        <h2 className="text-lg font-semibold mb-4 dark:text-white">
          Update Profile
        </h2>
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full p-2 mb-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full p-2 mb-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
        />
        <label className="flex items-center gap-2 mb-2 dark:text-white">
          <input
            type="checkbox"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
          />{" "}
          Dark Mode
        </label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full p-2 mb-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
        >
          {languages.map((lang, i) => (
            <option key={i}>{lang}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 mb-4 dark:text-white">
          Avatar Background Color:
          <input
            type="color"
            value={profileColor}
            onChange={(e) => setProfileColor(e.target.value)}
          />
        </label>
        <button
          onClick={close}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:opacity-90"
        >
          Save
        </button>
      </div>
    </div>
  );
};

/* ------------------- Dashboard ------------------- */
const DashboardContent = () => (
  <>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <StatCard number="127" label="Total Students" icon={<FaUsers />} color="text-blue-600" />
      <StatCard number="15" label="Pending Grades" icon={<FaCheckSquare />} color="text-green-600" />
      <StatCard number="5" label="Active Courses" icon={<FaBook />} color="text-yellow-600" />
      <StatCard number="8" label="Messages" icon={<FaEnvelope />} color="text-purple-600" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow p-5">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">Recent Activity</h2>
        <ActivityItem title="New assignment submitted" subtitle="Data Science Project - Alex Johnson" />
        <ActivityItem title="New discussion post" subtitle="Question about ML algorithms" />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">Quick Actions</h2>
        <ActionButton color="bg-blue-600" text="Post New Material" />
        <ActionButton color="bg-green-600" text="Grade Assignments" />
        <ActionButton color="bg-purple-600" text="Send Announcement" />
      </div>
    </div>
  </>
);

/* ------------------- Messages ------------------- */
const MessagesPage = () => {
  const [activeTab, setActiveTab] = useState("Private");
  const [newMessage, setNewMessage] = useState("");

  const privateMessages = [
    { sender: "Alex Johnson", text: "Hello, I need help with the assignment." },
    { sender: "Maria Gomez", text: "Can you check my quiz submission?" },
  ];

  const discussionMessages = [
    { sender: "System", text: "📢 Announcement: Midterm exam will be held on Sept 20." },
    { sender: "Alice Brown", text: "Hey everyone, can we form a study group?" },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4 dark:text-white">Messages</h2>
      <div className="flex gap-4 border-b mb-4 border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab("Private")}
          className={`pb-2 ${activeTab === "Private" ? "border-b-2 border-blue-500 font-semibold" : "text-gray-400 dark:text-gray-300"}`}
        >
          Private Messages
        </button>
        <button
          onClick={() => setActiveTab("Discussion")}
          className={`pb-2 ${activeTab === "Discussion" ? "border-b-2 border-blue-500 font-semibold" : "text-gray-400 dark:text-gray-300"}`}
        >
          Discussion Room
        </button>
        <button className="ml-auto p-2 bg-green-500 text-white rounded hover:opacity-90">
          👥 View Students
        </button>
      </div>
      <div className="space-y-4 h-64 overflow-y-auto mb-4">
        {activeTab === "Private" &&
          privateMessages.map((msg, i) => <MessageItem key={i} sender={msg.sender} text={msg.text} />)}
        {activeTab === "Discussion" &&
          discussionMessages.map((msg, i) => <MessageItem key={i} sender={msg.sender} text={msg.text} />)}
      </div>
      <div className="flex space-x-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
        />
        <button className="bg-blue-500 text-white px-4 rounded hover:opacity-90">Send</button>
      </div>
    </div>
  );
};

/* ------------------- Course Management ------------------- */
const CourseManagementPage = () => {
  const [courses, setCourses] = useState([
    { name: "Data Science", description: "Intro to Data Science", files: ["lesson1.pdf", "lesson2.pdf"] },
    { name: "React JS", description: "Frontend Framework", files: ["react1.pdf", "react2.pdf"] },
  ]);

  const [newCourse, setNewCourse] = useState({ name: "", description: "", files: [] });

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 dark:text-white">Course Management</h2>
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-6">
        <input
          type="text"
          placeholder="Course Name"
          value={newCourse.name}
          onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
          className="block w-full p-2 mb-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
        />
        <textarea
          placeholder="Course Description"
          value={newCourse.description}
          onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
          className="block w-full p-2 mb-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
        />
        <input
          type="file"
          multiple
          onChange={(e) =>
            setNewCourse({ ...newCourse, files: Array.from(e.target.files).map((f) => f.name) })
          }
          className="mb-2"
        />
        <button
          onClick={() => {
            setCourses([...courses, newCourse]);
            setNewCourse({ name: "", description: "", files: [] });
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:opacity-90"
        >
          Upload Course
        </button>
      </div>
      <div>
        {courses.map((c, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-4">
            <h3 className="font-semibold dark:text-white">{c.name}</h3>
            <p className="dark:text-gray-300">{c.description}</p>
            <ul className="list-disc pl-5 text-sm dark:text-gray-300">
              {c.files.map((f, fi) => (
                <li key={fi}>{f}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ------------------- Grading ------------------- */
const GradingPage = () => {
  const [grades, setGrades] = useState([
    { student: "Alex Johnson", course: "Data Science", marks: 87 },
    { student: "Maria Gomez", course: "React JS", marks: 92 },
    { student: "John Doe", course: "Data Science", marks: 78 },
  ]);

  const courseProgress = [
    { name: "Data Science", progress: 70 },
    { name: "React JS", progress: 50 },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 dark:text-white">Grading</h2>
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-6 overflow-x-auto">
        <table className="min-w-full text-left border dark:border-gray-700">
          <thead>
            <tr>
              <th className="border-b px-4 py-2 dark:border-gray-700 dark:text-white">Student</th>
              <th className="border-b px-4 py-2 dark:border-gray-700 dark:text-white">Course</th>
              <th className="border-b px-4 py-2 dark:border-gray-700 dark:text-white">Marks</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((g, i) => (
              <tr key={i}>
                <td className="border-b px-4 py-2 dark:border-gray-700 dark:text-gray-300">{g.student}</td>
                <td className="border-b px-4 py-2 dark:border-gray-700 dark:text-gray-300">{g.course}</td>
                <td className="border-b px-4 py-2 dark:border-gray-700 dark:text-gray-300">{g.marks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
        <h3 className="font-semibold mb-2 dark:text-white">Course Progress</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={courseProgress}>
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#555" : "#ccc"} />
            <XAxis dataKey="name" stroke={darkMode ? "#fff" : "#000"} />
            <YAxis stroke={darkMode ? "#fff" : "#000"} />
            <Tooltip />
            <Bar dataKey="progress" fill="#4F46E5" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

/* ------------------- Learning Materials ------------------- */
const LearningMaterialsPage = () => {
  const [materials, setMaterials] = useState([
    { title: "Introduction to Data Science", type: "PDF" },
    { title: "React Components", type: "Video" },
  ]);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 dark:text-white">Learning Materials</h2>
      {materials.map((m, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-4">
          <p className="font-semibold dark:text-white">{m.title}</p>
          <p className="text-sm dark:text-gray-300">{m.type}</p>
        </div>
      ))}
    </div>
  );
};

/* ------------------- Calendar ------------------- */
const CalendarPage = () => {
  const [date, setDate] = useState(new Date());
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-4 dark:text-white">Calendar</h2>
      <Calendar onChange={setDate} value={date} className="dark:bg-gray-700" />
    </div>
  );
};

/* ------------------- Helper Components ------------------- */
const StatCard = ({ number, label, icon, color }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 flex items-center justify-between">
    <div>
      <p className={`text-2xl font-bold ${color}`}>{number}</p>
      <p className="text-sm text-gray-600 dark:text-gray-300">{label}</p>
    </div>
    <div className="text-3xl text-gray-400">{icon}</div>
  </div>
);

const ActivityItem = ({ title, subtitle }) => (
  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border mb-2 border-gray-200 dark:border-gray-600">
    <p className="font-medium dark:text-white">{title}</p>
    <p className="text-sm text-gray-600 dark:text-gray-300">{subtitle}</p>
  </div>
);

const ActionButton = ({ color, text }) => (
  <button className={`${color} w-full py-2 text-white rounded-lg hover:opacity-90 transition mb-2`}>
    {text}
  </button>
);

const MessageItem = ({ sender, text }) => (
  <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg border mb-1 border-gray-200 dark:border-gray-600">
    <p className="font-semibold dark:text-white">{sender}</p>
    <p className="text-sm text-gray-600 dark:text-gray-300">{text}</p>
  </div>
);
