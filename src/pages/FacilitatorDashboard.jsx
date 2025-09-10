import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

function FacilitatorDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="facilitator-dashboard">
      <aside className="sidebar">
        <h2>Facilitator</h2>
        <ul>
          <li onClick={() => setActiveTab("overview")}>Overview</li>
          <li onClick={() => setActiveTab("announcements")}>Announcements</li>
          <li onClick={() => setActiveTab("messages")}>Messages</li>
        </ul>
      </aside>

      <main className="main-content">
        {activeTab === "overview" && <Overview />}
        {activeTab === "announcements" && <Announcements />}
        {activeTab === "messages" && <MessagesPage />}
      </main>
    </div>
  );
}

function Overview() {
  return (
    <div>
      <h1>Dashboard Overview</h1>
      <p>Welcome back, facilitator!</p>
    </div>
  );
}

function Announcements() {
  return (
    <div>
      <h1>Announcements</h1>
      <p>Here you can post and view announcements.</p>
      {/* Later we can add Firestore form here */}
    </div>
  );
}

// ✅ NEW MessagesPage connected to Firestore
function MessagesPage() {
  const [students] = useState([
    { id: "STUDENT_UID_1", name: "John Doe" },
    { id: "STUDENT_UID_2", name: "Jane Smith" },
  ]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // Fetch messages when a student is selected
  useEffect(() => {
    if (!selectedStudent) return;

    const messagesRef = collection(db, "users", selectedStudent.id, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [selectedStudent]);

  // Send a message to Firestore
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedStudent) return;

    try {
      await addDoc(collection(db, "users", selectedStudent.id, "messages"), {
        from: "facilitator",
        text: newMessage,
        createdAt: serverTimestamp(),
        seen: false,
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="messages-page">
      <div className="students-list">
        <h2>Students</h2>
        <ul>
          {students.map((student) => (
            <li
              key={student.id}
              onClick={() => setSelectedStudent(student)}
              className={
                selectedStudent?.id === student.id ? "active-student" : ""
              }
            >
              {student.name}
            </li>
          ))}
        </ul>
      </div>

      <div className="chat-section">
        {selectedStudent ? (
          <>
            <h2>Chat with {selectedStudent.name}</h2>
            <div className="chat-messages">
              {messages.map((msg) => (
                <p
                  key={msg.id}
                  className={msg.from === "facilitator" ? "sent" : "received"}
                >
                  <strong>{msg.from}: </strong>
                  {msg.text}
                </p>
              ))}
            </div>
            <div className="chat-input">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </>
        ) : (
          <p>Select a student to start chatting</p>
        )}
      </div>
    </div>
  );
}

export default FacilitatorDashboard;
