import React, { useEffect, useState } from "react";
import { db, storage } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  updateDoc,
  doc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);

  // New report form state
  const [newTitle, setNewTitle] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newFile, setNewFile] = useState(null);

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

  const addReport = async () => {
    if (!newTitle || !newMessage) return;

    try {
      let fileURL = null;
      if (newFile) {
        const fileRef = ref(storage, `reports/${Date.now()}_${newFile.name}`);
        await uploadBytes(fileRef, newFile);
        fileURL = await getDownloadURL(fileRef);
      }

      const report = {
        title: newTitle,
        message: newMessage,
        submittedBy: "Admin", // replace with logged-in admin
        role: "admin",
        status: "pending",
        attachment: fileURL,
        createdAt: new Date(),
      };

      const docRef = await addDoc(collection(db, "reports"), report);
      setReports((prev) => [{ ...report, id: docRef.id }, ...prev]);
      setNewTitle("");
      setNewMessage("");
      setNewFile(null);
    } catch (err) {
      console.error("Error adding report:", err);
    }
  };

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

  const filteredReports =
    filter === "all"
      ? reports
      : reports.filter((r) => r.role.toLowerCase() === filter);

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Reports</h2>

      {/* Create Report Form */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="font-semibold mb-2">Create New Report</h3>
        <input
          type="text"
          placeholder="Title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="border p-2 rounded w-full mb-2"
        />
        <textarea
          placeholder="Message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="border p-2 rounded w-full mb-2"
        />
        <input
          type="file"
          onChange={(e) => setNewFile(e.target.files[0])}
          className="mb-2"
        />
        <button
          onClick={addReport}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Report
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {["all", "student", "facilitator", "admin"].map((type) => (
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

      {/* Reports Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow">
        {loading ? (
          <p className="p-4 text-gray-600">Loading reports...</p>
        ) : filteredReports.length === 0 ? (
          <p className="p-4 text-gray-600">No reports available</p>
        ) : (
          <table className="min-w-full text-left border-collapse">
            <thead className="bg-indigo-100">
              <tr>
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2">Message</th>
                <th className="px-4 py-2">Attachment</th>
                <th className="px-4 py-2">Submitted By</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Update Status</th>
                <th className="px-4 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{report.title || "Untitled"}</td>
                  <td className="px-4 py-2">{report.message}</td>
                  <td className="px-4 py-2">
                    {report.attachment ? (
                      <a
                        href={report.attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        View File
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </td>
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
                      onChange={(e) => updateStatus(report.id, e.target.value)}
                      className="px-2 py-1 rounded border text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="resolved">Resolved</option>
                      <option value="archived">Archived</option>
                    </select>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {report.createdAt?.toDate
                      ? report.createdAt.toDate().toLocaleString()
                      : new Date(report.createdAt).toLocaleString()}
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
