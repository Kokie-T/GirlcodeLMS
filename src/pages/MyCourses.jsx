import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { db } from "../firebase";
import {
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

  const [courses, setCourses] = useState([]);
  const [results, setResults] = useState({});
  const [history, setHistory] = useState({});
  const [expanded, setExpanded] = useState({}); // track expanded course cards
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchCoursesAndResults = async () => {
      try {
        const learnerId = user.uid;

        // Fetch enrolled courses
        const qCourses = query(
          collection(db, "courses"),
          where("assignedLearners", "array-contains", learnerId)
        );
        const courseSnap = await getDocs(qCourses);
        const fetchedCourses = courseSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCourses(fetchedCourses);

        // Fetch quiz results
        const qResults = query(
          collection(db, "results"),
          where("userId", "==", learnerId),
          orderBy("takenAt", "desc")
        );
        const resultSnap = await getDocs(qResults);

        let resMap = {};
        let historyMap = {};
        resultSnap.forEach((doc) => {
          const data = doc.data();

          // Build history
          if (!historyMap[data.courseId]) historyMap[data.courseId] = [];
          historyMap[data.courseId].push({
            score: data.score,
            date: data.takenAt?.toDate?.() || new Date(),
          });

          // Aggregate for average
          if (!resMap[data.courseId]) resMap[data.courseId] = { total: 0, count: 0 };
          resMap[data.courseId].total += data.score;
          resMap[data.courseId].count += 1;
        });

        // Compute averages
        Object.keys(resMap).forEach((courseId) => {
          resMap[courseId] = Math.round(resMap[courseId].total / resMap[courseId].count);
        });

        setResults(resMap);
        setHistory(historyMap);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching courses or results:", error);
        setLoading(false);
      }
    };

    fetchCoursesAndResults();
  }, [user]);

  if (loading) return <p className="p-6 text-gray-600">Loading courses...</p>;

  return (
    <div className="p-6 grid md:grid-cols-2 gap-6">
      {courses.length === 0 && <p>You have not enrolled in any courses yet.</p>}

      {courses.map((course) => {
        const avgScore = results[course.id] ?? 0;
        const courseHistory = history[course.id] ?? [];
        const isExpanded = expanded[course.id];
        const contentProgress = course.progress || 0; // course content completion

        // Compute capped composite bar widths
        const totalWidth = Math.min(contentProgress + avgScore, 100);
        const contentWidth = Math.min(contentProgress, totalWidth);
        const quizWidth = Math.min(avgScore, totalWidth - contentWidth);

        return (
          <div
            key={course.id}
            className="bg-white p-5 rounded-lg shadow hover:shadow-md transition"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-gray-800 font-medium">{course.title}</h3>
              <button
                onClick={() =>
                  setExpanded((prev) => ({ ...prev, [course.id]: !prev[course.id] }))
                }
                className="text-blue-500 text-sm"
              >
                {isExpanded ? "Hide History" : "Show History"}
              </button>
            </div>

            {/* 🔹 Capped Composite Progress Bar */}
            <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden relative mb-2">
              {/* Content Progress */}
              <div
                className="absolute left-0 top-0 h-4 bg-blue-400 transition-all duration-700 ease-out"
                style={{ width: `${contentWidth}%` }}
              />
              {/* Quiz Performance */}
              <div
                className="absolute left-0 top-0 h-4 bg-pink-400 transition-all duration-700 ease-out opacity-70"
                style={{ width: `${quizWidth}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 mb-3">
              Content: {contentProgress}%, Quiz Avg: {avgScore}%
            </p>

            {/* Take Quiz Button */}
            <button
              onClick={() => navigate(`/quiz/${course.id}`)}
              className="w-full bg-gradient-to-r from-blue-400 to-pink-400 text-white py-2 rounded-lg hover:opacity-90 transition mb-2"
            >
              Take Quiz
            </button>

            {/* 🔹 Quiz History */}
            {isExpanded && courseHistory.length > 0 && (
              <div className="mt-3 bg-gray-50 p-3 rounded-lg">
                <h4 className="font-semibold mb-2">Past Quiz Attempts</h4>
                <ul className="space-y-2 text-gray-700 text-sm">
                  {courseHistory.map((attempt, idx) => (
                    <li
                      key={idx}
                      className="flex justify-between border-b border-gray-200 pb-1"
                    >
                      <span>Attempt {courseHistory.length - idx}</span>
                      <span>
                        {attempt.score}% -{" "}
                        {attempt.date.toLocaleDateString()}{" "}
                        {attempt.date.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {isExpanded && courseHistory.length === 0 && (
              <p className="mt-2 text-gray-500 text-sm">No quiz attempts yet.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
