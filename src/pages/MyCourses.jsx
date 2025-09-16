import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";

export default function MyCourses() {
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  const [avatar, setAvatar] = useState(null);
  const [courses, setCourses] = useState([]);
  const [results, setResults] = useState({});
  const [history, setHistory] = useState({});
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // 1️⃣ User profile
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) setAvatar(userSnap.data().avatar || null);

        // 2️⃣ Enrollments (top-level collection)
        const enrollmentQuery = query(
          collection(db, "enrollments"),
          where("studentId", "==", user.uid)
        );
        const enrollmentSnap = await getDocs(enrollmentQuery);

        const enrolledCourseIds = [];
        const enrollmentProgress = {};
        enrollmentSnap.forEach((doc) => {
          const { courseId, progress = 0 } = doc.data();
          if (courseId) {
            enrolledCourseIds.push(courseId);
            enrollmentProgress[courseId] = progress;
          }
        });

        // 3️⃣ Fetch courses in batches of 10
        const enrolledCourses = [];
        for (let i = 0; i < enrolledCourseIds.length; i += 10) {
          const batchIds = enrolledCourseIds.slice(i, i + 10);
          const batchQuery = query(
            collection(db, "courses"),
            where("__name__", "in", batchIds)
          );
          const batchSnap = await getDocs(batchQuery);
          batchSnap.docs.forEach((doc) => {
            enrolledCourses.push({
              id: doc.id,
              title: doc.data().title || "Untitled Course",
              progress: enrollmentProgress[doc.id] || 0,
            });
          });
        }
        setCourses(enrolledCourses);

        // 4️⃣ Quiz results
        const resultsQuery = query(
          collection(db, "results"),
          where("userId", "==", user.uid),
          orderBy("takenAt", "desc")
        );
        const resultsSnap = await getDocs(resultsQuery);

        const resultMap = {};
        const historyMap = {};

        resultsSnap.forEach((docSnap) => {
          const data = docSnap.data();
          const courseId = data.courseId;

          if (!historyMap[courseId]) historyMap[courseId] = [];
          historyMap[courseId].push({
            score: data.score,
            date: data.takenAt?.toDate?.() || new Date(),
          });

          if (!resultMap[courseId]) resultMap[courseId] = { total: 0, count: 0 };
          resultMap[courseId].total += data.score;
          resultMap[courseId].count += 1;
        });

        // Compute averages
        Object.keys(resultMap).forEach((courseId) => {
          resultMap[courseId] = Math.round(
            resultMap[courseId].total / resultMap[courseId].count
          );
        });

        setResults(resultMap);
        setHistory(historyMap);
      } catch (err) {
        console.error("Error loading courses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) return <p className="p-6 text-gray-600">Loading your courses...</p>;
  if (!user) return <p className="p-6 text-red-600">User not signed in.</p>;

  return (
    <div className="p-6 grid md:grid-cols-2 gap-6">
      {courses.length === 0 && (
        <div className="text-center col-span-full">
          <p className="text-gray-600 mb-3">You have not enrolled in any courses yet.</p>
          <button
            onClick={() => navigate("/courses")}
            className="bg-gradient-to-r from-blue-500 to-pink-500 text-white px-4 py-2 rounded-lg shadow hover:opacity-90 transition"
          >
            Browse Courses
          </button>
        </div>
      )}

      {courses.map((course) => {
        const avgScore = results[course.id] ?? 0;
        const courseHistory = history[course.id] ?? [];
        const isExpanded = expanded[course.id];
        const contentProgress = course.progress || 0;

        return (
          <div
            key={course.id}
            className="bg-white p-5 rounded-lg shadow hover:shadow-md transition"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-800">{course.title}</h3>
              <button
                onClick={() =>
                  setExpanded((prev) => ({ ...prev, [course.id]: !prev[course.id] }))
                }
                className="text-blue-500 text-sm hover:underline"
              >
                {isExpanded ? "Hide History" : "Show History"}
              </button>
            </div>

            {/* Stacked Progress Bar */}
            <div className="mb-3">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress</span>
                <span>{Math.min(contentProgress + avgScore, 100)}%</span>
              </div>
              <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden relative">
                <div
                  className="absolute left-0 top-0 h-4 bg-blue-500 transition-all duration-700"
                  style={{ width: `${contentProgress}%` }}
                />
                <div
                  className="absolute left-0 top-0 h-4 bg-pink-400 opacity-70 transition-all duration-700"
                  style={{ width: `${avgScore}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Content</span>
                <span>Quiz Avg</span>
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={() => navigate(`/quiz/${course.id}`)}
              className="w-full bg-gradient-to-r from-blue-500 to-pink-500 text-white py-2 rounded-lg hover:opacity-90 transition"
            >
              Take Quiz
            </button>

            {/* History */}
            {isExpanded && (
              <div className="mt-4 bg-gray-50 p-3 rounded-lg">
                <h4 className="font-semibold mb-2 text-gray-700">Past Quiz Attempts</h4>
                {courseHistory.length > 0 ? (
                  <ul className="space-y-2 text-sm text-gray-700">
                    {courseHistory.map((attempt, idx) => (
                      <li
                        key={idx}
                        className="flex justify-between border-b border-gray-200 pb-1"
                      >
                        <span>
                          Attempt {courseHistory.length - idx}
                          {idx === 0 && (
                            <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                              Latest
                            </span>
                          )}
                        </span>
                        <span>
                          {attempt.score}% •{" "}
                          {attempt.date.toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}{" "}
                          {attempt.date.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No quiz attempts yet.</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
