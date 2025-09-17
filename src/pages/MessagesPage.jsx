import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import { FaPaperPlane } from "react-icons/fa";

export default function MessagesPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [users, setUsers] = useState([]);
  const [searchUser, setSearchUser] = useState("");
  const currentUser = auth.currentUser;

  // 🔹 Load conversations in real-time
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "conversations"),
      orderBy("lastUpdated", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convos = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setConversations(convos);

      // Refresh currently selected convo with latest messages
      if (selectedConvo) {
        const updated = convos.find((c) => c.id === selectedConvo.id);
        if (updated) setSelectedConvo(updated);
      }
    });

    return () => unsubscribe();
  }, [currentUser, selectedConvo?.id]);

  // 🔹 Fetch all users (students, facilitators, admins)
  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const userList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(userList);
    };
    fetchUsers();
  }, []);

  // 🔹 Send message
  const sendMessage = async () => {
    if (!messageText.trim() || !selectedConvo) return;

    const newMessage = {
      sender: currentUser.email,
      message: messageText.trim(),
      timestamp: new Date(), // local optimistic timestamp
    };

    const convoRef = doc(db, "conversations", selectedConvo.id);

    await updateDoc(convoRef, {
      messages: [...(selectedConvo.messages || []), newMessage],
      lastUpdated: serverTimestamp(),
    });

    // 🔹 Optimistic UI update so message shows instantly
    setSelectedConvo((prev) => ({
      ...prev,
      messages: [...(prev.messages || []), newMessage],
    }));

    setMessageText("");
  };

  // 🔹 Start or select conversation
  const handleSelectUser = async (userId) => {
    if (!userId) return;
    const recipient = users.find((u) => u.id === userId);

    // Check if conversation already exists
    const existingConvo = conversations.find(
      (c) =>
        c.participants.includes(currentUser.email) &&
        c.participants.includes(recipient.email)
    );

    if (existingConvo) {
      setSelectedConvo(existingConvo);
      return;
    }

    // Create new convo if it doesn’t exist
    const convoRef = await addDoc(collection(db, "conversations"), {
      participants: [currentUser.email, recipient.email],
      participantRoles: [currentUser.role || "Admin", recipient.role],
      messages: [],
      lastUpdated: serverTimestamp(),
    });

    const newConvo = {
      id: convoRef.id,
      participants: [currentUser.email, recipient.email],
      participantRoles: [currentUser.role || "Admin", recipient.role],
      messages: [],
    };

    setConversations([newConvo, ...conversations]); // add to UI immediately
    setSelectedConvo(newConvo);
  };

  // 🔹 Display participant name & role instead of email
  const formatParticipants = (participants) => {
    return participants
      .filter((p) => p !== currentUser.email)
      .map((email) => {
        const user = users.find((u) => u.email === email);
        return user ? `${user.name} (${user.role})` : email;
      })
      .join(", ");
  };

  return (
    <div className="flex flex-col md:flex-row bg-gray-50 min-h-screen p-4 md:p-6 gap-4">
      {/* Conversations List */}
      <div className="md:w-1/3 bg-white rounded-xl shadow p-4 overflow-y-auto h-[calc(100vh-32px)]">
        <h2 className="text-xl font-bold text-gray-700 mb-4">📨 Conversations</h2>

        {/* 🔍 User dropdown */}
        <input
          type="text"
          placeholder="Search user..."
          className="w-full px-3 py-2 border rounded-lg mb-2"
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}
        />

        <select
          className="w-full px-3 py-2 border rounded-lg mb-4"
          onChange={(e) => handleSelectUser(e.target.value)}
        >
          <option value="">Select a user...</option>
          {users
            .filter(
              (u) =>
                u.email !== currentUser.email &&
                (u.name?.toLowerCase().includes(searchUser.toLowerCase()) ||
                  u.role?.toLowerCase().includes(searchUser.toLowerCase()))
            )
            .map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
        </select>

        {conversations.length === 0 ? (
          <p className="text-gray-500">No conversations yet.</p>
        ) : (
          conversations.map((convo) => (
            <div
              key={convo.id}
              className={`p-2 rounded-md mb-2 cursor-pointer hover:bg-blue-50 transition ${
                selectedConvo?.id === convo.id ? "bg-blue-100" : ""
              }`}
              onClick={() => setSelectedConvo(convo)}
            >
              <h3 className="text-sm font-medium text-gray-700">
                {formatParticipants(convo.participants)}
              </h3>
            </div>
          ))
        )}
      </div>

      {/* Chat Window */}
      <div className="md:w-2/3 bg-white rounded-xl shadow flex flex-col p-4 h-[calc(100vh-32px)]">
        {selectedConvo ? (
          <>
            <h3 className="font-bold text-gray-700 mb-4">
              Chat with {formatParticipants(selectedConvo.participants)}
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
                  <span className="text-xs text-gray-400 block mt-1">
                    {msg.timestamp?.toDate
                      ? msg.timestamp.toDate().toLocaleTimeString()
                      : new Date(msg.timestamp).toLocaleTimeString()}
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
          <p className="text-gray-500">
            Select a user from the dropdown to start chatting.
          </p>
        )}
      </div>
    </div>
  );
}
