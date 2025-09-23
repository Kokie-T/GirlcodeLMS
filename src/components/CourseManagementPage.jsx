import React, { useState, useEffect } from "react";
import {
  collection,
  doc,
  addDoc,
  getDocs,
  serverTimestamp,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db, storage } from "../firebase";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

function ExpandableList({ title, items, selectedId, onSelect }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="mb-4 border p-2 rounded">
      <div
        className="flex justify-between cursor-pointer font-semibold"
        onClick={() => setExpanded(!expanded)}
      >
        <span>{title}</span>
        <button className="text-blue-400">
          {expanded ? "Collapse" : `Expand (${items.length})`}
        </button>
      </div>
      {expanded && (
        <div className="max-h-56 overflow-auto mt-2">
          {items.map((item) => (
            <div
              key={item.id}
              className={`p-1 rounded mb-1 cursor-pointer ${
                selectedId === item.id
                  ? "bg-gradient-to-r from-blue-400 to-pink-400 text-white"
                  : "hover:bg-gray-200"
              }`}
              onClick={() => onSelect(item)}
            >
              {item.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function QuestionEditor({ question, onChange, questionType }) {
  const [localQuestion, setLocalQuestion] = useState(
    typeof question === "string" ? { text: question, options: [] } : question
  );

  useEffect(() => {
    setLocalQuestion(
      typeof question === "string" ? { text: question, options: [] } : question
    );
  }, [question]);

  const updateText = (e) => {
    const updated = { ...localQuestion, text: e.target.value };
    setLocalQuestion(updated);
    onChange(updated);
  };

  const updateOption = (idx, val) => {
    const options = [...(localQuestion.options || [])];
    options[idx] = val;
    const updated = { ...localQuestion, options };
    setLocalQuestion(updated);
    onChange(updated);
  };

  const addOption = () => {
    const options = [...(localQuestion.options || [])];
    options.push("");
    const updated = { ...localQuestion, options };
    setLocalQuestion(updated);
    onChange(updated);
  };

  const removeOption = (idx) => {
    const options = [...(localQuestion.options || [])];
    options.splice(idx, 1);
    const updated = { ...localQuestion, options };
    setLocalQuestion(updated);
    onChange(updated);
  };

  return (
    <div className="border p-3 rounded mb-4 bg-gray-100">
      <textarea
        rows={3}
        className="w-full p-2 mb-2 border rounded"
        value={localQuestion.text}
        onChange={updateText}
      />
      {questionType === "multiple-choice" && (
        <div>
          {localQuestion.options?.map((opt, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-1">
              <input
                className="flex-grow border p-1 rounded"
                type="text"
                value={opt}
                onChange={(e) => updateOption(idx, e.target.value)}
              />
              <button
                className="text-red-500 font-bold"
                onClick={() => removeOption(idx)}
              >
                ×
              </button>
            </div>
          ))}
          <button
            className="text-blue-600 underline text-sm"
            onClick={addOption}
          >
            + Add Option
          </button>
        </div>
      )}
    </div>
  );
}

export default function CourseManagementPage() {
  const [activeTab, setActiveTab] = useState("management");

  // Courses, Modules, Content
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [contentList, setContentList] = useState([]);

  // Course creation inputs
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseDescription, setNewCourseDescription] = useState("");

  // Module and content inputs
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [newContentTitle, setNewContentTitle] = useState("");
  const [newContentType, setNewContentType] = useState("text");
  const [newContentFile, setNewContentFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // AI Question Generator states
  const [questionCourseId, setQuestionCourseId] = useState("");
  const [questionModuleId, setQuestionModuleId] = useState("");
  const [questionType, setQuestionType] = useState("text");
  const [questionTarget, setQuestionTarget] = useState("test");
  const [modulesForQuestionCourse, setModulesForQuestionCourse] = useState([]);
  const [aiQuestions, setAiQuestions] = useState([]);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Custom AI Question Generator
  const [customPrompt, setCustomPrompt] = useState("");
  const [customAIQuestions, setCustomAIQuestions] = useState([]);

  // Questions Library persisted to Firestore
  const [questionsLibrary, setQuestionsLibrary] = useState([]);

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
    if (!selectedCourse) {
      setModules([]);
      setSelectedModule(null);
      return;
    }
    const fetchModules = async () => {
      const snap = await getDocs(
        collection(db, "courses", selectedCourse.id, "modules")
      );
      setModules(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchModules();
  }, [selectedCourse]);

  // Fetch content when module changes
  useEffect(() => {
    if (!selectedCourse || !selectedModule) {
      setContentList([]);
      return;
    }
    const fetchContent = async () => {
      const snap = await getDocs(
        collection(
          db,
          "courses",
          selectedCourse.id,
          "modules",
          selectedModule.id,
          "content"
        )
      );
      setContentList(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchContent();
  }, [selectedCourse, selectedModule]);

  // Fetch modules for selected course in question tab
  useEffect(() => {
    if (!questionCourseId) {
      setModulesForQuestionCourse([]);
      setQuestionModuleId("");
      return;
    }
    const fetchModulesForQuestion = async () => {
      const snap = await getDocs(
        collection(db, "courses", questionCourseId, "modules")
      );
      setModulesForQuestionCourse(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchModulesForQuestion();
  }, [questionCourseId]);

  // Load questions library draft items from Firestore on mount
  useEffect(() => {
    const fetchLibrary = async () => {
      const q = query(collection(db, "questionLibraries"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const loaded = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setQuestionsLibrary(loaded);
    };
    fetchLibrary();
  }, []);

  // Add course
  const addCourse = async () => {
    if (!newCourseTitle.trim()) return alert("Enter course title");
    const docRef = await addDoc(collection(db, "courses"), {
      title: newCourseTitle,
      description: newCourseDescription,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    setCourses([{ id: docRef.id, title: newCourseTitle, description: newCourseDescription }, ...courses]);
    setNewCourseTitle("");
    setNewCourseDescription("");
  };

  // Add module
  const addModule = async () => {
    if (!selectedCourse) return alert("Select course first");
    if (!newModuleTitle.trim()) return alert("Enter module title");
    const docRef = await addDoc(
      collection(db, "courses", selectedCourse.id, "modules"),
      { title: newModuleTitle, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }
    );
    setModules([{ id: docRef.id, title: newModuleTitle }, ...modules]);
    setNewModuleTitle("");
  };

  // Add content with file upload & save URL
  const addContent = async () => {
    if (!selectedCourse || !selectedModule) return alert("Select course & module");
    if (!newContentTitle.trim()) return alert("Enter content title");

    setUploading(true);
    let fileURL = null;
    let filePath = null;

    if (newContentType !== "text" && newContentFile) {
      filePath = `courses/${selectedCourse.id}/modules/${selectedModule.id}/${newContentFile.name}`;
      const storageRef = ref(storage, filePath);
      await uploadBytes(storageRef, newContentFile);
      fileURL = await getDownloadURL(storageRef);
    }

    const contentData = {
      title: newContentTitle,
      type: newContentType,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    if (fileURL) {
      contentData.fileURL = fileURL;
      contentData.filePath = filePath;
    }

    const docRef = await addDoc(
      collection(db, "courses", selectedCourse.id, "modules", selectedModule.id, "content"),
      contentData
    );

    setContentList([{ id: docRef.id, ...contentData }, ...contentList]);
    setNewContentTitle("");
    setNewContentFile(null);
    setNewContentType("text");
    setUploading(false);
  };

  // Delete content both in Firestore and Storage file
  const deleteContent = async (content) => {
    if (!window.confirm(`Delete content "${content.title}"? This cannot be undone.`)) return;

    try {
      if (content.filePath) {
        const storageRef = ref(storage, content.filePath);
        await deleteObject(storageRef);
      }
      await deleteDoc(
        doc(db, "courses", selectedCourse.id, "modules", selectedModule.id, "content", content.id)
      );
      setContentList(contentList.filter((c) => c.id !== content.id));
    } catch (error) {
      alert("Failed to delete content");
      console.error(error);
    }
  };

  // Generate AI questions
  const generateAIQuestions = async () => {
    if (!questionCourseId || !questionModuleId) return alert("Select course & module for questions");
    setAiGenerating(true);
    const moduleObj = modulesForQuestionCourse.find((m) => m.id === questionModuleId);
    const prompt = `Generate 5 ${questionType} questions for a ${questionTarget} in module '${moduleObj?.title || ""}'. Format answers as JSON array.`;

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemma-2-9b-it:free",
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await response.json();
      const jsonStr = data.choices?.[0]?.message?.content ?? "[]";
      let questions = [];
      try {
        questions = JSON.parse(jsonStr);
      } catch {
        questions = [{ text: jsonStr }];
      }
      setAiQuestions(questions);
    } catch (err) {
      alert("AI question generation failed");
      console.error(err);
    } finally {
      setAiGenerating(false);
    }
  };

  const updateQuestion = (index, updatedQuestion) => {
    const list = [...aiQuestions];
    list[index] = updatedQuestion;
    setAiQuestions(list);
  };

  // Custom AI Question Generator
  const generateCustomAIQuestions = async () => {
    if (!customPrompt.trim()) return alert("Enter a prompt for AI");
    setAiGenerating(true);
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemma-2-9b-it:free",
          messages: [{ role: "user", content: customPrompt }],
        }),
      });
      const data = await res.json();
      let jsonStr = data.choices?.[0]?.message?.content ?? "[]";
      jsonStr = jsonStr.replace(/``````/g, "").trim();
      let parsed = [];
      try {
        parsed = JSON.parse(jsonStr).map((q) => ({ text: q.text || "", options: q.options || [] }));
      } catch {
        parsed = [{ text: jsonStr, options: [] }];
      }
      setCustomAIQuestions(parsed);
    } catch (err) {
      alert("Failed to generate AI questions");
      console.error(err);
    } finally {
      setAiGenerating(false);
    }
  };

  const updateCustomQuestion = (i, updated) => {
    const list = [...customAIQuestions];
    list[i] = updated;
    setCustomAIQuestions(list);
  };

  const saveToLibrary = async () => {
    if (aiQuestions.length === 0) return alert("No questions to save");
    const newLibraryEntry = {
      courseId: questionCourseId,
      moduleId: questionModuleId,
      target: questionTarget,
      type: questionType,
      questions: aiQuestions,
      createdAt: serverTimestamp(),
    };
    try {
      const docRef = await addDoc(collection(db, "questionLibraries"), newLibraryEntry);
      setQuestionsLibrary([{ id: docRef.id, ...newLibraryEntry }, ...questionsLibrary]);
      alert("Saved to library");
      setAiQuestions([]);
    } catch (err) {
      alert("Failed to save to library");
      console.error(err);
    }
  };

  const saveCustomToLibrary = async () => {
    if (!customAIQuestions.length || !questionCourseId || !questionModuleId) return alert("Missing data");
    const entry = {
      courseId: questionCourseId,
      moduleId: questionModuleId,
      type: questionType,
      target: "custom",
      questions: customAIQuestions,
      createdAt: serverTimestamp(),
    };
    try {
      const docRef = await addDoc(collection(db, "questionLibraries"), entry);
      setQuestionsLibrary([{ id: docRef.id, ...entry }, ...questionsLibrary]);
      setCustomAIQuestions([]);
      setCustomPrompt("");
      alert("Saved custom questions!");
    } catch (err) {
      alert("Failed to save");
      console.error(err);
    }
  };

  // Delete a saved library entry from Firestore and local state
  const deleteLibraryEntry = async (id) => {
    if (!window.confirm("Delete this saved questions entry? This cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, "questionLibraries", id));
      setQuestionsLibrary(questionsLibrary.filter((entry) => entry.id !== id));
    } catch (err) {
      alert("Failed to delete saved questions");
      console.error(err);
    }
  };

  // Launch questions to student dashboard (placeholder for integration)
  const launchQuestions = (entry) => {
    // Implement integration logic here as needed
    alert(`Launched ${entry.questions.length} questions to student dashboard.`);
  };

  // Helper to view text content in new tab
  const openTextInNewTab = (text) => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    URL.revokeObjectURL(url);
  };

  // Helper to get course title by ID
  const getCourseTitleById = (cid) => {
    return courses.find((c) => c.id === cid)?.title || cid;
  };

  // Helper to get module title by course ID and module ID
  const getModuleTitleById = (cid, mid) => {
    if (cid === questionCourseId) {
      return modulesForQuestionCourse.find((m) => m.id === mid)?.title || mid;
    }
    return mid;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Tabs */}
      <div className="flex space-x-4 mb-6 text-lg font-semibold">
        <button
          onClick={() => setActiveTab("management")}
          className={`px-4 py-2 rounded ${
            activeTab === "management"
              ? "bg-gradient-to-r from-blue-400 to-pink-400 text-white"
              : "bg-gray-200"
          }`}
        >
          Course Management
        </button>
        <button
          onClick={() => setActiveTab("customAI")}
          className={`px-4 py-2 rounded ${
            activeTab === "customAI"
              ? "bg-gradient-to-r from-blue-400 to-pink-400 text-white"
              : "bg-gray-200"
          }`}
        >
          Custom AI Generator
        </button>
      </div>

      {/* Course Management Tab */}
      {activeTab === "management" && (
        <>
          {/* Add new course form */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="New Course Title"
              value={newCourseTitle}
              onChange={(e) => setNewCourseTitle(e.target.value)}
              className="w-full p-2 mb-2 border rounded"
            />
            <textarea
              placeholder="Course Description"
              value={newCourseDescription}
              onChange={(e) => setNewCourseDescription(e.target.value)}
              className="w-full p-2 mb-2 border rounded"
              rows={3}
            />
            <button
              onClick={addCourse}
              className="bg-gradient-to-r from-blue-400 to-pink-400 text-white px-4 py-2 rounded"
            >
              Add Course
            </button>
          </div>

          {/* Expandable courses list */}
          <ExpandableList
            title="Courses"
            items={courses}
            selectedId={selectedCourse?.id}
            onSelect={setSelectedCourse}
          />

          {/* Modules for selected course */}
          {selectedCourse && (
            <>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder={`New Module Title for ${selectedCourse.title}`}
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  className="w-full p-2 mb-2 border rounded"
                />
                <button
                  onClick={addModule}
                  className="bg-gradient-to-r from-blue-400 to-pink-400 text-white px-4 py-2 rounded"
                >
                  Add Module
                </button>
              </div>
              <ExpandableList
                title="Modules"
                items={modules}
                selectedId={selectedModule?.id}
                onSelect={setSelectedModule}
              />
            </>
          )}

          {/* Content for selected module */}
          {selectedModule && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-2">Add Content</h3>
              <input
                type="text"
                placeholder="Content Title"
                value={newContentTitle}
                onChange={(e) => setNewContentTitle(e.target.value)}
                className="w-full p-2 mb-2 border rounded"
              />
              <select
                value={newContentType}
                onChange={(e) => setNewContentType(e.target.value)}
                className="w-full p-2 mb-2 border rounded"
              >
                <option value="image">Image</option>
                <option value="image">Video</option>
                <option value="file">Document</option>
              </select>
              {newContentType === "file" && (
                <input
                  type="file"
                  onChange={(e) => setNewContentFile(e.target.files[0])}
                  className="mb-2"
                />
              )}
              <button
                onClick={addContent}
                disabled={uploading}
                className="bg-gradient-to-r from-blue-400 to-pink-400 text-white px-4 py-2 rounded mb-4"
              >
                {uploading ? "Uploading..." : "Add Content"}
              </button>

              {/* Content List */}
              <div>
                <h3 className="text-xl font-semibold mb-2">Module Content</h3>
                {contentList.map((c) => (
                  <div
                    key={c.id}
                    className="border p-2 mb-2 flex justify-between items-center rounded"
                  >
                    <span>{c.title}</span>
                    <div className="flex gap-2">
                      {c.type === "text" && (
                        <button
                          onClick={() => openTextInNewTab(c.text)}
                          className="text-blue-500"
                        >
                          View
                        </button>
                      )}
                      {c.type === "file" && c.fileURL && (
                        <a
                          href={c.fileURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500"
                        >
                          Download
                        </a>
                      )}
                      <button
                        onClick={() => deleteContent(c)}
                        className="text-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Custom AI Generator Tab */}
      {activeTab === "customAI" && (
        <div>
          
          <textarea
            placeholder="Type exactly what you want the AI to generate..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
            rows={4}
          />

          <select
            value={questionCourseId}
            onChange={(e) => setQuestionCourseId(e.target.value)}
            className="p-2 border rounded mb-4 w-full max-w-md"
          >
            <option value="">Select Course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>

          <select
            value={questionModuleId}
            onChange={(e) => setQuestionModuleId(e.target.value)}
            className="p-2 border rounded mb-4 w-full max-w-md"
          >
            <option value="">Select Module</option>
            {modulesForQuestionCourse.map((module) => (
              <option key={module.id} value={module.id}>
                {module.title}
              </option>
            ))}
          </select>

          <select
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
            className="p-2 border rounded mb-4 w-full max-w-md"
          >
            <option value="text">Text</option>
            <option value="multiple-choice">Multiple Choice</option>
          </select>

          <button
            onClick={generateCustomAIQuestions}
            className="px-4 py-2 rounded bg-gradient-to-r from-blue-400 to-pink-400 text-white mb-4"
          >
            {aiGenerating ? "Generating..." : "Generate Questions"}
          </button>

          {customAIQuestions.map((q, i) => (
            <QuestionEditor
              key={i}
              question={q}
              onChange={(upd) => updateCustomQuestion(i, upd)}
              questionType={questionType}
            />
          ))}

          {customAIQuestions.length > 0 && (
            <button
              onClick={saveCustomToLibrary}
              className="mt-2 bg-gradient-to-r from-blue-400 to-pink-400 text-white py-2 px-4 rounded"
            >
              Save to Library
            </button>
          )}

          {/* Questions Library section */}
          <div className="mt-10">
            <h3 className="text-xl font-semibold mb-4">Saved Questions Library</h3>
            {questionsLibrary.length === 0 && (
              <p className="text-gray-600">No saved questions yet.</p>
            )}
            {questionsLibrary.map((entry) => (
              <div key={entry.id} className="border p-4 mb-4 rounded bg-gray-50">
                <div className="mb-3 text-sm text-gray-700">
                  <span className="font-semibold">Course:</span> {getCourseTitleById(entry.courseId)}{" "}
                  &nbsp;&nbsp;
                  <span className="font-semibold">Module:</span> {getModuleTitleById(entry.courseId, entry.moduleId)}{" "}
                  &nbsp;&nbsp;
                  <span className="font-semibold">Type:</span> {entry.type}{" "}
                  &nbsp;&nbsp;
                  <span className="font-semibold">Target:</span> {entry.target}
                </div>
                <div className="mb-4">
                  {entry.questions.map((q, idx) => (
                    <div key={idx} className="mb-3 pl-4 border-l-2 border-blue-400">
                      <p className="font-semibold mb-1">{idx + 1}. {q.text}</p>
                      {entry.type === "multiple-choice" && q.options && q.options.length > 0 && (
                        <ul className="list-disc list-inside ml-6">
                          {q.options.map((opt, oi) => (
                            <li key={oi}>{opt}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => launchQuestions(entry)}
                    className="bg-gradient-to-r from-blue-400 to-pink-400 text-white px-4 py-2 rounded"
                  >
                    Launch
                  </button>
                  <button
                    onClick={() => deleteLibraryEntry(entry.id)}
                    className="bg-gradient-to-r from-blue-400 to-pink-400 text-white px-4 py-2 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
