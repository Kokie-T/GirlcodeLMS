import React, { useState } from "react";
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function FacilitatorDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("Dashboard");
  const [showProfile, setShowProfile] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("English");
  const [user, setUser] = useState({
    firstName: "Alex",
    lastName: "Johnson",
    email: "alex@example.com",
    bgColor: "#4F46E5",
  });

  const texts = {
    totalStudents: language === "English" ? "Total Students" : "Abafundi Bonke",
    pendingGrades: language === "English" ? "Pending Grades" : "Amamaki Alindile",
    activeCourses: language === "English" ? "Active Courses" : "Izifundo Ezisebenzayo",
    messagesCard: language === "English" ? "Messages" : "Imilayezo",
    recentActivity: language === "English" ? "Recent Activity" : "Umsebenzi Wakamuva",
    quickActions: language === "English" ? "Quick Actions" : "Izenzo Ezisheshayo",
    messages: language === "English" ? "Messages" : "Imilayezo",
    courses: language === "English" ? "Courses" : "Izifundo",
    grading: language === "English" ? "Grading" : "Ukubhala Amamaki",
    materials: language === "English" ? "Learning Materials" : "Izinto Zokufunda",
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      alert("Logged out!");
    }
  };

  return (
    <div className={`${darkMode ? "dark" : ""} flex h-screen bg-gray-50 dark:bg-gray-900`}>
      {/* Sidebar */}
      <div
        className={`fixed md:static top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col justify-between transform transition-transform duration-300 z-50
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div>
          <button className="md:hidden p-4 self-end text-xl" onClick={() => setIsSidebarOpen(false)}>
            <FaTimes />
          </button>

          <h2 className="text-xl font-bold text-center py-6 border-b dark:border-gray-700">
            LMS Pro <br />
            <span className="text-sm text-gray-500 dark:text-gray-300">Facilitator Portal</span>
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
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm bg-red-500 text-white hover:bg-red-600 rounded-lg"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <button className="md:hidden p-2 bg-blue-500 text-white rounded-lg" onClick={() => setIsSidebarOpen(true)}>
            <FaBars />
          </button>
          <input
            type="text"
            placeholder="Search..."
            className="flex-1 mx-4 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
          <button
            onClick={() => setShowProfile(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white"
            style={{ backgroundColor: user.bgColor }}
          >
            {user.firstName[0]}
            {user.lastName[0]}
          </button>
        </div>

        {activePage === "Dashboard" && <DashboardContent texts={texts} />}
        {activePage === "Messages" && <MessagesPage texts={texts} />}
        {activePage === "Courses" && <CourseManagementPage texts={texts} />}
        {activePage === "Grading" && <GradingPage texts={texts} />}
        {activePage === "Materials" && <LearningMaterialsPage texts={texts} />}
        {activePage === "Calendar" && <CalendarPage />}

        {showProfile && (
          <ProfilePopup
            user={user}
            setUser={setUser}
            close={() => setShowProfile(false)}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            language={language}
            setLanguage={setLanguage}
          />
        )}
      </div>
    </div>
  );
}

/* ------------------- Sidebar Item ------------------- */
const SidebarItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 w-full px-4 py-2 text-sm transition rounded-lg ${
      active ? "bg-blue-100 text-blue-600 font-semibold" : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
    }`}
  >
    {icon} {label}
  </button>
);

/* ------------------- Profile Popup ------------------- */
const ProfilePopup = ({ user, setUser, close, darkMode, setDarkMode, language, setLanguage }) => {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");
  const [bgColor, setBgColor] = useState(user.bgColor);

  const handleSave = () => {
    setUser({ ...user, firstName, lastName, email, bgColor });
    close();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Profile Settings</h2>
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
        <div className="flex gap-2 mb-2 items-center">
          <label className="dark:text-white">Background Color:</label>
          <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
        </div>
        <div className="flex gap-2 mb-2 items-center">
          <label className="dark:text-white">Dark Mode:</label>
          <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
        </div>
        <div className="mb-2">
          <label className="dark:text-white">Language:</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
          >
            <option value="English">English</option>
            <option value="isiZulu">isiZulu</option>
            <option value="Afrikaans">Afrikaans</option>
            <option value="Sesotho">Sesotho</option>
            <option value="Setswana">Setswana</option>
            {/* Add all SA languages as needed */}
          </select>
        </div>
        <button onClick={handleSave} className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:opacity-90">
          Save
        </button>
      </div>
    </div>
  );
};

/* ------------------- Dashboard ------------------- */
const DashboardContent = ({ texts }) => (
  <>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <StatCard number="127" label={texts.totalStudents} icon={<FaUsers />} color="text-blue-600" />
      <StatCard number="15" label={texts.pendingGrades} icon={<FaCheckSquare />} color="text-green-600" />
      <StatCard number="5" label={texts.activeCourses} icon={<FaBook />} color="text-yellow-600" />
      <StatCard number="8" label={texts.messagesCard} icon={<FaEnvelope />} color="text-purple-600" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow p-5">
        <h2 className="text-lg font-semibold mb-4">{texts.recentActivity}</h2>
        <ActivityItem title="New assignment submitted" subtitle="Data Science Project - Alex Johnson" />
        <ActivityItem title="New discussion post" subtitle="Question about ML algorithms" />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
        <h2 className="text-lg font-semibold mb-4">{texts.quickActions}</h2>
        <ActionButton color="bg-blue-600" text="Post New Material" />
        <ActionButton color="bg-green-600" text="Grade Assignments" />
        <ActionButton color="bg-purple-600" text="Send Announcement" />
      </div>
    </div>
  </>
);

/* ------------------- Messages ------------------- */
const MessagesPage = ({ texts }) => {
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
      <h2 className="text-lg font-semibold mb-4">{texts.messages}</h2>
      <div className="flex gap-4 border-b mb-4 dark:border-gray-700">
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
        <button className="bg-blue-500 text-white px-4 rounded">Send</button>
      </div>
    </div>
  );
};

/* ------------------- Course Management ------------------- */
const CourseManagementPage = ({ texts }) => {
  const [courseName, setCourseName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [testDrafts, setTestDrafts] = useState(["Draft test 1", "Draft test 2"]);
  const [quizTopic, setQuizTopic] = useState("");
  const [quizzes, setQuizzes] = useState(["AI quiz 1", "AI quiz 2"]);

  const handleGenerateQuiz = () => {
    const aiQuiz = `AI-generated quiz on ${quizTopic}: Q1, Q2, Q3`;
    setQuizzes([...quizzes, aiQuiz]);
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">{texts.courses}</h2>
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-6">
        <input
          type="text"
          placeholder="Course Name"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          className="block w-full p-2 border mb-2 dark:bg-gray-700 dark:text-white dark:border-gray-600"
        />
        <textarea
          placeholder="Course Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="block w-full p-2 border mb-2 dark:bg-gray-700 dark:text-white dark:border-gray-600"
        ></textarea>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} className="mb-2" />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => alert(`Course '${courseName}' uploaded!`)}
        >
          Upload
        </button>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-6">
        <button
          className="bg-green-500 text-white px-4 py-2 rounded mb-2"
          onClick={() => setTestDrafts([...testDrafts, `Draft test for ${courseName}`])}
        >
          ➕ Add Draft Test
        </button>
        <ul>
          {testDrafts.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
        <input
          type="text"
          placeholder="Enter topic"
          value={quizTopic}
          onChange={(e) => setQuizTopic(e.target.value)}
          className="block w-full p-2 border mb-2 dark:bg-gray-700 dark:text-white dark:border-gray-600"
        />
        <button
          className="bg-purple-500 text-white px-4 py-2 rounded mb-2"
          onClick={handleGenerateQuiz}
        >
          ✨ Generate AI Quiz
        </button>
        <ul>
          {quizzes.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

/* ------------------- Grading ------------------- */
const GradingPage = ({ texts }) => {
  const gradingData = [
    { student: "Alex Johnson", course: "Data Science", assignment: "Project 1", marks: 85, progress: 80 },
    { student: "Maria Gomez", course: "Machine Learning", assignment: "Quiz 1", marks: 92, progress: 70 },
    { student: "Alice Brown", course: "Python Basics", assignment: "Assignment 2", marks: 78, progress: 50 },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-4">{texts.grading}</h2>
      <table className="w-full mb-4 border-collapse border dark:border-gray-700">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700">
            <th className="border px-2 py-1">Student</th>
            <th className="border px-2 py-1">Course</th>
            <th className="border px-2 py-1">Assignment</th>
            <th className="border px-2 py-1">Marks (%)</th>
            <th className="border px-2 py-1">Progress</th>
          </tr>
        </thead>
        <tbody>
          {gradingData.map((g, i) => (
            <tr key={i} className="odd:bg-gray-50 dark:odd:bg-gray-900">
              <td className="border px-2 py-1">{g.student}</td>
              <td className="border px-2 py-1">{g.course}</td>
              <td className="border px-2 py-1">{g.assignment}</td>
              <td className="border px-2 py-1">{g.marks}</td>
              <td className="border px-2 py-1">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded h-3">
                  <div className="bg-blue-500 h-3 rounded" style={{ width: `${g.progress}%` }}></div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3 className="font-semibold mb-2 dark:text-white">Course Completion Overview</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={gradingData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
          <XAxis dataKey="course" stroke="#8884d8" />
          <YAxis stroke="#8884d8" />
          <Tooltip />
          <Bar dataKey="progress" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

/* ------------------- Learning Materials ------------------- */
const LearningMaterialsPage = ({ texts }) => {
  const materials = [
    { name: "Introduction to Python", type: "PDF", date: "2025-09-01", completion: 80 },
    { name: "ML Algorithms", type: "Video", date: "2025-09-03", completion: 60 },
    { name: "Data Science Project", type: "PDF", date: "2025-09-05", completion: 50 },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-4">{texts.materials}</h2>
      <table className="w-full mb-4 border-collapse border dark:border-gray-700">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700">
            <th className="border px-2 py-1">Material</th>
            <th className="border px-2 py-1">Type</th>
            <th className="border px-2 py-1">Upload Date</th>
            <th className="border px-2 py-1">Completion</th>
          </tr>
        </thead>
        <tbody>
          {materials.map((m, i) => (
            <tr key={i} className="odd:bg-gray-50 dark:odd:bg-gray-900">
              <td className="border px-2 py-1">{m.name}</td>
              <td className="border px-2 py-1">{m.type}</td>
              <td className="border px-2 py-1">{m.date}</td>
              <td className="border px-2 py-1">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded h-3">
                  <div className="bg-green-500 h-3 rounded" style={{ width: `${m.completion}%` }}></div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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

/* ------------------- Helpers ------------------- */
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
  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border mb-2 border-gray-200 dark:border-gray-700">
    <p className="font-medium dark:text-white">{title}</p>
    <p className="text-sm text-gray-600 dark:text-gray-300">{subtitle}</p>
  </div>
);

const ActionButton = ({ color, text }) => (
  <button className={`${color} w-full py-2 text-white rounded-lg hover:opacity-90 transition mb-2`}>{text}</button>
);

const MessageItem = ({ sender, text }) => (
  <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded-lg border mb-1 border-gray-200 dark:border-gray-700">
    <p className="font-semibold dark:text-white">{sender}</p>
    <p className="text-sm text-gray-600 dark:text-gray-300">{text}</p>
  </div>
);
