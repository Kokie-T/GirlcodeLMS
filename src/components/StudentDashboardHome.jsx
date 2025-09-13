// src/components/StudentDashboardHome.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db, auth } from "../firebase";

export default function StudentDashboardHome() {
  const [myCourses, setMyCourses] = useState([]);
  const [upcomingAssessments, setUpcomingAssessments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const uid = auth.currentUser.uid;

        // Fetch student's courses
        const coursesSnap = await getDocs(
          query(collection(db, "courses"), where("students", "array-contains", uid))
        );
        setMyCourses(coursesSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        // Fetch upcoming assessments (limit 5)
        const assessmentsSnap = await getDocs(
          query(collection(db, "assessments"), where("students", "array-contains", uid), orderBy("dueDate"), limit(5))
        );
        setUpcomingAssessments(assessmentsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        // Fetch announcements (limit 5)
        const announcementsSnap = await getDocs(
          query(collection(db, "announcements"), orderBy("timestamp", "desc"), limit(5))
        );
        setAnnouncements(announcementsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Error fetching student dashboard data:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-4 dark:text-white">Welcome, Student!</h2>

      <section className="mb-6">
        <h3 className="font-semibold dark:text-white">My Courses</h3>
        {myCourses.length ? (
          <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300">
            {myCourses.map(c => <li key={c.id}>{c.title}</li>)}
          </ul>
        ) : <p className="dark:text-gray-300">No courses enrolled yet.</p>}
      </section>

      <section className="mb-6">
        <h3 className="font-semibold dark:text-white">Upcoming Assessments</h3>
        {upcomingAssessments.length ? (
          <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300">
            {upcomingAssessments.map(a => (
              <li key={a.id}>{a.title} - Due: {new Date(a.dueDate.seconds * 1000).toLocaleDateString()}</li>
            ))}
          </ul>
        ) : <p className="dark:text-gray-300">No upcoming assessments.</p>}
      </section>

      <section>
        <h3 className="font-semibold dark:text-white">Recent Announcements</h3>
        {announcements.length ? (
          <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300">
            {announcements.map(a => <li key={a.id}>{a.title}</li>)}
          </ul>
        ) : <p className="dark:text-gray-300">No announcements yet.</p>}
      </section>
    </div>
  );
}
