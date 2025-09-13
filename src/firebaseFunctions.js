// src/firebaseFunctions.js
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Get total learners (students)
 */
export const getTotalLearners = async () => {
  try {
    const q = query(collection(db, "users"), where("role", "==", "student"));
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error("Error fetching total learners:", error);
    return 0;
  }
};

/**
 * Get active courses
 */
export const getActiveCourses = async () => {
  try {
    const q = query(collection(db, "courses"), where("isActive", "==", true));
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error("Error fetching active courses:", error);
    return 0;
  }
};

/**
 * Get pending grades
 */
export const getPendingGrades = async () => {
  try {
    const q = query(collection(db, "submissions"), where("graded", "==", false));
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error("Error fetching pending grades:", error);
    return 0;
  }
};

/**
 * Get unread messages for a facilitator
 */
export const getUnreadMessages = async (facilitatorId) => {
  try {
    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", facilitatorId)
    );
    const snapshot = await getDocs(q);

    let totalUnread = 0;

    for (const docSnap of snapshot.docs) {
      const messagesRef = collection(db, "conversations", docSnap.id, "messages");
      const unreadQuery = query(messagesRef, where("seen", "==", false), where("senderId", "!=", facilitatorId));
      const unreadSnap = await getDocs(unreadQuery);
      totalUnread += unreadSnap.size;
    }

    return totalUnread;
  } catch (error) {
    console.error("Error fetching unread messages:", error);
    return 0;
  }
};

/**
 * Get latest announcements (optional limit)
 */
export const getAnnouncements = async (limitNum = 5) => {
  try {
    const q = query(collection(db, "announcements"));
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => b.timestamp?.toMillis() - a.timestamp?.toMillis()) // latest first
      .slice(0, limitNum);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return [];
  }
};
