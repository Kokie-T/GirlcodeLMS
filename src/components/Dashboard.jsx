import React, { useEffect, useState } from "react";
import { FaUsers, FaCheckSquare, FaBook, FaEnvelope } from "react-icons/fa";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import toast from "react-hot-toast";

const Dashboard = ({ setActivePage }) => {
  const [totalStudents, setTotalStudents] = useState(0);
  const [activeCourses, setActiveCourses] = useState(0);
  const [pendingGrades, setPendingGrades] = useState(0);
  const [messages, setMessages] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);

  useEffect(() => {
    // Total students
    const q = query(collection(db, "users"), where("role", "==", "student"));
    const unsub = onSnapshot(q, (snap) => setTotalStudents(snap.size));
    return () => unsub();
  }, []);

  useEffect(() => {
    // Active courses
    const unsub = onSnapshot(collection(db, "courses"), (snap) => setActiveCourses(snap.size));
    return () => unsub();
  }, []);

  useEffect(() => {
    // Pending grades
    const q = query(collection(db, "Submissions"), where("graded", "==", false));
    const unsub = onSnapshot(q, (snap) => setPendingGrades(snap.size));
    return () => unsub();
  }, []);

  useEffect(() => {
    // Recent announcements
    const q = query(collection(db, "announcements"), orderBy("timestamp", "desc"), limit(5));
    const unsub = onSnapshot(q, (snap) => 
      setRecentActivity(snap.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        subtitle: doc.data().description || "",
        timestamp: doc.data().timestamp?.toDate() || new Date(0),
        type: "announcement"
      })))
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    // Upcoming calendar events from today
    const today = new Date().toISOString().split("T")[0];
    const q = query(collection(db, "events"), where("date", ">=", today), orderBy("date", "asc"), limit(5));
    const unsub = onSnapshot(q, (snap) =>
      setCalendarEvents(snap.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        subtitle: `Event Date: ${doc.data().date}`,
        timestamp: new Date(doc.data().date),
        type: "event"
      })))
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!auth.currentUser) return;
    const facilitatorId = auth.currentUser.uid;
    const convQ = query(collection(db, "conversations"), where("participants", "array-contains", facilitatorId));
    let unsubFuncs = [];
    
    const unsub = onSnapshot(convQ, (convSnap) => {
      let totalUnread = 0;
      unsubFuncs.forEach(unsub => unsub());
      unsubFuncs = [];
      convSnap.docs.forEach((convDoc) => {
        const msgsRef = collection(db, "conversations", convDoc.id, "messages");
        const unreadQ = query(msgsRef, where("seen", "==", false), where("senderId", "!=", facilitatorId));
        const unsubUnread = onSnapshot(unreadQ, (unreadSnap) => {
          totalUnread += unreadSnap.size;
          setMessages(totalUnread);
        });
        unsubFuncs.push(unsubUnread);
      });
    });

    return () => {
      unsub();
      unsubFuncs.forEach(unsub => unsub());
    };
  }, []);

  // Merge announcements and events
  const combinedActivities = [...recentActivity, ...calendarEvents]
    .sort((a, b) => b.timestamp - a.timestamp);

  const stats = [
    { number: totalStudents, label: "Total Students", icon: <FaUsers />, color: "text-black" },
    { number: pendingGrades, label: "Pending Grades", icon: <FaCheckSquare />, color: "text-black" },
    { number: activeCourses, label: "Active Courses", icon: <FaBook />, color: "text-black" },
    { number: messages, label: "Messages", icon: <FaEnvelope />, color: "text-black" },
  ];

  const quickActions = [
    { text: "Post New Material", color: "bg-gradient-to-r from-blue-400 to-pink-400 text-white font-semibold", page: "Course Management" },
    { text: "Grade Assignments", color: "bg-gradient-to-r from-blue-400 to-pink-400 text-white font-semibold", page: "Grading" },
    { text: "Send Announcement", color: "bg-gradient-to-r from-blue-400 to-pink-400 text-white font-semibold", page: "Calendar" },
    { text: "Enroll Student", color: "bg-gradient-to-r from-blue-400 to-pink-400 text-white font-semibold", page: "Enroll Student" },
  ];

  const handleAction = (action) => {
    toast.success(`Navigating to ${action.text}...`);
    setActivePage(action.page);
  };

  return (
    <div>
      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* To-Do List with pulse glow animation */}
        <div 
          className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-5 pulse-glow"
          style={{ boxShadow: "0 4px 15px -5px rgb(59 130 246 / 0.75), 0 7px 30px -10px rgb(236 72 153 / 0.75)" }}
        >
          <h2 className="text-lg font-semibold mb-4 dark:text-white">Events</h2>
          {combinedActivities.length > 0 ? (
            combinedActivities.map((act) => (
              <ActivityItem key={act.id} title={act.title} subtitle={act.subtitle} />
            ))
          ) : (
            <p className="dark:text-white">No to-do items found.</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">Quick Actions</h2>
          {quickActions.map((action, i) => (
            <ActionButton key={i} {...action} onClick={() => handleAction(action)} />
          ))}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ number, label, icon, color }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 flex items-center justify-between transform transition-transform hover:scale-105">
    <div>
      <p className={`text-2xl font-bold ${color}`}>{number}</p>
      <p className="text-sm text-gray-600 dark:text-gray-300">{label}</p>
    </div>
    <div className="text-3xl text-gray-400">{icon}</div>
  </div>
);

const ActivityItem = ({ title, subtitle }) => (
  <div className="p-3 rounded-lg border mb-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
    <p>{title}</p>
    <p className="text-sm text-gray-600 dark:text-gray-300">{subtitle}</p>
  </div>
);

const ActionButton = ({ color, text, onClick }) => (
  <button
    onClick={onClick}
    className={`${color} w-full py-2 text-white rounded-lg hover:opacity-90 transition mb-2`}
  >
    {text}
  </button>
);

export default Dashboard;
