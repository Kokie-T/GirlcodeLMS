// src/components/MessagesPage.jsx
import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase"; 
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  serverTimestamp,
  onSnapshot,
  doc,
  getDoc
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function MessagesPage() {
  const [learners, setLearners] = useState([]);
  const [selectedLearner, setSelectedLearner] = useState("");
  const [conversation, setConversation] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [facilitator, setFacilitator] = useState(null);

  // ✅ Track logged-in facilitator
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setFacilitator({
          uid: user.uid,
          name: user.displayName || user.email,
        });
      } else {
        setFacilitator(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // ✅ Fetch initial learners list from Firestore
  useEffect(() => {
    const fetchLearners = async () => {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("role", "==", "Learner"));
        const snapshot = await getDocs(q);
        const learnersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLearners(learnersData);
      } catch (error) {
        console.error("Error fetching learners:", error);
      }
    };
    fetchLearners();
  }, []);

  // ✅ Real-time listener for all messages involving facilitator
  useEffect(() => {
    if (!facilitator) return;

    const convRef = collection(db, "conversations");
    const q = query(
      convRef,
      where("participants", "array-contains", facilitator.uid),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const allMsgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Filter conversation if a learner is selected
      if (selectedLearner) {
        const filtered = allMsgs.filter((msg) =>
          msg.participants.includes(selectedLearner)
        );
        setConversation(filtered);
      }

      // Update learners dropdown to include any new learners who sent messages
      const learnerIds = allMsgs
        .filter((msg) => msg.senderRole === "Learner")
        .map((msg) => msg.senderId);

      const uniqueLearners = [...new Set([...learners.map(l => l.id), ...learnerIds])];

      // Fetch learner names if new ones appear
      const updatedLearners = await Promise.all(
        uniqueLearners.map(async (uid) => {
          const existing = learners.find((l) => l.id === uid);
          if (existing) return existing;
          const docRef = doc(db, "users", uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            return { id: uid, name: docSnap.data().name || uid };
          }
          return { id: uid, name: uid };
        })
      );

      setLearners(updatedLearners);
    });

    return () => unsubscribe();
  }, [facilitator, selectedLearner, learners]);

  // ✅ Send new message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedLearner || !facilitator) return;

    try {
      const convRef = collection(db, "conversations");
      await addDoc(convRef, {
        participants: [selectedLearner, facilitator.uid],
        senderId: facilitator.uid,
        senderRole: "Facilitator",
        senderName: facilitator.name,
        text: newMessage,
        timestamp: serverTimestamp(),
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Messages</h2>

      {/* Learner dropdown */}
      <select
        value={selectedLearner}
        onChange={(e) => setSelectedLearner(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      >
        <option value="">Select a Learner</option>
        {learners.map((learner) => (
          <option key={learner.id} value={learner.id}>
            {learner.name}
          </option>
        ))}
      </select>

      {/* Conversation */}
      {selectedLearner ? (
        <div className="border rounded p-4 h-96 flex flex-col justify-between">
          <div className="overflow-y-auto flex-1 mb-4">
            {conversation.length > 0 ? (
              conversation.map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-2 p-2 rounded max-w-xs ${
                    msg.senderRole === "Facilitator"
                      ? "bg-blue-100 text-blue-800 ml-auto"
                      : "bg-gray-200 text-gray-800 mr-auto"
                  }`}
                >
                  <strong>{msg.senderName}:</strong> {msg.text}
                </div>
              ))
            ) : (
              <p>No messages yet with this learner.</p>
            )}
          </div>

          {/* Input box for new messages */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 p-2 border rounded"
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        <p>Please select a learner to view or send messages.</p>
      )}
    </div>
  );
}
