import React from 'react';
import { useNavigate } from 'react-router-dom';

const assessments = [
  {
    id: 1,
    title: "HTML Basics Quiz",
    courseId: 1,
  },
  {
    id: 2,
    title: "Python Data Analysis Test",
    courseId: 2,
  },
  {
    id: 3,
    title: "UI/UX Design Open Questions",
    courseId: 3,
  },
];

const assessmentsData = {
  1: {
    title: "HTML Basics Quiz",
    timeLimit: 120, // 2 minutes
    questions: [
      // ...
    ],
  },
  2: {
    title: "Python Data Analysis Test",
    timeLimit: 180, // 3 minutes
    questions: [
      // ...
    ],
  },
  3: {
    title: "UI/UX Design Open Questions",
    timeLimit: 300, // 5 minutes
    questions: [
      // ...
    ],
  },
};

// Example enrolled course IDs for the learner
const learnerCourseIds = [1, 2, 3];

export default function Assessments() {
  const navigate = useNavigate();

  // Filter assessments by enrolled courses
  const filtered = assessments.filter(a => learnerCourseIds.includes(a.courseId));

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-semibold mb-6">Assessments</h1>

      <div className="space-y-4">
        {filtered.map((a) => (
          <div
            key={a.id}
            className="bg-white p-5 rounded-lg shadow cursor-pointer hover:shadow-md"
            onClick={() => navigate(`/assessments/${a.id}`)}
          >
            <h2 className="text-lg font-semibold">{a.title}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}