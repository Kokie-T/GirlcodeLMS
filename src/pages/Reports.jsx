import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [newReport, setNewReport] = useState({
    title: "",
    content: "",
  });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | student | facilitator
  const [updatingId, setUpdatingId] = useState(null);

  // Fetch reports
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const snapshot = await getDocs(collection(db, "reports"));
        setReports(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error fetching reports:", err);
      }
    };
    fetchReports();
  }, []);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        const filtered = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(filtered);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, []);

  // Add new report manually
  const addReport = async () => {
    if (!newReport.title || !newReport.content) {
      alert("Please enter title and content");
      return;
    }
    try {
      const docRef = await addDoc(collection(db, "reports"), {
        ...newReport,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      setReports((prev) => [
        { id: docRef.id, ...newReport, status: "pending", createdAt: new Date() },
        ...prev,
      ]);
      setNewReport({ title: "", content: "" });
    } catch (err) {
      console.error("Error adding report:", err);
    }
  };

  // Delete report
  const deleteReport = async (id) => {
    try {
      await deleteDoc(doc(db, "reports", id));
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Error deleting report:", err);
    }
  };

  // Update report status
  const updateStatus = async (id, newStatus) => {
    try {
      setUpdatingId(id);
      await updateDoc(doc(db, "reports", id), { status: newStatus });
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Auto-generate report for a specific user
  const generateReportForUser = async (userId) => {
    try {
      const user = users.find((u) => u.id === userId);
      if (!user) return;

      const docRef = await addDoc(collection(db, "reports"), {
        title: `Progress Report - ${user.firstName} ${user.lastName}`,
        content: `This is an auto-generated report for ${user.firstName} ${user.lastName} (${user.role}).`,
        userId: user.id,
        role: user.role,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setReports((prev) => [
        {
          id: docRef.id,
          title: `Progress Report - ${user.firstName} ${user.lastName}`,
          content: `This is an auto-generated report for ${user.firstName} ${user.lastName} (${user.role}).`,
          userId: user.id,
          role: user.role,
          status: "pending",
          createdAt: new Date(),
        },
        ...prev,
      ]);
    } catch (err) {
      console.error("Error generating report:", err);
    }
  };

  // Filtering + Searching
  const filteredReports = reports.filter((r) => {
    const matchesRole =
      filter === "all" || (r.role && r.role.toLowerCase() === filter);
    const matchesSearch =
      search === "" ||
      (r.title && r.title.toLowerCase().includes(search.toLowerCase())) ||
      (r.content && r.content.toLowerCase().includes(search.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Reports</h2>

      {/* Add report manually */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="font-semibold mb-2">Add New Report</h3>
        <input
          type="text"
          placeholder="Report Title"
          value={newReport.title}
          onChange={(e) =>
            setNewReport((prev) => ({ ...prev, title: e.target.value }))
          }
          className="border p-2 rounded w-full mb-2"
        />
        <textarea
          placeholder="Report Content"
          value={newReport.content}
          onChange={(e) =>
            setNewReport((prev) => ({ ...prev, content: e.target.value }))
          }
          className="border p-2 rounded w-full mb-2"
        />
        <button
          onClick={addReport}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Report
        </button>
      </div>

      {/* Auto-generate progress reports */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="font-semibold mb-2">Auto-generate Progress Reports</h3>

        {users.length === 0 && <p>No students or facilitators found.</p>}

        {users.map((u) => (
          <div key={u.id} className="flex items-center gap-2 mb-1">
            <span>
              {u.firstName} {u.lastName} ({u.role})
            </span>
            <button
              onClick={() => generateReportForUser(u.id)}
              className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
            >
              Generate Report
            </button>
          </div>
        ))}

        <button
          onClick={() => users.forEach((u) => generateReportForUser(u.id))}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 mt-2"
        >
          Generate All Reports
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Search reports..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-64"
        />
        {["all", "student", "facilitator"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition ${
              filter === type
                ? "bg-indigo-500 text-white"
                : "bg-white text-gray-700 hover:bg-indigo-100"
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Reports list */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">All Reports</h3>
        {filteredReports.length === 0 && <p>No reports found.</p>}
        <ul>
          {filteredReports.map((r) => (
            <li
              key={r.id}
              className="border-b py-2 flex justify-between items-center"
            >
              <div>
                <strong>{r.title}</strong>
                <p className="text-sm text-gray-600">{r.content}</p>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    r.status === "resolved"
                      ? "bg-green-100 text-green-700"
                      : r.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {r.status || "pending"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  disabled={updatingId === r.id}
                  value={r.status || "pending"}
                  onChange={(e) => updateStatus(r.id, e.target.value)}
                  className="px-2 py-1 rounded border text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="resolved">Resolved</option>
                  <option value="archived">Archived</option>
                </select>
                <button
                  onClick={() => deleteReport(r.id)}
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
