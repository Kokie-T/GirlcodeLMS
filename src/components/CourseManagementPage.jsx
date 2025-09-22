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
        <button className="text-fuchsia-500">
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
                  ? "bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white"
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
          <button className="text-blue-600 underline text-sm" onClick={addOption}>
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
          Authorization: "Bearer ", // replace with real key
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "LMS Pro",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-r1:free",
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

  // Save questions to library and persist to Firestore
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

  const updateQuestion = (index, updatedQuestion) => {
    const list = [...aiQuestions];
    list[index] = updatedQuestion;
    setAiQuestions(list);
  };

  // Helper to view text content in new tab
  const openTextInNewTab = (text) => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Tabs */}
      <div className="flex space-x-4 mb-6 text-lg font-semibold">
        <button
          onClick={() => setActiveTab("management")}
          className={`px-4 py-2 rounded ${
            activeTab === "management"
              ? "bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white"
              : "bg-gray-200"
          }`}
        >
          Course Management
        </button>
        <button
          onClick={() => setActiveTab("questions")}
          className={`px-4 py-2 rounded ${
            activeTab === "questions"
              ? "bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white"
              : "bg-gray-200"
          }`}
        >
          Questions Library
        </button>
      </div>

      {/* Course Management Tab */}
      {activeTab === "management" && (
        <>
          {/* Add new course form with description */}
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
              className="bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white px-4 py-2 rounded"
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
                  className="bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white px-4 py-2 rounded"
                >
                  Add Module
                </button>
              </div>

              <ExpandableList
                title={`Modules for ${selectedCourse.title}`}
                items={modules}
                selectedId={selectedModule?.id}
                onSelect={setSelectedModule}
              />
            </>
          )}

          {/* Content upload and listing */}
          {selectedModule && (
            <div className="mb-4">
              <input
                type="text"
                className="w-full p-2 mb-2 border rounded"
                placeholder="Content Title"
                value={newContentTitle}
                onChange={(e) => setNewContentTitle(e.target.value)}
              />
              <select
                className="w-full p-2 mb-2 border rounded"
                value={newContentType}
                onChange={(e) => setNewContentType(e.target.value)}
              >
                <option value="text">Text</option>
                <option value="multiple-choice">Multiple Choice</option>
                <option value="video">Video</option>
                <option value="document">Document</option>
                <option value="image">Image</option>
              </select>

              <input
                type="file"
                onChange={(e) => setNewContentFile(e.target.files?.[0] || null)}
                className="mb-2"
                disabled={newContentType === "text"}
              />

              <button
                disabled={uploading}
                onClick={addContent}
                className="bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white px-4 py-2 rounded"
              >
                {uploading ? "Uploading..." : "Upload Content"}
              </button>

              <div className="mt-4 max-h-48 overflow-auto border rounded p-2">
                <h4 className="text-lg font-semibold mb-2">Uploaded Content</h4>
                {contentList.length === 0 && <p>No content uploaded</p>}
                {contentList.map((content) => (
                  <div
                    key={content.id}
                    className="flex justify-between mb-2 items-center"
                  >
                    <span>
                      {content.title} <em>({content.type})</em>
                    </span>
                    <div className="flex gap-4">
                      {content.type === "text" ? (
                        <button
                          onClick={() => openTextInNewTab(content.title)}
                          className="text-fuchsia-600 underline"
                        >
                          View
                        </button>
                      ) : (
                        content.fileURL && (
                          <a
                            href={content.fileURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-fuchsia-600 underline"
                          >
                            View
                          </a>
                        )
                      )}
                      <button
                        onClick={() => deleteContent(content)}
                        className="text-red-600 hover:underline"
                        aria-label={`Delete content ${content.title}`}
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

      {/* Questions Library Tab */}
      {activeTab === "questions" && (
        <div>
          <h2 className="text-2xl font-bold mb-4">AI Question Generator & Library</h2>

          <select
            className="p-2 border rounded mb-4 w-full max-w-md"
            value={questionCourseId}
            onChange={(e) => setQuestionCourseId(e.target.value)}
          >
            <option value="">Select Course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>

          <select
            className="p-2 border rounded mb-4 w-full max-w-md"
            value={questionModuleId}
            onChange={(e) => setQuestionModuleId(e.target.value)}
            disabled={!questionCourseId}
          >
            <option value="">Select Module</option>
            {modulesForQuestionCourse.map((module) => (
              <option key={module.id} value={module.id}>
                {module.title}
              </option>
            ))}
          </select>

          <select
            className="p-2 border rounded mb-4 w-full max-w-md"
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
          >
            <option value="text">Text</option>
            <option value="multiple-choice">Multiple Choice</option>
          </select>

          <select
            className="p-2 border rounded mb-4 w-full max-w-md"
            value={questionTarget}
            onChange={(e) => setQuestionTarget(e.target.value)}
          >
            <option value="test">Test</option>
            <option value="assignment">Assignment</option>
            <option value="quiz">Quiz</option>
          </select>

          <button
            disabled={aiGenerating}
            onClick={generateAIQuestions}
            className={`px-4 py-2 rounded text-white ${
              aiGenerating
                ? "bg-gray-400"
                : "bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:opacity-90"
            }`}
          >
            {aiGenerating ? "Generating..." : "Generate Questions"}
          </button>

          {aiQuestions.length > 0 &&
            aiQuestions.map((q, i) => (
              <QuestionEditor
                key={i}
                question={q}
                onChange={(updated) => updateQuestion(i, updated)}
                questionType={questionType}
              />
            ))}

          {aiQuestions.length > 0 && (
            <button
              onClick={saveToLibrary}
              className="mt-4 bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white py-2 px-4 rounded"
            >
              Save Questions to Library (Draft)
            </button>
          )}

          {questionsLibrary.length === 0 && <p className="mt-4">No saved question drafts.</p>}
          {questionsLibrary.map((draft, idx) => (
            <div key={draft.id || idx} className="border rounded p-4 mt-4 bg-gray-50">
              <div>
                <strong>Course:</strong> {courses.find((c) => c.id === draft.courseId)?.title || "Unknown"}
              </div>
              <div><strong>Module ID:</strong> {draft.moduleId}</div>
              <div><strong>Target:</strong> {draft.target}</div>
              <div><strong>Type:</strong> {draft.type}</div>
              <ul className="list-disc pl-5 mt-2">
                {draft.questions.map((q, i) => (
                  <li key={i}>{typeof q === "string" ? q : q.text}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
