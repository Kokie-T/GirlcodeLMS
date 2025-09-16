import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function Overview() {
  const [stats, setStats] = useState({ learners: 0, facilitators: 0, courses: 0 });
  const [learnerGrowth, setLearnerGrowth] = useState([]);
  const [facilitatorGrowth, setFacilitatorGrowth] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const learnersSnap = await getDocs(collection(db, "learners"));
        const facilitatorsSnap = await getDocs(collection(db, "facilitators"));
        const coursesSnap = await getDocs(collection(db, "courses"));

        setStats({
          learners: learnersSnap.size,
          facilitators: facilitatorsSnap.size,
          courses: coursesSnap.size,
        });

        // Example growth data (replace with real timestamps later)
        setLearnerGrowth([
          { month: "Jan", count: 5 },
          { month: "Feb", count: 12 },
          { month: "Mar", count: 20 },
          { month: "Apr", count: 30 },
          { month: "May", count: learnersSnap.size },
        ]);

        setFacilitatorGrowth([
          { month: "Jan", count: 2 },
          { month: "Feb", count: 4 },
          { month: "Mar", count: 7 },
          { month: "Apr", count: 9 },
          { month: "May", count: facilitatorsSnap.size },
        ]);
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-transform hover:scale-105">
          <h3 className="text-lg font-semibold">Learners</h3>
          <p className="text-3xl font-bold">{stats.learners}</p>
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
        {/* Learner Growth */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-lg font-bold mb-4 text-gray-700">📈 Learner Growth</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={learnerGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3B82F6" // Blue
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
                stroke="#EC4899" // Pink
                strokeWidth={3}
                dot={{ r: 5, fill: "#EC4899" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
