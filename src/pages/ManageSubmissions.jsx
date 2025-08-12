import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";

export default function ManageSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [students, setStudents] = useState({});
  const [quizzes, setQuizzes] = useState({});
  const [loading, setLoading] = useState(false);
  const [markingId, setMarkingId] = useState(null); // id of submission being scored
  const [scoreInput, setScoreInput] = useState("");

  // Fetch students & quizzes for lookup
  const fetchLookups = async () => {
    const studentsSnap = await getDocs(collection(db, "students"));
    const quizzesSnap = await getDocs(collection(db, "quizzes"));

    const studentsMap = {};
    studentsSnap.forEach(doc => {
      studentsMap[doc.id] = doc.data().name || "Unknown Student";
    });
    setStudents(studentsMap);

    const quizzesMap = {};
    quizzesSnap.forEach(doc => {
      quizzesMap[doc.id] = doc.data().title || doc.data().name || "Untitled Quiz";
    });
    setQuizzes(quizzesMap);
  };

  // Fetch submissions
  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const submissionsSnap = await getDocs(collection(db, "submissions"));
      const submissionsList = submissionsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSubmissions(submissionsList);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLookups();
    fetchSubmissions();
  }, []);

  // Save score to Firestore
  const saveScore = async (submissionId) => {
    const score = Number(scoreInput);
    if (isNaN(score) || score < 0) {
      alert("Please enter a valid non-negative score.");
      return;
    }
    try {
      await updateDoc(doc(db, "submissions", submissionId), { score });
      setSubmissions(subs =>
        subs.map(s => (s.id === submissionId ? { ...s, score } : s))
      );
      setMarkingId(null);
      setScoreInput("");
      alert("Score saved!");
    } catch (err) {
      console.error("Error saving score:", err);
      alert("Failed to save score.");
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-green-400 to-blue-600 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6">Student Quiz Submissions</h1>

      {loading && <p>Loading submissions...</p>}

      {!loading && submissions.length === 0 && (
        <p>No submissions found.</p>
      )}

      <ul className="space-y-4">
        {submissions.map((sub) => (
          <li key={sub.id} className="bg-white text-black rounded-lg p-4 shadow">
            <div className="mb-2">
              <strong>Student:</strong> {students[sub.studentId] || "Unknown"}
            </div>
            <div className="mb-2">
              <strong>Quiz:</strong> {quizzes[sub.quizId] || "Unknown"}
            </div>
            <div className="mb-2">
              <strong>Submitted Answers:</strong>
              <pre className="bg-gray-100 p-2 rounded max-h-40 overflow-auto whitespace-pre-wrap">{JSON.stringify(sub.answers, null, 2)}</pre>
            </div>
            <div className="mb-2 flex items-center gap-2">
              <strong>Score:</strong>
              {markingId === sub.id ? (
                <>
                  <input
                    type="number"
                    min="0"
                    value={scoreInput}
                    onChange={(e) => setScoreInput(e.target.value)}
                    className="border p-1 rounded w-20"
                    placeholder="Enter score"
                  />
                  <button
                    onClick={() => saveScore(sub.id)}
                    className="bg-green-500 px-3 py-1 rounded text-white hover:bg-green-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => { setMarkingId(null); setScoreInput(""); }}
                    className="bg-gray-400 px-3 py-1 rounded text-white hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span>{sub.score !== undefined && sub.score !== null ? sub.score : "Not marked"}</span>
                  <button
                    onClick={() => {
                      setMarkingId(sub.id);
                      setScoreInput(sub.score !== undefined && sub.score !== null ? String(sub.score) : "");
                    }}
                    className="ml-4 bg-blue-500 px-3 py-1 rounded text-white hover:bg-blue-600"
                  >
                    Mark
                  </button>
                </>
              )}
            </div>
            {sub.submittedAt && (
              <div className="text-xs text-gray-600">
                Submitted on: {sub.submittedAt.toDate ? sub.submittedAt.toDate().toLocaleString() : String(sub.submittedAt)}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
