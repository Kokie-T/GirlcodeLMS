import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  updateDoc,
  doc,
} from "firebase/firestore";

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReports(data);
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      setUpdatingId(id);
      await updateDoc(doc(db, "reports", id), { status: newStatus });
      setReports((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: newStatus } : r
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredReports =
    filter === "all"
      ? reports
      : reports.filter((r) => r.role === filter);

  return (
    <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
        Reports
      </h2>

      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {["all", "learner", "facilitator"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition
              ${
                filter === type
                  ? "bg-indigo-500 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-indigo-100 dark:hover:bg-gray-700"
              }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow">
        {loading ? (
          <p className="p-4 text-gray-600 dark:text-gray-300">
            Loading reports...
          </p>
        ) : filteredReports.length === 0 ? (
          <p className="p-4 text-gray-600 dark:text-gray-300">
            No reports found.
          </p>
        ) : (
          <table className="min-w-full text-left border-collapse">
            <thead className="bg-indigo-100 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200">Title</th>
                <th className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200">Message</th>
                <th className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200">Submitted By</th>
                <th className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200">Role</th>
                <th className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200">Status</th>
                <th className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200">Update</th>
                <th className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr
                  key={report.id}
                  className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-4 py-2">{report.title || "Untitled"}</td>
                  <td className="px-4 py-2">{report.message}</td>
                  <td className="px-4 py-2">{report.submittedBy}</td>
                  <td className="px-4 py-2 capitalize">{report.role}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        report.status === "resolved"
                          ? "bg-green-100 text-green-700"
                          : report.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {report.status || "pending"}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <select
                      disabled={updatingId === report.id}
                      value={report.status || "pending"}
                      onChange={(e) =>
                        updateStatus(report.id, e.target.value)
                      }
                      className="px-2 py-1 rounded border text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                    >
                      <option value="pending">Pending</option>
                      <option value="resolved">Resolved</option>
                      <option value="archived">Archived</option>
                    </select>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-300">
                    {report.createdAt?.toDate().toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
