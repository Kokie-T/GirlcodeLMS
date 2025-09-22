import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { db } from "../firebase";
import { doc, getDocs, collection, query, where, orderBy } from "firebase/firestore";
import LearnerSidebar from "../components/LearnerSidebar";

export default function MyCourses() {
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  const [courses, setCourses] = useState([]);
  const [results, setResults] = useState({});
  const [history, setHistory] = useState({});
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch courses & results
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Fetch enrollments
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

        // Fetch results
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

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Shared Sidebar */}
      <LearnerSidebar onLogout={handleLogout} />

      {/* Main content */}
      <main className="flex-1 p-6 md:ml-64">
        <header className="bg-white dark:bg-gray-800 p-6 rounded-xl mb-8 shadow text-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">My Courses</h1>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-3">
              You have not enrolled in any courses yet.
            </p>
            <button
              onClick={() => navigate("/courses")}
              className="bg-gradient-to-r from-blue-400 to-pink-400 text-white px-4 py-2 rounded-xl shadow hover:opacity-90 transition"
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {courses.map((course) => {
              const avgScore = results[course.id] ?? 0;
              const courseHistory = history[course.id] ?? [];
              const isExpanded = expanded[course.id];
              const contentProgress = course.progress || 0;

              return (
                <div
                  key={course.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition hover:shadow-xl"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      {course.title}
                    </h3>
                    <button
                      onClick={() =>
                        setExpanded((prev) => ({
                          ...prev,
                          [course.id]: !prev[course.id],
                        }))
                      }
                      className="text-blue-500 text-sm hover:underline"
                    >
                      {isExpanded ? "Hide History" : "Show History"}
                    </button>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
                      <span>Progress</span>
                      <span>{Math.min(contentProgress + avgScore, 100)}%</span>
                    </div>
                    <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
                      <div
                        className="absolute left-0 top-0 h-4 bg-blue-500 transition-all duration-700"
                        style={{ width: `${contentProgress}%` }}
                      />
                      <div
                        className="absolute left-0 top-0 h-4 bg-pink-400 opacity-70 transition-all duration-700"
                        style={{ width: `${avgScore}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>Content</span>
                      <span>Quiz Avg</span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/quiz/${course.id}`)}
                    className="w-full py-3 bg-gradient-to-r from-blue-400 to-pink-400 text-white font-semibold rounded-xl shadow hover:opacity-90 transition"
                  >
                    Take Quiz
                  </button>

                  {/* History */}
                  {isExpanded && (
                    <div className="mt-4 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                      <h4 className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        Past Quiz Attempts
                      </h4>
                      {courseHistory.length > 0 ? (
                        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                          {courseHistory.map((attempt, idx) => (
                            <li
                              key={idx}
                              className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1"
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
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No quiz attempts yet.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
