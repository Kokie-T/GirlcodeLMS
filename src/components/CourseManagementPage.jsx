import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function CourseManagementPage() {
  const [activeTab, setActiveTab] = useState("courses");
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [uploadedContent, setUploadedContent] = useState([]);
  const [testLibrary, setTestLibrary] = useState([]);

  // Courses form
  const [selectedCourse, setSelectedCourse] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [editingCourse, setEditingCourse] = useState(null);

  // Modules form
  const [selectedModule, setSelectedModule] = useState("");
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDescription, setModuleDescription] = useState("");
  const [editingModule, setEditingModule] = useState(null);

  // Content form
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [editingContent, setEditingContent] = useState(null);

  // AI generation states
  const [activeAIType, setActiveAIType] = useState("");
  const [aiTopic, setAiTopic] = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  const [difficultyLevel, setDifficultyLevel] = useState("medium");
  const [questionFormat, setQuestionFormat] = useState("multipleChoice");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);

  const [uploadStatus, setUploadStatus] = useState("");

  // Fetch courses
  const fetchCourses = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "courses"));
      setCourses(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching courses:", error);
      alert("Error fetching courses");
    }
  };

  // Fetch modules
  const fetchModules = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "modules"));
      setModules(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching modules:", error);
      alert("Error fetching modules");
    }
  };

  // Fetch content
  const fetchContent = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "materials"));
      const contentData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        uploadedAt: doc.data().createdAt ? doc.data().createdAt.toDate().toLocaleString() : "Unknown date",
      }));
      setUploadedContent(contentData);
    } catch (error) {
      console.error("Error fetching content:", error);
      alert("Error fetching content");
    }
  };

  // Fetch assessments
  const fetchAssessments = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "assessments"));
      const assessments = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt ? doc.data().createdAt.toDate().toLocaleDateString() : "Unknown date",
      }));
      setTestLibrary(assessments);
    } catch (error) {
      console.error("Error fetching assessments:", error);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchModules();
    fetchContent();
    fetchAssessments();
  }, []);

  // Course CRUD
  const handleCreateOrEditCourse = async () => {
    if (!courseTitle) return alert("Course title required");
    try {
      if (editingCourse) {
        await updateDoc(doc(db, "courses", editingCourse.id), {
          title: courseTitle,
          description: courseDescription,
        });
        setEditingCourse(null);
      } else {
        await addDoc(collection(db, "courses"), {
          title: courseTitle,
          description: courseDescription,
          createdAt: serverTimestamp(),
        });
      }
      setCourseTitle("");
      setCourseDescription("");
      fetchCourses();
    } catch (error) {
      console.error("Error saving course:", error);
      alert("Error saving course");
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await deleteDoc(doc(db, "courses", id));
      // Optional: cascade delete modules and content
      fetchCourses();
      fetchModules();
      fetchContent();
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("Error deleting course");
    }
  };

  // Module CRUD
  const handleCreateOrEditModule = async () => {
    if (!moduleTitle || !selectedCourse) return alert("Select a course and enter module title");
    try {
      if (editingModule) {
        await updateDoc(doc(db, "modules", editingModule.id), {
          title: moduleTitle,
          description: moduleDescription,
          courseId: selectedCourse,
        });
        setEditingModule(null);
      } else {
        await addDoc(collection(db, "modules"), {
          title: moduleTitle,
          description: moduleDescription,
          courseId: selectedCourse,
          createdAt: serverTimestamp(),
        });
      }
      setModuleTitle("");
      setModuleDescription("");
      fetchModules();
    } catch (error) {
      console.error("Error saving module:", error);
      alert("Error saving module");
    }
  };

  const handleDeleteModule = async (id) => {
    if (!window.confirm("Are you sure you want to delete this module?")) return;
    try {
      await deleteDoc(doc(db, "modules", id));
      // Optional: cascade delete or unlink content
      fetchModules();
      fetchContent();
    } catch (error) {
      console.error("Error deleting module:", error);
      alert("Error deleting module");
    }
  };

  // File change handler
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadStatus("");
    }
  };

  // Content CRUD
  const handleUpload = async () => {
    if (!title || !type || !selectedCourse) return alert("Select course, title and type");
    if (!selectedModule) return alert("Select module for content");

    try {
      setUploadStatus("Uploading...");
      let fileURL = "";

      if (file) {
        const storageRef = ref(storage, `materials/${file.name}-${Date.now()}`);
        const snapshot = await uploadBytes(storageRef, file);
        fileURL = await getDownloadURL(snapshot.ref);
      }

      if (editingContent) {
        await updateDoc(doc(db, "materials", editingContent.id), {
          title,
          type,
          description,
          fileURL: fileURL || editingContent.fileURL,
          courseId: selectedCourse,
          moduleId: selectedModule,
          updatedAt: serverTimestamp(),
        });
        setEditingContent(null);
      } else {
        await addDoc(collection(db, "materials"), {
          title,
          type,
          description,
          fileURL,
          courseId: selectedCourse,
          moduleId: selectedModule,
          createdAt: serverTimestamp(),
        });
      }

      setTitle("");
      setType("");
      setDescription("");
      setFile(null);
      setSelectedCourse("");
      setSelectedModule("");
      setUploadStatus("Upload successful!");
      setTimeout(() => setUploadStatus(""), 3000);
      fetchContent();
    } catch (error) {
      console.error("Error uploading content:", error);
      setUploadStatus("Upload failed!");
      alert("Error uploading content");
    }
  };

  const handleDeleteContent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this content?")) return;
    try {
      await deleteDoc(doc(db, "materials", id));
      fetchContent();
    } catch (error) {
      console.error("Error deleting content:", error);
      alert("Error deleting content");
    }
  };

  // AI Generate Assessment with question format option
  const handleAIGenerate = async () => {
    if (!activeAIType || !aiTopic) return alert("Select type and enter topic");

    setIsGenerating(true);

    try {
      let questionTemplate = "";
      if (questionFormat === "multipleChoice") {
        questionTemplate = `Each question should have 4 options and include an explanation for the correct answer.`;
      } else if (questionFormat === "text") {
        questionTemplate = `Each question should expect a text answer and include a sample correct answer with explanation.`;
      }

      const prompt = `Create a ${activeAIType} about "${aiTopic}" with ${questionCount} ${difficultyLevel} difficulty questions.
      ${questionTemplate}
      Format the response as JSON with this structure:
      {
        "title": "Title of the assessment",
        "type": "${activeAIType}",
        "difficulty": "${difficultyLevel}",
        "questions": [
          {
            "question": "Question text",
            ${
              questionFormat === "multipleChoice"
                ? `"options": ["Option 1", "Option 2", "Option 3", "Option 4"],
            "correctAnswer": 0,`
                : `"sampleAnswer": "Expected answer text",`
            }
            "explanation": "Explanation of why this is correct"
          }
        ]
      }`;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: "Bearer", // insert your actual API key token here!
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "LMS Pro",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-r1:free",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) throw new Error(`API request failed with status ${response.status}`);

      const data = await response.json();
      const content = data.choices[0].message.content;

      // Extract JSON from response string
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const generatedData = JSON.parse(jsonMatch[0]);
        setGeneratedContent(generatedData);
      } else {
        throw new Error("No valid JSON found in response");
      }
    } catch (error) {
      console.error("Error generating AI content:", error);
      // Fallback mock questions
      const mockQuestions = generateMockQuestions(aiTopic, questionCount, difficultyLevel, questionFormat);
      setGeneratedContent({
        title: `${aiTopic} - ${activeAIType}`,
        type: activeAIType,
        questions: mockQuestions,
        topic: aiTopic,
      });
      alert("AI service temporarily unavailable. Using sample questions.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Save AI-generated assessment
  const saveAIAssessment = async () => {
    if (!generatedContent) return;
    try {
      await addDoc(collection(db, "assessments"), {
        title: generatedContent.title,
        description: `AI-generated ${generatedContent.type} on ${generatedContent.topic}`,
        type: generatedContent.type,
        questions: generatedContent.questions,
        courseId: selectedCourse || "",
        difficulty: difficultyLevel,
        questionCount,
        questionFormat,
        status: "Draft",
        createdAt: serverTimestamp(),
      });

      alert(`${generatedContent.type} saved successfully!`);
      setGeneratedContent(null);
      setActiveAIType("");
      setAiTopic("");
      setQuestionFormat("multipleChoice");
      fetchAssessments();
    } catch (error) {
      console.error("Error saving assessment:", error);
      alert("Error saving assessment");
    }
  };

  // Publish assessment
  const handlePublishAssessment = async (id) => {
    try {
      await updateDoc(doc(db, "assessments", id), {
        status: "Published",
        publishedAt: serverTimestamp(),
      });
      fetchAssessments();
    } catch (error) {
      console.error("Error publishing assessment:", error);
      alert("Error publishing assessment");
    }
  };

  // Delete assessment
  const handleDeleteAssessment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this assessment?")) return;
    try {
      await deleteDoc(doc(db, "assessments", id));
      fetchAssessments();
    } catch (error) {
      console.error("Error deleting assessment:", error);
      alert("Error deleting assessment");
    }
  };

  // Fallback mock questions generator
  const generateMockQuestions = (topic, count, difficulty, format) => {
    const questions = [];
    for (let i = 1; i <= count; i++) {
      if (format === "multipleChoice") {
        questions.push({
          id: i,
          question: `What is an important aspect of ${topic}? (Question ${i})`,
          options: [
            `Option A for ${topic}`,
            `Option B for ${topic}`,
            `Option C for ${topic}`,
            `Option D for ${topic}`,
          ],
          correctAnswer: Math.floor(Math.random() * 4),
          explanation: `This question tests your knowledge of ${topic} at a ${difficulty} level.`,
        });
      } else {
        questions.push({
          id: i,
          question: `Explain an important aspect of ${topic}. (Question ${i})`,
          sampleAnswer: `A key point about ${topic} is ...`,
          explanation: `This question tests your knowledge of ${topic} at a ${difficulty} level.`,
        });
      }
    }
    return questions;
  };

  // Filter modules by selected course
  const filteredModules = selectedCourse ? modules.filter((m) => m.courseId === selectedCourse) : [];

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans text-gray-800">
      {/* Header */}
      <h1 className="-full py-3 bg-gradient-to-r from-blue-400 to-pink-400 text-white font-wsemibold rounded-xl shadow text-center text-3xl">Course Management</h1>

      {/* Tabs */}
      <div className="flex space-x-6 border-b mb-8 mt-8">
        <button
          className={`pb-2 font-semibold ${
            activeTab === "courses" ? "border-b-4 border-black text-blue-600" : "text-gray-600 hover:text-blue-500"
          }`}
          onClick={() => setActiveTab("courses")}
        >
          Courses
        </button>
        <button
          className={`pb-2 font-semibold ${
            activeTab === "modules" ? "border-b-4 border-blue-600 text-blue-600" : "text-gray-600 hover:text-blue-500"
          }`}
          onClick={() => setActiveTab("modules")}
        >
          Modules
        </button>
        <button
          className={`pb-2 font-semibold ${
            activeTab === "content" ? "border-b-4 border-blue-600 text-blue-600" : "text-gray-600 hover:text-blue-500"
          }`}
          onClick={() => setActiveTab("content")}
        >
          Educational Content
        </button>
        <button
          className={`pb-2 font-semibold ${
            activeTab === "tests" ? "border-b-4 border-blue-600 text-blue-600" : "text-gray-600 hover:text-blue-500"
          }`}
          onClick={() => setActiveTab("tests")}
        >
          Tests & Assessments
        </button>
      </div>

      {/* Courses Tab */}
      {activeTab === "courses" && (
        <div>
          <section className="bg-white shadow rounded-lg p-6 space-y-4 mb-8">
            <h3 className="text-lg font-semibold text-blue-600">{editingCourse ? "Edit Course" : "Create New Course"}</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
              <input
                type="text"
                placeholder="Enter course title"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                placeholder="Enter course description"
                value={courseDescription}
                onChange={(e) => setCourseDescription(e.target.value)}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                rows="3"
              />
            </div>
            <div className="flex justify-end space-x-3">
              {editingCourse && (
                <button
                  onClick={() => {
                    setEditingCourse(null);
                    setCourseTitle("");
                    setCourseDescription("");
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleCreateOrEditCourse}
                disabled={!courseTitle}
                className="bg-gradient-to-r from-blue-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-pink-600 disabled:opacity-50"
              >
                {editingCourse ? "Update Course" : "Create Course"}
              </button>
            </div>
          </section>
          <h3 className="text-lg font-semibold mb-4 text-blue-600">Course Library</h3>
          <div className="bg-white shadow rounded-lg divide-y">
            {courses.length > 0 ? (
              courses.map((course) => (
                <div key={course.id} className="flex justify-between items-center p-4 hover:bg-gray-50">
                  <div>
                    <p className="font-medium">{course.title}</p>
                    <p className="text-sm text-gray-500">{course.description}</p>
                  </div>
                  <div className="space-x-2">
                    <button
                      className="bg-gradient-to-r from-blue-500 to-pink-500 text-white px-3 py-1 rounded hover:from-blue-600 hover:to-pink-600"
                      onClick={() => {
                        setEditingCourse(course);
                        setCourseTitle(course.title);
                        setCourseDescription(course.description);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-gradient-to-r from-pink-500 to-blue-500 text-white px-3 py-1 rounded hover:from-pink-600 hover:to-blue-600"
                      onClick={() => handleDeleteCourse(course.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">No courses created yet.</div>
            )}
          </div>
        </div>
      )}

      {/* Modules Tab */}
      {activeTab === "modules" && (
        <div>
          <section className="bg-white shadow rounded-lg p-6 space-y-4 mb-8">
            <h3 className="text-lg font-semibold text-blue-600">{editingModule ? "Edit Module" : "Create New Module"}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Course</label>
                <select
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  <option value="">-- Select Course --</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Module Title</label>
                <input
                  type="text"
                  placeholder="Enter module title"
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Module Description</label>
              <textarea
                placeholder="Enter module description"
                value={moduleDescription}
                onChange={(e) => setModuleDescription(e.target.value)}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                rows="3"
              />
            </div>
            <div className="flex justify-end space-x-3">
              {editingModule && (
                <button
                  onClick={() => {
                    setEditingModule(null);
                    setModuleTitle("");
                    setModuleDescription("");
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleCreateOrEditModule}
                disabled={!moduleTitle || !selectedCourse}
                className="bg-gradient-to-r from-blue-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-pink-600 disabled:opacity-50"
              >
                {editingModule ? "Update Module" : "Create Module"}
              </button>
            </div>
          </section>
          <h3 className="text-lg font-semibold mb-4 text-blue-600">Module Library</h3>
          <div className="bg-white shadow rounded-lg divide-y">
            {modules.length > 0 ? (
              modules.map((m) => {
                const course = courses.find((c) => c.id === m.courseId);
                return (
                  <div key={m.id} className="flex justify-between items-center p-4 hover:bg-gray-50">
                    <div>
                      <p className="font-medium">{m.title}</p>
                      <p className="text-sm text-gray-500">{m.description}</p>
                      <p className="text-xs text-gray-400 mt-1">Course: {course ? course.title : "Unknown"}</p>
                    </div>
                    <div className="space-x-2">
                      <button
                        className="bg-gradient-to-r from-blue-500 to-pink-500 text-white px-3 py-1 rounded hover:from-blue-600 hover:to-pink-600"
                        onClick={() => {
                          setEditingModule(m);
                          setModuleTitle(m.title);
                          setModuleDescription(m.description);
                          setSelectedCourse(m.courseId);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-gradient-to-r from-pink-500 to-blue-500 text-white px-3 py-1 rounded hover:from-pink-600 hover:to-blue-600"
                        onClick={() => handleDeleteModule(m.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-gray-500">No modules created yet.</div>
            )}
          </div>
        </div>
      )}

      {/* Educational Content Tab */}
      {activeTab === "content" && (
        <div>
          <section className="bg-white shadow rounded-lg p-6 space-y-4 mb-8">
            <h3 className="text-lg font-semibold text-blue-600">{editingContent ? "Edit Content" : "Upload New Content"}</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Course</label>
                <select
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                  value={selectedCourse}
                  onChange={(e) => {
                    setSelectedCourse(e.target.value);
                    setSelectedModule("");
                  }}
                >
                  <option value="">-- Select Course --</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Module</label>
                <select
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                  disabled={!selectedCourse}
                >
                  <option value="">-- Select Module --</option>
                  {filteredModules.map((module) => (
                    <option key={module.id} value={module.id}>
                      {module.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
                <select
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="">-- Select Type --</option>
                  <option value="video">Video</option>
                  <option value="document">Document</option>
                  <option value="presentation">Presentation</option>
                  <option value="image">Image</option>
                  <option value="audio">Audio</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                placeholder="Enter title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                placeholder="Enter description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload File</label>
              <input type="file" onChange={handleFileChange} className="w-full border rounded-lg p-2" />
              {file && <p className="text-sm text-green-600 mt-1">File selected: {file.name}</p>}
              {editingContent && editingContent.fileURL && !file && (
                <p className="text-sm text-gray-600 mt-1">
                  Current file:{" "}
                  <a href={editingContent.fileURL} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    View file
                  </a>
                </p>
              )}
              {uploadStatus && (
                <p className={`text-sm mt-1 ${uploadStatus.includes("successful") ? "text-green-600" : "text-red-600"}`}>
                  {uploadStatus}
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              {editingContent && (
                <button
                  onClick={() => {
                    setEditingContent(null);
                    setTitle("");
                    setType("");
                    setDescription("");
                    setFile(null);
                    setSelectedCourse("");
                    setSelectedModule("");
                    setUploadStatus("");
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancel Edit
                </button>
              )}
              <button
                onClick={handleUpload}
                disabled={!title || !type || !selectedCourse || !selectedModule}
                className="bg-gradient-to-r from-blue-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-pink-600 disabled:opacity-50"
              >
                {editingContent ? "Update Content" : "Upload Content"}
              </button>
            </div>
          </section>

          {/* Content Library */}
          <h3 className="text-lg font-semibold mb-4 text-blue-600">Content Library</h3>
          <div className="bg-white shadow rounded-lg divide-y max-h-96 overflow-y-auto">
            {uploadedContent.length > 0 ? (
              uploadedContent.map((content) => {
                const course = courses.find((c) => c.id === content.courseId);
                const module = modules.find((m) => m.id === content.moduleId);
                return (
                  <div key={content.id} className="flex justify-between items-start p-4 hover:bg-gray-50">
                    <div className="flex-1">
                      <p className="font-medium">{content.title}</p>
                      <p className="text-sm text-gray-500">
                        {content.type} • {course ? course.title : "Unknown Course"} • {module ? module.title : "Unknown Module"}
                      </p>
                      <p className="text-sm mt-1">{content.description}</p>
                      {content.uploadedAt && <p className="text-xs text-gray-400 mt-1">Uploaded: {content.uploadedAt}</p>}
                    </div>
                    <div className="space-x-2 flex flex-col sm:flex-row">
                      {content.fileURL && (
                        <a
                          href={content.fileURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 mb-2 sm:mb-0 text-center"
                        >
                          View
                        </a>
                      )}
                      <button
                        className="bg-gradient-to-r from-blue-500 to-pink-500 text-white px-3 py-1 rounded hover:from-blue-600 hover:to-pink-600 mb-2 sm:mb-0"
                        onClick={() => {
                          setEditingContent(content);
                          setTitle(content.title);
                          setType(content.type);
                          setDescription(content.description);
                          setSelectedCourse(content.courseId);
                          setSelectedModule(content.moduleId);
                          setFile(null);
                          setUploadStatus("");
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-gradient-to-r from-pink-500 to-blue-500 text-white px-3 py-1 rounded hover:from-pink-600 hover:to-blue-600"
                        onClick={() => handleDeleteContent(content.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-gray-500">No content uploaded yet.</div>
            )}
          </div>
        </div>
      )}

      {/* Tests & Assessments Tab */}
      {activeTab === "tests" && (
        <div>
          {/* AI Generation Section */}
          <section className="bg-white shadow rounded-lg p-6 space-y-4 mb-8">
            <h3 className="text-lg font-semibold text-blue-600">Generate Using AI</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Type</label>
                <select
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-purple-400"
                  value={activeAIType}
                  onChange={(e) => setActiveAIType(e.target.value)}
                >
                  <option value="">-- Select Type --</option>
                  <option value="assignment">Assignment</option>
                  <option value="test">Test</option>
                  <option value="quiz">Quiz</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enter Topic</label>
                <input
                  type="text"
                  placeholder="Enter topic"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question Format</label>
                <select
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-purple-400"
                  value={questionFormat}
                  onChange={(e) => setQuestionFormat(e.target.value)}
                >
                  <option value="multipleChoice">Multiple Choice</option>
                  <option value="text">Text Answer</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Questions</label>
                <select
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-purple-400"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                >
                  <option value={3}>3 Questions</option>
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                  <option value={15}>15 Questions</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty Level</label>
                <select
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-purple-400"
                  value={difficultyLevel}
                  onChange={(e) => setDifficultyLevel(e.target.value)}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-3">
              <button
                onClick={handleAIGenerate}
                disabled={isGenerating || !activeAIType || !aiTopic}
                className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-5 py-2 rounded-lg hover:from-purple-700 hover:to-pink-600 disabled:opacity-50"
              >
                {isGenerating ? "Generating..." : "Generate Using AI"}
              </button>
            </div>
          </section>

          {/* Preview Generated Content */}
          {generatedContent && (
            <section className="bg-white shadow rounded-lg p-6 space-y-4 mb-8 max-h-[500px] overflow-y-auto">
              <h3 className="text-lg font-semibold text-blue-600">Preview: {generatedContent.title}</h3>
              {generatedContent.questions.map((q, index) => (
                <div key={q.id || index} className="mb-6 p-4 border rounded-lg bg-gray-50">
                  <p className="font-medium mb-2">
                    {index + 1}. {q.question}
                  </p>
                  <div className="space-y-2 ml-4">
                    {questionFormat === "multipleChoice"
                      ? q.options.map((option, i) => (
                          <div key={i} className="flex items-center">
                            <input
                              type="radio"
                              name={`question-${q.id || index}`}
                              className="mr-2"
                              checked={i === q.correctAnswer}
                              readOnly
                            />
                            <label>{option}</label>
                          </div>
                        ))
                      : (
                        <textarea
                          className="border rounded p-2 w-full"
                          readOnly
                          value={q.sampleAnswer || ""}
                          rows={3}
                          placeholder="Sample answer"
                        />
                      )
                    }
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{q.explanation}</p>
                </div>
              ))}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setGeneratedContent(null)}
                  className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={saveAIAssessment}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Save to Library
                </button>
              </div>
            </section>
          )}

          {/* Test Library */}
          <h3 className="text-lg font-semibold mb-4 text-blue-600">Test Library</h3>
          <div className="bg-white shadow rounded-lg divide-y max-h-96 overflow-y-auto">
            {testLibrary.length > 0 ? (
              testLibrary.map((test) => (
                <div key={test.id} className="flex justify-between items-center p-4 hover:bg-gray-50">
                  <div>
                    <p className="font-medium">{test.title}</p>
                    <p className="text-sm text-gray-500">
                      {test.questions?.length || 0} Questions • {test.type} • {test.difficulty} •{" "}
                      {test.questionFormat === "text" ? "Text Answer" : "Multiple Choice"}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        test.status === "Published" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"
                      }`}
                    >
                      {test.status}
                    </span>
                    {test.createdAt && <p className="text-xs text-gray-400 mt-1">Created: {test.createdAt}</p>}
                  </div>
                  <div className="space-x-2">
                    {test.status === "Published" ? (
                      <button className="bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-800">View Results</button>
                    ) : (
                      <button
                        className="bg-gradient-to-r from-blue-500 to-pink-500 text-white px-3 py-1 rounded hover:from-blue-600 hover:to-pink-600"
                        onClick={() => handlePublishAssessment(test.id)}
                      >
                        Publish
                      </button>
                    )}
                    <button className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">Edit</button>
                    <button
                      className="bg-gradient-to-r from-pink-500 to-blue-500 text-white px-3 py-1 rounded hover:from-pink-600 hover:to-blue-600"
                      onClick={() => handleDeleteAssessment(test.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">No assessments yet. Generate your first one using the AI tool above.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
