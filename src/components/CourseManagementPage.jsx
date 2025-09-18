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
  const [uploadedContent, setUploadedContent] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [editingCourse, setEditingCourse] = useState(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [editingContent, setEditingContent] = useState(null);
  const [activeAIType, setActiveAIType] = useState("");
  const [aiTopic, setAiTopic] = useState("");
  const [testLibrary, setTestLibrary] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [questionCount, setQuestionCount] = useState(5);
  const [difficultyLevel, setDifficultyLevel] = useState("medium");
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

  // Fetch educational content
  const fetchContent = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "materials"));
      const contentData = querySnapshot.docs.map((doc) => ({ 
        id: doc.id, 
        ...doc.data(),
        uploadedAt: doc.data().createdAt ? doc.data().createdAt.toDate().toLocaleString() : 'Unknown date'
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
        createdAt: doc.data().createdAt ? doc.data().createdAt.toDate().toLocaleDateString() : 'Unknown date'
      }));
      setTestLibrary(assessments);
    } catch (error) {
      console.error("Error fetching assessments:", error);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchContent();
    fetchAssessments();
  }, []);

  // Create or Edit Course
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

  // Delete Course
  const handleDeleteCourse = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await deleteDoc(doc(db, "courses", id));
      fetchCourses();
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("Error deleting course");
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadStatus("");
    }
  };

  // Create or Edit Content
  const handleUpload = async () => {
    if (!title || !type || !selectedCourse) {
      return alert("Please select a course, enter title and type");
    }

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
          createdAt: serverTimestamp(),
        });
      }

      setTitle("");
      setType("");
      setDescription("");
      setFile(null);
      setSelectedCourse("");
      setUploadStatus("Upload successful!");
      setTimeout(() => setUploadStatus(""), 3000);
      fetchContent();
    } catch (error) {
      console.error("Error uploading content:", error);
      setUploadStatus("Upload failed!");
      alert("Error uploading content");
    }
  };

  // Delete content
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

  // AI Generate Assessment - Using OpenRouter API
  const handleAIGenerate = async () => {
    if (!activeAIType || !aiTopic) return alert("Select type and enter topic");
    
    setIsGenerating(true);
    
    try {
      const prompt = `Create a ${activeAIType} about "${aiTopic}" with ${questionCount} ${difficultyLevel} difficulty questions. 
      Each question should have 4 options and include an explanation for the correct answer.
      Format the response as JSON with this structure: 
      {
        "title": "Title of the assessment",
        "type": "${activeAIType}",
        "difficulty": "${difficultyLevel}",
        "questions": [
          {
            "question": "Question text",
            "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
            "correctAnswer": 0,
            "explanation": "Explanation of why this is correct"
          }
        ]
      }`;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer",
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "LMS Pro",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "deepseek/deepseek-r1:free",
          "messages": [
            {
              "role": "user",
              "content": prompt
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const generatedData = JSON.parse(jsonMatch[0]);
        setGeneratedContent(generatedData);
      } else {
        throw new Error("No valid JSON found in response");
      }
      
    } catch (error) {
      console.error("Error generating AI content:", error);
      // Fallback to mock questions if API fails
      const mockQuestions = generateMockQuestions(aiTopic, questionCount, difficultyLevel);
      setGeneratedContent({
        title: `${aiTopic} - ${activeAIType}`,
        type: activeAIType,
        questions: mockQuestions,
        topic: aiTopic
      });
      alert("AI service temporarily unavailable. Using sample questions.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Save AI-generated assessment to Firestore
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
        questionCount: questionCount,
        status: "Draft",
        createdAt: serverTimestamp(),
      });
      
      alert(`${generatedContent.type} saved successfully!`);
      setGeneratedContent(null);
      setActiveAIType("");
      setAiTopic("");
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

  // Generate mock questions (fallback)
  const generateMockQuestions = (topic, count, difficulty) => {
    const questions = [];
    const difficultyMultiplier = difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3;
    
    for (let i = 1; i <= count; i++) {
      questions.push({
        id: i,
        question: `What is an important aspect of ${topic}? (Question ${i})`,
        options: [
          `Option A for ${topic}`,
          `Option B for ${topic}`,
          `Option C for ${topic}`,
          `Option D for ${topic}`
        ],
        correctAnswer: Math.floor(Math.random() * 4),
        explanation: `This question tests your knowledge of ${topic} at a ${difficulty} level.`
      });
    }
    
    return questions;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <h1 className="text-2xl font-bold mb-6 text-blue-800">Course Management</h1>

      {/* Tabs */}
      <div className="flex space-x-6 border-b mb-6">
        <button
          className={`pb-2 font-medium ${
            activeTab === "courses"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("courses")}
        >
          Courses
        </button>
        <button
          className={`pb-2 font-medium ${
            activeTab === "content"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("content")}
        >
          Educational Content
        </button>
        <button
          className={`pb-2 font-medium ${
            activeTab === "tests"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("tests")}
        >
          Tests & Assessments
        </button>
      </div>

      {/* Courses Tab */}
      {activeTab === "courses" && (
        <div>
          <div className="bg-white shadow rounded-lg p-6 space-y-4 mb-8">
            <h3 className="text-lg font-semibold mb-2 text-blue-600">
              {editingCourse ? "Edit Course" : "Create New Course"}
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Title
              </label>
              <input
                type="text"
                placeholder="Enter course title"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                className="w-full border rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                placeholder="Enter course description"
                value={courseDescription}
                onChange={(e) => setCourseDescription(e.target.value)}
                className="w-full border rounded-lg p-2"
                rows="3"
              />
            </div>
            <div className="flex justify-end">
              {editingCourse && (
                <button
                  onClick={() => {
                    setEditingCourse(null);
                    setCourseTitle("");
                    setCourseDescription("");
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 mr-3"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleCreateOrEditCourse}
                disabled={!courseTitle}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
              >
                {editingCourse ? "Update Course" : "Create Course"}
              </button>
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-4 text-blue-600">Course Library</h3>
          <div className="bg-white shadow rounded-lg divide-y">
            {courses.length > 0 ? (
              courses.map((course) => (
                <div key={course.id} className="flex justify-between items-center p-4">
                  <div>
                    <p className="font-medium">{course.title}</p>
                    <p className="text-sm text-gray-500">{course.description}</p>
                  </div>
                  <div className="space-x-2">
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      onClick={() => {
                        setEditingCourse(course);
                        setCourseTitle(course.title);
                        setCourseDescription(course.description);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-pink-500 text-white px-3 py-1 rounded hover:bg-pink-600"
                      onClick={() => handleDeleteCourse(course.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                No courses created yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Educational Content Tab */}
      {activeTab === "content" && (
        <div>
          <div className="bg-white shadow rounded-lg p-6 space-y-4 mb-8">
            <h3 className="text-lg font-semibold mb-2 text-blue-600">
              {editingContent ? "Edit Content" : "Upload New Content"}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Course
                </label>
                <select
                  className="w-full border rounded-lg p-2"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content Type
                </label>
                <select
                  className="w-full border rounded-lg p-2"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                placeholder="Enter title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border rounded-lg p-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                placeholder="Enter description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border rounded-lg p-2"
                rows="3"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload File
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full border rounded-lg p-2"
              />
              {file && <p className="text-sm text-green-600 mt-1">File selected: {file.name}</p>}
              {editingContent && editingContent.fileURL && !file && (
                <p className="text-sm text-gray-600 mt-1">
                  Current file: <a href={editingContent.fileURL} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View file</a>
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
                    setUploadStatus("");
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancel Edit
                </button>
              )}
              <button
                onClick={handleUpload}
                disabled={!title || !type || !selectedCourse}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
              >
                {editingContent ? "Update Content" : "Upload Content"}
              </button>
            </div>
          </div>

          {/* Content Library */}
          <h3 className="text-lg font-semibold mb-4 text-blue-600">
            Content Library
          </h3>
          <div className="bg-white shadow rounded-lg divide-y">
            {uploadedContent.length > 0 ? (
              uploadedContent.map((content) => {
                const course = courses.find(c => c.id === content.courseId);
                return (
                  <div key={content.id} className="flex justify-between items-start p-4">
                    <div className="flex-1">
                      <p className="font-medium">{content.title}</p>
                      <p className="text-sm text-gray-500">
                        {content.type} • {course ? course.title : "Unknown Course"}
                      </p>
                      <p className="text-sm mt-1">{content.description}</p>
                      {content.uploadedAt && (
                        <p className="text-xs text-gray-400 mt-1">Uploaded: {content.uploadedAt}</p>
                      )}
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
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 mb-2 sm:mb-0"
                        onClick={() => {
                          setEditingContent(content);
                          setTitle(content.title);
                          setType(content.type);
                          setDescription(content.description);
                          setSelectedCourse(content.courseId);
                          setFile(null);
                          setUploadStatus("");
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        className="bg-pink-500 text-white px-3 py-1 rounded hover:bg-pink-600"
                        onClick={() => handleDeleteContent(content.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-gray-500">
                No content uploaded yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tests & Assessments Tab */}
      {activeTab === "tests" && (
        <div>
          {/* AI Generation Section */}
          <div className="bg-white shadow rounded-lg p-6 space-y-4 mb-8">
            <h3 className="text-lg font-semibold mb-2 text-blue-600">
              Generate Using AI
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Type
                </label>
                <select
                  className="w-full border rounded-lg p-2"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enter Topic
                </label>
                <input
                  type="text"
                  placeholder="Enter topic"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  className="w-full border rounded-lg p-2"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Questions
                </label>
                <select
                  className="w-full border rounded-lg p-2"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty Level
                </label>
                <select
                  className="w-full border rounded-lg p-2"
                  value={difficultyLevel}
                  onChange={(e) => setDifficultyLevel(e.target.value)}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={handleAIGenerate}
                disabled={isGenerating || !activeAIType || !aiTopic}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:bg-purple-300"
              >
                {isGenerating ? "Generating..." : "Generate Using AI"}
              </button>
            </div>
          </div>

          {/* Preview Generated Content */}
          {generatedContent && (
            <div className="bg-white shadow rounded-lg p-6 space-y-4 mb-8">
              <h3 className="text-lg font-semibold text-blue-600">
                Preview: {generatedContent.title}
              </h3>
              
              <div className="max-h-96 overflow-y-auto">
                {generatedContent.questions.map((q, index) => (
                  <div key={q.id || index} className="mb-6 p-4 border rounded-lg">
                    <p className="font-medium mb-2">{index + 1}. {q.question}</p>
                    <div className="space-y-2 ml-4">
                      {q.options.map((option, i) => (
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
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{q.explanation}</p>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setGeneratedContent(null)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
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
            </div>
          )}

          {/* Test Library */}
          <h3 className="text-lg font-semibold mb-4 text-blue-600">
            Test Library
          </h3>
          <div className="bg-white shadow rounded-lg divide-y">
            {testLibrary.length > 0 ? (
              testLibrary.map((test) => (
                <div
                  key={test.id}
                  className="flex justify-between items-center p-4"
                >
                  <div>
                    <p className="font-medium">{test.title}</p>
                    <p className="text-sm text-gray-500">
                      {test.questions?.length || 0} Questions • {test.type} • {test.difficulty}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        test.status === "Published"
                          ? "bg-green-100 text-green-600"
                          : "bg-yellow-100 text-yellow-600"
                      }`}
                    >
                      {test.status}
                    </span>
                    {test.createdAt && (
                      <p className="text-xs text-gray-400 mt-1">Created: {test.createdAt}</p>
                    )}
                  </div>
                  <div className="space-x-2">
                    {test.status === "Published" ? (
                      <button className="bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-800">
                        View Results
                      </button>
                    ) : (
                      <button 
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                        onClick={() => handlePublishAssessment(test.id)}
                      >
                        Publish
                      </button>
                    )}
                    <button className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">
                      Edit
                    </button>
                    <button 
                      className="bg-pink-500 text-white px-3 py-1 rounded hover:bg-pink-600"
                      onClick={() => handleDeleteAssessment(test.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                No assessments yet. Generate your first one using the AI tool above.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}