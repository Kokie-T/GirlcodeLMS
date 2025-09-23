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
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

// Reusable expandable list
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

// Question editor
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

  // Course inputs
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseDescription, setNewCourseDescription] = useState("");

  // Module and content inputs
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [newContentTitle, setNewContentTitle] = useState("");
  const [newContentType, setNewContentType] = useState("text");
  const [newContentFile, setNewContentFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Custom AI Question Generator
  const [questionCourseId, setQuestionCourseId] = useState("");
  const [questionModuleId, setQuestionModuleId] = useState("");
  const [questionType, setQuestionType] = useState("text");
  const [modulesForQuestionCourse, setModulesForQuestionCourse] = useState([]);
  const [customPrompt, setCustomPrompt] = useState("");
  const [customAIQuestions, setCustomAIQuestions] = useState([]);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Questions Library
  const [questionsLibrary, setQuestionsLibrary] = useState([]);

  // Fetch courses
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

  // Fetch modules for selected course in AI tab
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

  // Load questions library
  useEffect(() => {
    const fetchLibrary = async () => {
      const q = query(collection(db, "questionLibraries"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setQuestionsLibrary(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
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

  // Add content
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

  // Delete content
  const deleteContent = async (content) => {
    if (!window.confirm(`Delete content "${content.title}"?`)) return;
    try {
      if (content.filePath) await deleteObject(ref(storage, content.filePath));
      await deleteDoc(
        doc(db, "courses", selectedCourse.id, "modules", selectedModule.id, "content", content.id)
      );
      setContentList(contentList.filter((c) => c.id !== content.id));
    } catch (err) {
      alert("Failed to delete content");
      console.error(err);
    }
  };

  // Generate custom AI questions
  const generateCustomAIQuestions = async () => {
    if (!customPrompt.trim() || !questionCourseId || !questionModuleId) return alert("Missing data");
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
      let jsonStr = data.choices?.[0]?.message?.content?.replace(/``````/g, "").trim() || "[]";
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

  const deleteLibraryEntry = async (id) => {
    if (!window.confirm("Delete this entry?")) return;
    try {
      await deleteDoc(doc(db, "questionLibraries", id));
      setQuestionsLibrary(questionsLibrary.filter((e) => e.id !== id));
    } catch (err) {
      alert("Failed to delete saved questions");
      console.error(err);
    }
  };

  const launchQuestions = (entry) => {
    alert(`Launched ${entry.questions.length} questions to student dashboard.`);
  };

  const openTextInNewTab = (text) => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    URL.revokeObjectURL(url);
  };

  const getCourseTitleById = (cid) => courses.find((c) => c.id === cid)?.title || cid;
  const getModuleTitleById = (cid, mid) =>
    cid === questionCourseId
      ? modulesForQuestionCourse.find((m) => m.id === mid)?.title || mid
      : mid;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Tabs */}
      <div className="flex space-x-4 mb-6 text-lg font-semibold">
        <button
          onClick={() => setActiveTab("management")}
          className={`px-4 py-2 rounded ${activeTab === "management" ? "bg-gradient-to-r from-blue-400 to-pink-400 text-white" : "bg-gray-200"}`}
        >
          Course Management
        </button>
        <button
          onClick={() => setActiveTab("customAI")}
          className={`px-4 py-2 rounded ${activeTab === "customAI" ? "bg-gradient-to-r from-blue-400 to-pink-400 text-white" : "bg-gray-200"}`}
        >
          Custom AI Generator
        </button>
      </div>

      {/* Course Management Tab */}
      {activeTab === "management" && (
        <>
          {/* Add new course form */}
          <div className="mb-4">
            <input type="text" placeholder="New Course Title" value={newCourseTitle} onChange={(e) => setNewCourseTitle(e.target.value)} className="w-full p-2 mb-2 border rounded" />
            <textarea placeholder="Course Description" value={newCourseDescription} onChange={(e) => setNewCourseDescription(e.target.value)} className="w-full p-2 mb-2 border rounded" rows={3} />
            <button onClick={addCourse} className="bg-gradient-to-r from-blue-400 to-pink-400 text-white px-4 py-2 rounded">Add Course</button>
          </div>

          {/* Expandable courses */}
          <ExpandableList title="Courses" items={courses} selectedId={selectedCourse?.id} onSelect={setSelectedCourse} />

          {/* Modules */}
          {selectedCourse && (
            <>
              <div className="mb-4">
                <input type="text" placeholder={`New Module Title for ${selectedCourse.title}`} value={newModuleTitle} onChange={(e) => setNewModuleTitle(e.target.value)} className="w-full p-2 mb-2 border rounded" />
                <button onClick={addModule} className="bg-gradient-to-r from-blue-400 to-pink-400 text-white px-4 py-2 rounded">Add Module</button>
              </div>
              <ExpandableList title="Modules" items={modules} selectedId={selectedModule?.id} onSelect={setSelectedModule} />
            </>
          )}

          {/* Content */}
          {selectedModule && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-2">Add Content</h3>
              <input type="text" placeholder="Content Title" value={newContentTitle} onChange={(e) => setNewContentTitle(e.target.value)} className="w-full p-2 mb-2 border rounded" />
              <select value={newContentType} onChange={(e) => setNewContentType(e.target.value)} className="w-full p-2 mb-2 border rounded">
                <option value="text">Text</option>
                <option value="file">Document</option>
              </select>
              {newContentType === "file" && <input type="file" onChange={(e) => setNewContentFile(e.target.files[0])} className="mb-2" />}
              <button onClick={addContent} disabled={uploading} className="bg-gradient-to-r from-blue-400 to-pink-400 text-white px-4 py-2 rounded mb-4">{uploading ? "Uploading..." : "Add Content"}</button>

              <div>
                <h3 className="text-xl font-semibold mb-2">Module Content</h3>
                {contentList.map((c) => (
                  <div key={c.id} className="border p-2 mb-2 flex justify-between items-center rounded">
                    <span>{c.title}</span>
                    <div className="flex gap-2">
                      {c.type === "text" && <button onClick={() => openTextInNewTab(c.text)} className="text-blue-500">View</button>}
                      {c.type === "file" && c.fileURL && <a href={c.fileURL} target="_blank" rel="noreferrer" className="text-blue-500">Download</a>}
                      <button onClick={() => deleteContent(c)} className="text-red-500">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Custom AI Tab */}
      {activeTab === "customAI" && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Custom AI Question Generator</h2>

          {/* Course & Module Selection */}
          <div className="mb-4">
            <select value={questionCourseId} onChange={(e) => setQuestionCourseId(e.target.value)} className="w-full p-2 mb-2 border rounded">
              <option value="">Select Course</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>

            <select value={questionModuleId} onChange={(e) => setQuestionModuleId(e.target.value)} className="w-full p-2 mb-2 border rounded" disabled={!modulesForQuestionCourse.length}>
              <option value="">Select Module</option>
              {modulesForQuestionCourse.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>

            <select value={questionType} onChange={(e) => setQuestionType(e.target.value)} className="w-full p-2 mb-2 border rounded">
              <option value="text">Text</option>
              <option value="multiple-choice">Multiple Choice</option>
            </select>
          </div>

          {/* Custom Prompt */}
          <textarea rows={3} placeholder="Enter prompt for AI question generator..." value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} className="w-full p-2 mb-2 border rounded" />

          <div className="mb-4">
            <button onClick={generateCustomAIQuestions} disabled={aiGenerating} className="bg-gradient-to-r from-blue-400 to-pink-400 text-white px-4 py-2 rounded">{aiGenerating ? "Generating..." : "Generate Questions"}</button>
            <button onClick={saveCustomToLibrary} disabled={!customAIQuestions.length} className="ml-2 bg-green-500 text-white px-4 py-2 rounded">Save to Library</button>
          </div>

          {/* Generated Questions */}
          {customAIQuestions.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Generated Questions</h3>
              {customAIQuestions.map((q, idx) => (
                <QuestionEditor key={idx} question={q} questionType={questionType} onChange={(updated) => updateCustomQuestion(idx, updated)} />
              ))}
            </div>
          )}

          {/* Questions Library */}
          <div>
            <h3 className="font-semibold mb-2">Saved Questions Library</h3>
            {questionsLibrary.map((entry) => (
              <div key={entry.id} className="border p-2 mb-2 rounded flex justify-between items-center">
                <div>
                  <p><strong>Course:</strong> {getCourseTitleById(entry.courseId)}</p>
                  <p><strong>Module:</strong> {getModuleTitleById(entry.courseId, entry.moduleId)}</p>
                  <p><strong>Type:</strong> {entry.type}</p>
                  <p><strong>Questions:</strong> {entry.questions.length}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => launchQuestions(entry)} className="text-blue-500">Launch</button>
                  <button onClick={() => deleteLibraryEntry(entry.id)} className="text-red-500">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
