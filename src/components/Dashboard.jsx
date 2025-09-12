// Dashboard.jsx
import React, { useEffect, useState } from "react";
import { FaUsers, FaCheckSquare, FaBook, FaEnvelope } from "react-icons/fa";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { auth, db } from "../firebase"; // adjust your firebase import
import toast from "react-hot-toast";

const Dashboard = ({setActivePage}) => {
  const [totalLearners, setTotalLearners] = useState(0);
  const [activeCourses, setActiveCourses] = useState(0);
  const [pendingGrades, setPendingGrades] = useState(0);
  const [messages, setMessages] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const facilitatorId = auth.currentUser.uid;

        // Total learners
        const usersSnapshot = await getDocs(collection(db, "Users"));
        setTotalLearners(usersSnapshot.docs.length);

        // Active courses
        const coursesSnapshot = await getDocs(collection(db, "Courses"));
        setActiveCourses(coursesSnapshot.docs.length);

        // Pending grades (example: submissions with graded = false)
        const submissionsSnapshot = await getDocs(
          query(collection(db, "Submissions"), where("graded", "==", false))
        );
        setPendingGrades(submissionsSnapshot.docs.length);

        // Unread messages for this facilitator
        const messagesSnapshot = await getDocs(
          query(collection(db, "Conversations"), where("recipientId", "==", facilitatorId), where("read", "==", false))
        );
        setMessages(messagesSnapshot.docs.length);

        // Recent activity (latest 5 announcements)
        const announcementsSnapshot = await getDocs(
          query(collection(db, "Announcements"), orderBy("timestamp", "desc"), limit(5))
        );
        const recent = announcementsSnapshot.docs.map((doc) => ({
          title: doc.data().title,
          subtitle: doc.data().description || "",
        }));
        setRecentActivity(recent);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
      
    };

    fetchData();
  }, []);

  const stats = [
    { number: totalLearners, label: "Total Students", icon: <FaUsers />, color: "text-blue-600" },
    { number: pendingGrades, label: "Pending Grades", icon: <FaCheckSquare />, color: "text-green-600" },
    { number: activeCourses, label: "Active Courses", icon: <FaBook />, color: "text-yellow-600" },
    { number: messages, label: "Messages", icon: <FaEnvelope />, color: "text-purple-600" },
  ];

  const quickActions = [
    { text: "Post New Material", color: "bg-blue-600",page: "Materials"},
    { text: "Grade Assignments", color: "bg-green-600",page: "Grading"},
    { text: "Send Announcement", color: "bg-purple-600",page: "Announcements"},
  ];
  const handleAction = (action) => {
    toast.success(`Navigating to ${action.text}...`);
    setActivePage(action.page);
  };

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow p-5">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">Recent Activity</h2>
          {recentActivity.length > 0 ? (
            recentActivity.map((act, i) => <ActivityItem key={i} {...act} />)
          ) : (
            <p className="dark:text-white">No recent activity.</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">Quick Actions</h2>
          {quickActions.map((action, i) => (
            <ActionButton 
            key={i}
            {...action}
            onClick={() => handleAction(action)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ------------------- Helper Components -------------------
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

const ActionButton = ({ color, text, onClick }) => (
  <button
    onClick={onClick}
    className={`${color} w-full py-2 text-white rounded-lg hover:opacity-90 transition mb-2`}
  >
    {text}
  </button>
);


export default Dashboard;
