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
          name: user.displayName || user.email, // fallback
        });
      } else {
        setFacilitator(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // ✅ Fetch learners from Firestore
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

  // ✅ Realtime conversation with selected learner
  useEffect(() => {
    if (!selectedLearner || !facilitator) return;

    const convRef = collection(db, "conversations");
    const q = query(
      convRef,
      where("participants", "array-contains", facilitator.uid),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convData = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((msg) =>
          msg.participants.includes(selectedLearner)
        );
      setConversation(convData);
    });

    return () => unsubscribe();
  }, [selectedLearner, facilitator]);

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

      setNewMessage(""); // clear input
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
