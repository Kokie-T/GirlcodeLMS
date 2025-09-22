import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs, query, where, orderBy, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import LearnerSidebar from "../components/LearnerSidebar";

export default function StudentContentPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  const [materials, setMaterials] = useState([]);
  const [courseTitle, setCourseTitle] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch course title
        if (courseId) {
          const courseRef = doc(db, "courses", courseId);
          const courseSnap = await getDoc(courseRef);
          if (courseSnap.exists()) {
            setCourseTitle(courseSnap.data().title);
          } else {
            setCourseTitle("Unknown Course");
          }
        }

        // Fetch course materials
        const materialsQuery = query(
          collection(db, "courseMaterials"),
          where("courseId", "==", courseId || ""),
          orderBy("uploadedAt", "desc")
        );
        const materialsSnap = await getDocs(materialsQuery);
        const materialsData = materialsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setMaterials(materialsData);
      } catch (err) {
        console.error("Error fetching materials:", err);
      }
    };

    fetchData();
  }, [user, courseId, navigate]);

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <LearnerSidebar onLogout={handleLogout} />
      <main className="flex-1 p-6 md:ml-64">
        <header className="bg-white dark:bg-gray-800 p-6 rounded-xl mb-8 shadow text-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            {courseTitle || "Course Materials"}
          </h1>
        </header>

        {materials.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-300">
            No materials uploaded for this course yet.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {materials.map((material) => (
              <div key={material.id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">{material.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{material.description}</p>
                {material.fileUrl && (
                  <a
                    href={material.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline text-sm"
                  >
                    Download
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
