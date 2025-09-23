import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import LearnerSidebar from "../components/LearnerSidebar";

export default function MyCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [expandedModule, setExpandedModule] = useState(null);
  const [moduleDetails, setModuleDetails] = useState({}); // { [moduleId]: { content: [], assessments: [] } }
  const [expandedAssessments, setExpandedAssessments] = useState(null);

  // Fetch courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      const snap = await getDocs(collection(db, "courses"));
      setCourses(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchCourses();
  }, []);

  // Fetch modules when course changes
  useEffect(() => {
    if (!selectedCourse) return setModules([]);

    const fetchModules = async () => {
      const snap = await getDocs(
        collection(db, "courses", selectedCourse.id, "modules")
      );
      setModules(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchModules();
  }, [selectedCourse]);

  // Fetch module content & assessments only when expanded
  const fetchModuleDetails = async (moduleId) => {
    if (moduleDetails[moduleId]) return; // already fetched

    const contentSnap = await getDocs(
      collection(db, "courses", selectedCourse.id, "modules", moduleId, "content")
    );
    const assessmentsSnap = await getDocs(
      collection(db, "courses", selectedCourse.id, "modules", moduleId, "assessments")
    );

    setModuleDetails((prev) => ({
      ...prev,
      [moduleId]: {
        content: contentSnap.docs.map((c) => ({ id: c.id, ...c.data() })),
        assessments: assessmentsSnap.docs.map((a) => ({ id: a.id, ...a.data() })),
      },
    }));
  };

  const openTextInNewTab = (text) => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    URL.revokeObjectURL(url);
  };

  const startAssessment = (assessment) => {
    alert(`Starting assessment: ${assessment.title}`);
    // integrate assessment logic here
  };

  const toggleModule = (modId) => {
    const newState = expandedModule === modId ? null : modId;
    setExpandedModule(newState);
    if (newState) fetchModuleDetails(modId);
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0">
        <LearnerSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6">📘 My Courses</h1>

        {courses.map((course) => (
          <div key={course.id} className="border rounded bg-white shadow p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold text-lg">{course.title}</h2>
              <button
                className="text-blue-500 underline text-sm"
                onClick={() =>
                  setSelectedCourse(
                    selectedCourse?.id === course.id ? null : course
                  )
                }
              >
                {selectedCourse?.id === course.id ? "Hide Modules" : "Show Modules"}
              </button>
            </div>

            {selectedCourse?.id === course.id && (
              <div className="space-y-3 mt-3">
                {modules.map((mod) => (
                  <div key={mod.id} className="border rounded p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">{mod.title}</span>
                      <button
                        className="text-blue-500 underline text-sm"
                        onClick={() => toggleModule(mod.id)}
                      >
                        {expandedModule === mod.id ? "Hide Details" : "Show Details"}
                      </button>
                    </div>

                    {expandedModule === mod.id && (
                      <div className="space-y-3">
                        {/* Content */}
                        <div>
                          <h3 className="font-medium">Content</h3>
                          {moduleDetails[mod.id]?.content?.length > 0 ? (
                            moduleDetails[mod.id].content.map((c) => (
                              <div
                                key={c.id}
                                className="border rounded p-2 flex justify-between items-center"
                              >
                                <span>{c.title}</span>
                                <div className="flex gap-2">
                                  {c.type === "text" ? (
                                    <button
                                      className="text-blue-500"
                                      onClick={() => openTextInNewTab(c.text)}
                                    >
                                      View
                                    </button>
                                  ) : (
                                    <a
                                      href={c.fileURL}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-500"
                                    >
                                      Download
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500">No content yet</p>
                          )}
                        </div>

                        {/* Assessments */}
                        <button
                          onClick={() =>
                            setExpandedAssessments(
                              expandedAssessments === mod.id ? null : mod.id
                            )
                          }
                          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded"
                        >
                          {expandedAssessments === mod.id
                            ? "Hide Assessments"
                            : "Show Assessments"}
                        </button>

                        {expandedAssessments === mod.id && (
                          <div className="mt-2 space-y-2 p-2 bg-gray-100 rounded border">
                            {moduleDetails[mod.id]?.assessments?.length > 0 ? (
                              moduleDetails[mod.id].assessments.map((a) => (
                                <div
                                  key={a.id}
                                  className="p-2 border rounded flex justify-between items-center"
                                >
                                  <span>{a.title}</span>
                                  <button
                                    className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                                    onClick={() => startAssessment(a)}
                                  >
                                    Start
                                  </button>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-500">No assessments yet</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
