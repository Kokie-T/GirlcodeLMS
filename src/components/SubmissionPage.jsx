import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";

export default function SubmissionsPage({ courseId }) {
  const [submissions, setSubmissions] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [scores, setScores] = useState({}); // userId → { correct, total }

  useEffect(() => {
    const q = query(
      collection(db, "submissions"),
      where("courseId", "==", courseId)
    );
    const unsub = onSnapshot(q, async (snapshot) => {
      const subs = [];
      const userIds = new Set();

      snapshot.forEach((docSnap) => {
        const data = { id: docSnap.id, ...docSnap.data() };
        subs.push(data);
        if (data.userId) userIds.add(data.userId);
      });

      setSubmissions(subs);

      // calculate scores
      const newScores = {};
      subs.forEach((s) => {
        if (!s.userId) return;
        if (!newScores[s.userId]) newScores[s.userId] = { correct: 0, total: 0 };
        newScores[s.userId].total++;
        if (s.selectedAnswer === s.correctAnswer) {
          newScores[s.userId].correct++;
        }
      });
      setScores(newScores);

      // fetch names
      const newUserMap = {};
      await Promise.all(
        Array.from(userIds).map(async (uid) => {
          if (!userMap[uid]) {
            const userRef = doc(db, "users", uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              newUserMap[uid] =
                userSnap.data().name ||
                userSnap.data().displayName ||
                "Unknown";
            } else {
              newUserMap[uid] = "Unknown";
            }
          }
        })
      );
      setUserMap((prev) => ({ ...prev, ...newUserMap }));
    });

    return () => unsub();
  }, [courseId]);

  return (
    <div className="p-6 space-y-6">
      {/* 🔹 Submissions Table */}
      <div>
        <h1 className="text-xl font-bold mb-4">Live Submissions</h1>
        {submissions.length > 0 ? (
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white">
                <th className="border p-2">Student</th>
                <th className="border p-2">Question</th>
                <th className="border p-2">Answer</th>
                <th className="border p-2">Correct</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s.id} className="odd:bg-gray-50 dark:odd:bg-gray-800">
                  <td className="border p-2">{userMap[s.userId] || s.userId}</td>
                  <td className="border p-2">{s.question}</td>
                  <td className="border p-2">{s.selectedAnswer}</td>
                  <td
                    className={`border p-2 font-bold ${
                      s.selectedAnswer === s.correctAnswer
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {s.selectedAnswer === s.correctAnswer ? "✔" : "✘"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No submissions yet.</p>
        )}
      </div>

      {/* 🔹 Scoreboard */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Scoreboard</h2>
        {Object.keys(scores).length > 0 ? (
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white">
                <th className="border p-2">Student</th>
                <th className="border p-2">Correct</th>
                <th className="border p-2">Total</th>
                <th className="border p-2">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(scores).map(([uid, stats]) => {
                const percent = ((stats.correct / stats.total) * 100).toFixed(1);
                return (
                  <tr key={uid} className="odd:bg-gray-50 dark:odd:bg-gray-800">
                    <td className="border p-2">{userMap[uid] || uid}</td>
                    <td className="border p-2 text-green-600 font-semibold">
                      {stats.correct}
                    </td>
                    <td className="border p-2">{stats.total}</td>
                    <td className="border p-2">{percent}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p>No scores yet.</p>
        )}
      </div>
    </div>
  );
}
