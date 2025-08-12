import React, { useEffect, useState } from "react";
import {
  FaBook,
  FaQuestionCircle,
  FaUsers,
  FaChartBar,
  FaBullhorn,
  FaPlus,
  FaTrash,
  FaEdit,
  FaSave,
} from "react-icons/fa";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
} from "firebase/firestore";

export default function FacilitatorDashboardUpgraded() {
  const [activeTab, setActiveTab] = useState("courses");

  // Data state
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [students, setStudents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]); // for analytics

  // Form & UI state
  const [newItem, setNewItem] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState({ type: null, id: null, value: "" });
  const [newAnnouncement, setNewAnnouncement] = useState("");

  // Collections references
  const coursesCol = collection(db, "courses");
  const quizzesCol = collection(db, "quizzes");
  const studentsCol = collection(db, "students");
  const announcementsCol = collection(db, "announcements");
  const attemptsCol = collection(db, "quizAttempts");

  // Fetch all needed data once on mount
  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [cSnap, qSnap, sSnap, aSnap, atSnap] = await Promise.all([
        getDocs(coursesCol),
        getDocs(quizzesCol),
        getDocs(studentsCol),
        getDocs(query(announcementsCol, orderBy("createdAt", "desc"))),
        getDocs(attemptsCol),
      ]);
      setCourses(cSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setQuizzes(qSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setStudents(sSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setAnnouncements(aSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setQuizAttempts(atSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Fetch error", err);
    }
    setLoading(false);
  };

  // Generic add handler (courses/quizzes/students)
  const handleAdd = async () => {
    if (!newItem.trim()) return;
    setLoading(true);
    try {
      const target = activeTab === "courses" ? coursesCol
                   : activeTab === "quizzes" ? quizzesCol
                   : studentsCol;
      const docRef = await addDoc(target, {
        name: newItem.trim(),
        createdAt: serverTimestamp(),
      });
      const newDoc = { id: docRef.id, name: newItem.trim() };
      if (activeTab === "courses") setCourses((p) => [...p, newDoc]);
      if (activeTab === "quizzes") setQuizzes((p) => [...p, newDoc]);
      if (activeTab === "students") setStudents((p) => [...p, newDoc]);
      setNewItem("");
    } catch (err) {
      console.error("Add error", err);
    }
    setLoading(false);
  };

  // Generic delete handler
  const handleDelete = async (id) => {
    const coll = activeTab === "courses" ? "courses" : activeTab === "quizzes" ? "quizzes" : "students";
    if (!confirm("Delete this item?")) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, coll, id));
      if (activeTab === "courses") setCourses((p) => p.filter((x) => x.id !== id));
      if (activeTab === "quizzes") setQuizzes((p) => p.filter((x) => x.id !== id));
      if (activeTab === "students") setStudents((p) => p.filter((x) => x.id !== id));
    } catch (err) {
      console.error("Delete error", err);
    }
    setLoading(false);
  };

  // Inline edit start/save
  const startEdit = (type, item) => {
    setEditing({ type, id: item.id, value: item.name || item.title || "" });
  };
  const saveEdit = async () => {
    const { type, id, value } = editing;
    if (!value.trim()) return;
    setLoading(true);
    try {
      const collectionName = type === "course" ? "courses" : "quizzes";
      await updateDoc(doc(db, collectionName, id), { name: value.trim(), title: value.trim() });
      // update local state
      if (type === "course") setCourses((p) => p.map((c) => (c.id === id ? { ...c, name: value.trim() } : c)));
      else setQuizzes((p) => p.map((q) => (q.id === id ? { ...q, name: value.trim(), title: value.trim() } : q)));
      setEditing({ type: null, id: null, value: "" });
    } catch (err) {
      console.error("Edit save error", err);
    }
    setLoading(false);
  };

  // Announcements
  const postAnnouncement = async () => {
    if (!newAnnouncement.trim()) return;
    setLoading(true);
    try {
      const ref = await addDoc(announcementsCol, {
        text: newAnnouncement.trim(),
        createdAt: serverTimestamp(),
      });
      setAnnouncements((p) => [{ id: ref.id, text: newAnnouncement.trim(), createdAt: new Date() }, ...p]);
      setNewAnnouncement("");
    } catch (err) {
      console.error("Announcement error", err);
    }
    setLoading(false);
  };
  const deleteAnnouncement = async (id) => {
    if (!confirm("Delete announcement?")) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, "announcements", id));
      setAnnouncements((p) => p.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  // Simple analytics: counts + average quiz score across attempts
  const analytics = {
    totalCourses: courses.length,
    totalQuizzes: quizzes.length,
    totalStudents: students.length,
    avgQuizScore:
      quizAttempts.length > 0
        ? Math.round((quizAttempts.reduce((s, a) => s + (a.score || 0), 0) / quizAttempts.length) * 100) / 100
        : null,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8">

        {/* Top header + tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FaBook className="text-pink-400 text-2xl" />
            <h1 className="text-3xl font-bold text-gray-800">Facilitator Dashboard</h1>
          </div>

          <div className="flex gap-2">
            {[
              { key: "courses", label: "Courses", icon: <FaBook /> },
              { key: "quizzes", label: "Quizzes", icon: <FaQuestionCircle /> },
              { key: "students", label: "Students", icon: <FaUsers /> },
              { key: "analytics", label: "Analytics", icon: <FaChartBar /> },
              { key: "announcements", label: "Announcements", icon: <FaBullhorn /> },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${
                  activeTab === t.key ? "bg-gradient-to-r from-blue-200 to-pink-200 text-gray-800" : "bg-gray-200 text-gray-600"
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="mb-6">
          {activeTab === "courses" && (
            <>
              <h2 className="text-xl font-semibold mb-4">Manage Courses</h2>
              <div className="flex gap-2 mb-4">
                <input
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder="New course name"
                  className="flex-1 p-3 border rounded-md focus:ring-2 focus:ring-pink-200"
                />
                <button onClick={handleAdd} className="px-4 py-3 bg-gradient-to-r from-blue-200 to-pink-200 rounded-lg">
                  <FaPlus />
                </button>
              </div>

              <div className="space-y-3">
                {courses.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-pink-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-800">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => startEdit("course", c)} className="text-blue-600"><FaEdit /></button>
                      <button onClick={() => handleDelete(c.id)} className="text-red-500"><FaTrash /></button>
                    </div>
                  </div>
                ))}
                {courses.length === 0 && <p className="text-gray-500">No courses yet.</p>}
              </div>
            </>
          )}

          {activeTab === "quizzes" && (
            <>
              <h2 className="text-xl font-semibold mb-4">Manage Quizzes</h2>
              <div className="flex gap-2 mb-4">
                <input
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder="New quiz title"
                  className="flex-1 p-3 border rounded-md focus:ring-2 focus:ring-pink-200"
                />
                <button onClick={handleAdd} className="px-4 py-3 bg-gradient-to-r from-blue-200 to-pink-200 rounded-lg">
                  <FaPlus />
                </button>
              </div>

              <div className="space-y-3">
                {quizzes.map((q) => (
                  <div key={q.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-pink-50 rounded-lg">
                    <div>
                      {editing.type === "quiz" && editing.id === q.id ? (
                        <div className="flex gap-2">
                          <input
                            className="p-2 border rounded"
                            value={editing.value}
                            onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                          />
                          <button onClick={saveEdit} className="text-green-600"><FaSave /></button>
                        </div>
                      ) : (
                        <span className="font-medium text-gray-800">{q.name || q.title}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => startEdit("quiz", q)} className="text-blue-600"><FaEdit /></button>
                      <button onClick={() => handleDelete(q.id)} className="text-red-500"><FaTrash /></button>
                    </div>
                  </div>
                ))}
                {quizzes.length === 0 && <p className="text-gray-500">No quizzes yet.</p>}
              </div>
            </>
          )}

          {activeTab === "students" && (
            <>
              <h2 className="text-xl font-semibold mb-4">Enrolled Students</h2>
              <div className="space-y-3">
                {students.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-pink-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-800">{s.name}</div>
                      {s.email && <div className="text-sm text-gray-600">{s.email}</div>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => {
                        if(!confirm("Remove student?")) return;
                        deleteDoc(doc(db, "students", s.id)).then(()=> setStudents(p => p.filter(x=>x.id!==s.id)));
                      }} className="text-red-500">
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
                {students.length === 0 && <p className="text-gray-500">No students found.</p>}
              </div>
            </>
          )}

          {activeTab === "analytics" && (
            <>
              <h2 className="text-xl font-semibold mb-4">Analytics</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-pink-50 rounded-lg text-center">
                  <div className="text-sm text-gray-600">Courses</div>
                  <div className="text-2xl font-bold text-indigo-700">{analytics.totalCourses}</div>
                </div>
                <div className="p-4 bg-gradient-to-r from-blue-50 to-pink-50 rounded-lg text-center">
                  <div className="text-sm text-gray-600">Quizzes</div>
                  <div className="text-2xl font-bold text-indigo-700">{analytics.totalQuizzes}</div>
                </div>
                <div className="p-4 bg-gradient-to-r from-blue-50 to-pink-50 rounded-lg text-center">
                  <div className="text-sm text-gray-600">Students</div>
                  <div className="text-2xl font-bold text-indigo-700">{analytics.totalStudents}</div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-semibold mb-2">Average Quiz Score</h3>
                {analytics.avgQuizScore !== null ? (
                  <div>
                    <div className="text-xl font-bold">{analytics.avgQuizScore}%</div>
                    <div className="w-full bg-gray-200 h-3 rounded mt-2">
                      <div
                        className="h-3 rounded bg-gradient-to-r from-blue-200 to-pink-200"
                        style={{ width: `${Math.min(100, analytics.avgQuizScore)}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No quiz attempts yet.</p>
                )}
              </div>
            </>
          )}

          {activeTab === "announcements" && (
            <>
              <h2 className="text-xl font-semibold mb-4">Announcements</h2>
              <div className="mb-4">
                <textarea
                  value={newAnnouncement}
                  onChange={(e) => setNewAnnouncement(e.target.value)}
                  placeholder="Write an announcement..."
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-pink-200 mb-2"
                  rows={3}
                />
                <div className="flex gap-2">
                  <button onClick={postAnnouncement} className="px-4 py-2 bg-gradient-to-r from-blue-200 to-pink-200 rounded-lg">Post</button>
                  <button onClick={() => setNewAnnouncement("")} className="px-4 py-2 bg-gray-200 rounded-lg">Clear</button>
                </div>
              </div>

              <div className="space-y-3">
                {announcements.map((a) => (
                  <div key={a.id} className="p-3 bg-gradient-to-r from-blue-50 to-pink-50 rounded-lg flex justify-between items-start">
                    <div>
                      <div className="text-gray-800">{a.text}</div>
                      <div className="text-xs text-gray-500 mt-1">{a.createdAt?.toDate ? a.createdAt.toDate().toLocaleString() : ""}</div>
                    </div>
                    <button onClick={() => deleteAnnouncement(a.id)} className="text-red-500"><FaTrash /></button>
                  </div>
                ))}
                {announcements.length === 0 && <p className="text-gray-500">No announcements posted.</p>}
              </div>
            </>
          )}
        </div>

        {/* Inline editing footer */}
        {editing.type && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md flex justify-between items-center">
            <div>Editing {editing.type} — change name and click save</div>
            <div className="flex items-center gap-2">
              <input value={editing.value} onChange={(e) => setEditing({ ...editing, value: e.target.value })} className="p-2 border rounded" />
              <button onClick={saveEdit} className="px-3 py-1 bg-green-200 rounded">Save</button>
              <button onClick={() => setEditing({ type: null, id: null, value: "" })} className="px-3 py-1 bg-gray-200 rounded">Cancel</button>
            </div>
          </div>
        )}

        {/* loading */}
        {loading && <div className="mt-4 text-sm text-gray-500">Working…</div>}
      </div>
    </div>
  );
}
