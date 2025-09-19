import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function Overview() {
  const [stats, setStats] = useState({ students: 0, facilitators: 0, courses: 0 });
  const [studentGrowth, setStudentGrowth] = useState([]);
  const [facilitatorGrowth, setFacilitatorGrowth] = useState([]);
  const [roleDistribution, setRoleDistribution] = useState([]);
  const [events, setEvents] = useState([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Users and Courses stats
        const usersSnap = await getDocs(collection(db, "users"));
        const coursesSnap = await getDocs(collection(db, "courses"));
        const users = usersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const students = users.filter((u) => u.role === "student");
        const facilitators = users.filter((u) => u.role === "facilitator");

        setStats({
          students: students.length,
          facilitators: facilitators.length,
          courses: coursesSnap.size,
        });

        // Example growth data
        setStudentGrowth([
          { month: "Jan", count: 5 },
          { month: "Feb", count: 12 },
          { month: "Mar", count: 20 },
          { month: "Apr", count: 30 },
          { month: "May", count: students.length },
        ]);

        setFacilitatorGrowth([
          { month: "Jan", count: 2 },
          { month: "Feb", count: 4 },
          { month: "Mar", count: 7 },
          { month: "Apr", count: 9 },
          { month: "May", count: facilitators.length },
        ]);

        setRoleDistribution([
          { name: "Students", value: students.length },
          { name: "Facilitators", value: facilitators.length },
          { name: "Admins", value: users.filter((u) => u.role === "admin").length },
        ]);

        // Fetch upcoming events (limit 5, order by date)
        const eventsSnap = await getDocs(
          query(collection(db, "events"), orderBy("date", "asc"), limit(5))
        );
        setEvents(
          eventsSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date?.toDate?.() || new Date(), // safe conversion
          }))
        );

        // Fetch recent messages (limit 5, order by timestamp)
        const messagesSnap = await getDocs(
          query(collection(db, "messages"), orderBy("timestamp", "desc"), limit(5))
        );
        setMessages(
          messagesSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate?.() || new Date(),
          }))
        );
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    fetchStats();
  }, []);

  const pieColors = ["#3B82F6", "#EC4899", "#10B981"]; // Blue, Pink, Green

  // Format date nicely
  const formatDate = (d) => {
    if (!d) return "";
    const options = { day: "numeric", month: "short", year: "numeric" };
    return new Date(d).toLocaleDateString(undefined, options);
  };

  return (
    <div className="space-y-8">
      {/* Events & Messages Preview */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-lg font-bold mb-4 text-gray-700">📅 Upcoming Events</h3>
          {events.length === 0 ? (
            <p className="text-gray-500">No upcoming events.</p>
          ) : (
            <ul className="space-y-3">
              {events.map((event) => (
                <li key={event.id} className="border-b py-2 text-gray-700">
                  <p className="font-semibold">{event.title || "Untitled Event"}</p>
                  <p className="text-sm text-gray-500">{formatDate(event.date)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Messages */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-lg font-bold mb-4 text-gray-700">✉️ Recent Messages</h3>
          {messages.length === 0 ? (
            <p className="text-gray-500">No messages.</p>
          ) : (
            <ul className="space-y-3">
              {messages.map((msg) => (
                <li key={msg.id} className="border-b py-2 text-gray-700">
                  <p className="font-semibold">{msg.sender || "Unknown"}</p>
                  <p className="text-sm text-gray-500">{msg.content || "No content"}</p>
                  <p className="text-xs text-gray-400">{formatDate(msg.timestamp)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-transform hover:scale-105">
          <h3 className="text-lg font-semibold">Students</h3>
          <p className="text-3xl font-bold">{stats.students}</p>
        </div>
        <div className="bg-gradient-to-r from-pink-500 to-pink-700 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-transform hover:scale-105">
          <h3 className="text-lg font-semibold">Facilitators</h3>
          <p className="text-3xl font-bold">{stats.facilitators}</p>
        </div>
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-transform hover:scale-105">
          <h3 className="text-lg font-semibold">Courses</h3>
          <p className="text-3xl font-bold">{stats.courses}</p>
        </div>
      </div>

      {/* Growth Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Student Growth */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-lg font-bold mb-4 text-gray-700">📈 Student Growth</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={studentGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ r: 5, fill: "#3B82F6" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Facilitator Growth */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-lg font-bold mb-4 text-gray-700">📊 Facilitator Growth</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={facilitatorGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#EC4899"
                strokeWidth={3}
                dot={{ r: 5, fill: "#EC4899" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Role Distribution Pie Chart */}
      <div className="bg-white rounded-2xl shadow p-6 w-full md:w-1/2">
        <h3 className="text-lg font-bold mb-4 text-gray-700">🎯 Role Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={roleDistribution}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label
            >
              {roleDistribution.map((entry, index) => (
                <Cell key={index} fill={pieColors[index % pieColors.length]} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
