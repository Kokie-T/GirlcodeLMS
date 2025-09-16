import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import { FaUser, FaPaperPlane } from "react-icons/fa";

export default function MessagesPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [messageText, setMessageText] = useState("");
  const currentUser = auth.currentUser;

  // Load conversations in real-time
  useEffect(() => {
    if (!currentUser) return;

    const q = query(collection(db, "conversations"), orderBy("lastUpdated", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convos = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setConversations(convos);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Send message function
  const sendMessage = async () => {
    if (!messageText.trim() || !selectedConvo) return;

    const convoRef = doc(db, "conversations", selectedConvo.id);

    await updateDoc(convoRef, {
      messages: arrayUnion({
        sender: currentUser.email,
        message: messageText.trim(),
        timestamp: serverTimestamp(),
      }),
      lastUpdated: serverTimestamp(),
    });

    setMessageText(""); // clear input
  };

  return (
    <div className="flex flex-col md:flex-row bg-gray-50 min-h-screen p-4 md:p-6 gap-4">
      {/* Conversations List */}
      <div className="md:w-1/3 bg-white rounded-xl shadow p-4 overflow-y-auto h-[calc(100vh-32px)]">
        <h2 className="text-xl font-bold mb-4 text-gray-700">📨 Conversations</h2>
        {conversations.length === 0 ? (
          <p className="text-gray-500">No conversations yet.</p>
        ) : (
          conversations.map((convo) => (
            <div
              key={convo.id}
              className={`p-3 rounded-lg mb-2 cursor-pointer hover:bg-blue-50 transition ${
                selectedConvo?.id === convo.id ? "bg-blue-100" : ""
              }`}
              onClick={() => setSelectedConvo(convo)}
            >
              <h3 className="font-semibold text-gray-700">
                {convo.participants.join(", ")}
              </h3>
              <p className="text-sm text-gray-500 truncate">
                {convo.messages?.[convo.messages.length - 1]?.message || "No messages yet."}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Chat Window */}
      <div className="md:w-2/3 bg-white rounded-xl shadow flex flex-col p-4 h-[calc(100vh-32px)]">
        {selectedConvo ? (
          <>
            <h3 className="font-bold text-gray-700 mb-4">
              Chat with {selectedConvo.participants.join(", ")}
            </h3>
            <div className="flex-1 overflow-y-auto mb-4 space-y-2">
              {selectedConvo.messages?.map((msg, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-lg max-w-xs ${
                    msg.sender === currentUser.email
                      ? "bg-blue-500 text-white ml-auto"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  <p>{msg.message}</p>
                  <span className="text-xs text-gray-400">
                    {msg.timestamp?.toDate().toLocaleTimeString() || ""}
                  </span>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition"
                onClick={sendMessage}
              >
                <FaPaperPlane />
              </button>
            </div>
          </>
        ) : (
          <p className="text-gray-500">Select a conversation to start chatting.</p>
        )}
      </div>
    </div>
  );
}
