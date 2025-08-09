import React from "react";
import { useParams, useNavigate } from "react-router-dom";

const coursesData = {
  1: {
    title: "Introduction to Web Development",
    description: "Learn HTML, CSS, and JavaScript fundamentals.",
    lessons: [
      "HTML Basics",
      "CSS Fundamentals",
      "JavaScript Introduction",
      "Building Your First Website",
    ],
  },
  2: {
    title: "Data Analysis with Python",
    description: "Explore data with Python libraries like Pandas and Matplotlib.",
    lessons: [
      "Python Basics",
      "Pandas for Data Analysis",
      "Data Visualization with Matplotlib",
      "Project: Analyzing Sales Data",
    ],
  },
  3: {
    title: "UI/UX Design Principles",
    description: "Understand key concepts for designing user-friendly interfaces.",
    lessons: [
      "Design Fundamentals",
      "User Research",
      "Wireframing & Prototyping",
      "Usability Testing",
    ],
  },
};

const CourseContent = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const course = coursesData[id];

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center p-6 min-h-screen bg-gray-50">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Course not found</h2>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-gradient-to-r from-blue-400 to-pink-400 text-white rounded-lg shadow hover:from-blue-500 hover:to-pink-500 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-b from-blue-50 to-pink-50 min-h-screen rounded-xl shadow-md">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-block text-blue-600 hover:underline font-medium"
      >
        &larr; Back to Courses
      </button>

      <h1 className="text-4xl font-bold mb-3 text-gray-900">{course.title}</h1>
      <p className="text-gray-700 mb-8">{course.description}</p>

      <h2 className="text-3xl font-semibold mb-4 text-gray-800">Lessons</h2>
      <ul className="list-disc list-inside space-y-3">
        {course.lessons.map((lesson, idx) => (
          <li
            key={idx}
            className="text-gray-800 text-lg p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition cursor-default"
          >
            {lesson}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CourseContent;
