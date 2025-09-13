// MessagesPage.jsx
import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function MessagesPage() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [facilitator, setFacilitator] = useState(null);

  // Track logged-in facilitator
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user)
        setFacilitator({
          uid: user.uid,
          name: user.displayName || user.email,
        });
      else setFacilitator(null);
    });
    return () => unsubscribe();
  }, []);

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      const q = query(collection(db, "users"), where("role", "==", "student"));
      const snap = await getDocs(q);
      setStudents(
        snap.docs.map((d) => ({
          id: d.id,
          name: d.data().name || d.data().email,
        }))
      );
    };
    fetchStudents();
  }, []);

  // Handle selecting a student → find or create conversation
  useEffect(() => {
    if (!selectedStudent || !facilitator) return;

    const fetchOrCreateConversation = async () => {
      try {
        // 🔍 Find existing conversation with facilitator + student
        const convQ = query(
          collection(db, "conversations"),
          where("participants", "array-contains", facilitator.uid)
        );
        const convSnap = await getDocs(convQ);

        let convId;
        const existingConv = convSnap.docs.find((doc) =>
          doc.data().participants.includes(selectedStudent)
        );

        if (existingConv) {
          convId = existingConv.id;
        } else {
          // 🚀 Create new conversation
          const newConvRef = await addDoc(collection(db, "conversations"), {
            participants: [facilitator.uid, selectedStudent],
            createdAt: serverTimestamp(),
          });
          convId = newConvRef.id;
        }

        // ✅ Save conversationId
        setConversationId(convId);
        console.log("Conversation ID set to:", convId);

        // 🔔 Real-time listener for messages
        const msgsRef = collection(db, "conversations", convId, "messages");
        const msgsQ = query(msgsRef, orderBy("timestamp", "asc"));

        const unsubscribeMsgs = onSnapshot(msgsQ, (snap) => {
          setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        });

        return () => unsubscribeMsgs();
      } catch (error) {
        console.error("Error fetching/creating conversation:", error);
      }
    };

    fetchOrCreateConversation();
  }, [selectedStudent, facilitator]);

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversationId || !facilitator) return;

    await addDoc(collection(db, "conversations", conversationId, "messages"), {
      senderId: facilitator.uid,
      senderName: facilitator.name,
      senderRole: "Facilitator",
      text: newMessage,
      timestamp: serverTimestamp(),
      seen: false,
    });

    setNewMessage("");
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Messages</h2>

      <select
        value={selectedStudent}
        onChange={(e) => setSelectedStudent(e.target.value)}
        className="w-full p-3 border rounded-lg mb-6"
      >
        <option value="">Select a student</option>
        {students.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      {selectedStudent ? (
        <div className="flex flex-col h-[500px] border rounded-lg p-4 bg-white dark:bg-gray-800">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-2">
            {messages.length > 0 ? (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-2 rounded-lg max-w-xs break-words ${
                    msg.senderRole === "Facilitator"
                      ? "bg-blue-100 text-blue-800 ml-auto"
                      : "bg-gray-200 text-gray-800 mr-auto"
                  }`}
                >
                  <strong>{msg.senderName}:</strong> {msg.text}
                </div>
              ))
            ) : (
              <p>No messages yet with this student.</p>
            )}
          </div>

          {/* Input + Send */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 p-2 border rounded-lg"
            />
            <button
              onClick={handleSendMessage}
              disabled={!conversationId}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        <p>Please select a student to view or send messages.</p>
      )}
    </div>
  );
}
