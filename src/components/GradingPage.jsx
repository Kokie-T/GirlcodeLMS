// src/components/GradingPage.jsx
import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import toast from "react-hot-toast"; // ✅ Import toast

export default function GradingPage({ darkMode }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");

  // Fetch ungraded submissions
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const q = query(collection(db, "Submissions"), where("graded", "==", false));
        const querySnapshot = await getDocs(q);
        const subs = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setSubmissions(subs);
      } catch (error) {
        console.error("Error fetching submissions:", error);
        toast.error("Failed to fetch submissions");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  // Handle grading
  const handleGrade = async () => {
    if (!selectedSubmission) return;

    try {
      const subRef = doc(db, "Submissions", selectedSubmission.id);
      await updateDoc(subRef, {
        graded: true,
        grade,
        feedback,
      });

      toast.success("✅ Submission graded successfully!");
      setSubmissions((prev) => prev.filter((s) => s.id !== selectedSubmission.id));
      setSelectedSubmission(null);
      setGrade("");
      setFeedback("");
    } catch (error) {
      console.error("Error grading submission:", error);
      toast.error("❌ Error grading submission");
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-4 dark:text-white">Grading Panel</h2>

      {loading ? (
        <p className="dark:text-gray-300">Loading submissions...</p>
      ) : submissions.length === 0 ? (
        <p className="dark:text-gray-300">No ungraded submissions.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Submissions List */}
          <div className="space-y-3">
            <h3 className="font-semibold dark:text-white">Ungraded Submissions</h3>
            {submissions.map((sub) => (
              <div
                key={sub.id}
                onClick={() => setSelectedSubmission(sub)}
                className={`p-3 rounded-lg border cursor-pointer ${
                  selectedSubmission?.id === sub.id
                    ? "border-blue-500 bg-blue-50 dark:bg-gray-700"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              >
                <p className="dark:text-white">
                  <span className="font-semibold">Student:</span> {sub.studentId}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Assignment: {sub.assignmentId}
                </p>
              </div>
            ))}
          </div>

          {/* Grading Form */}
          {selectedSubmission && (
            <div className="p-4 border rounded-lg dark:border-gray-600">
              <h3 className="font-semibold mb-2 dark:text-white">
                Grade Submission
              </h3>
              <p className="mb-2 text-sm dark:text-gray-300">
                Student: {selectedSubmission.studentId}
              </p>
              <p className="mb-2 text-sm dark:text-gray-300">
                Assignment: {selectedSubmission.assignmentId}
              </p>
              <a
                href={selectedSubmission.content}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline text-sm"
              >
                View Submission
              </a>

              <input
                type="text"
                placeholder="Grade (e.g., A, 85%)"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full p-2 my-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
              <textarea
                placeholder="Feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full p-2 mb-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
              <button
                onClick={handleGrade}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Submit Grade
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
