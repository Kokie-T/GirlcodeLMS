// src/firebaseFunctions.js
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase";

// Total learners
export const getTotalLearners = async () => {
  const q = query(collection(db, "Users"), where("role", "==", "learner"));
  const snapshot = await getDocs(q);
  return snapshot.size;
};

// Active courses
export const getActiveCourses = async () => {
  const q = query(collection(db, "Courses"), where("isActive", "==", true));
  const snapshot = await getDocs(q);
  return snapshot.size;
};

// Pending grades
export const getPendingGrades = async () => {
  const q = query(collection(db, "Grades"), where("status", "==", "pending"));
  const snapshot = await getDocs(q);
  return snapshot.size;
};

// Unread messages for facilitator
export const getUnreadMessages = async (facilitatorId) => {
  const q = query(
    collection(db, "Conversations"),
    where("receiverId", "==", facilitatorId),
    where("read", "==", false)
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
};

// Announcements
export const getAnnouncements = async () => {
  const snapshot = await getDocs(collection(db, "Announcements"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
