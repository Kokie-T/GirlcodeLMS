// src/pages/LearnerMessages.jsx
import React, { useState, useEffect, useRef } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import LearnerSidebar from "../components/LearnerSidebar";
import { FaBars } from "react-icons/fa";
import { format } from "date-fns";

export default function LearnerMessages() {
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [facilitators, setFacilitators] = useState([]);
  const [selectedFacilitator, setSelectedFacilitator] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("Messages");
  const [darkMode, setDarkMode] = useState(
    JSON.parse(localStorage.getItem("darkMode")) || false
  );

  const facilitatorsRef = useRef([]);
  const messagesEndRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Track logged-in learner
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u || null));
    return () => unsubscribe();
  }, [auth]);

  // Fetch facilitators
  useEffect(() => {
    const fetchFacilitators = async () => {
      const facQ = query(collection(db, "users"), where("role", "==", "Facilitator"));
      const facSnap = await getDocs(facQ);
      const facList = facSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setFacilitators(facList);
      facilitatorsRef.current = facList;
    };
    fetchFacilitators();
  }, []);

  // Listen for conversations and messages
  useEffect(() => {
    if (!user) return;

    const convRef = collection(db, "conversations");
    const chatQ = query(convRef, where("participants", "array-contains", user.uid));

    const unsub = onSnapshot(chatQ, async (snap) => {
      const allConversations = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      if (selectedFacilitator) {
        const conv = allConversations.find((c) =>
          c.participants.includes(selectedFacilitator.id)
        );
        if (conv) {
          const msgRef = collection(db, "conversations", conv.id, "messages");
          const msgQ = query(msgRef, orderBy("timestamp", "asc"));
          onSnapshot(msgQ, (msgSnap) => {
            setMessages(msgSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
          });
        } else {
          setMessages([]);
        }
      }

      // Update facilitators dynamically
      const allFacIds = allConversations
        .flatMap((c) => c.participants)
        .filter((id) => id !== user.uid);
      const uniqueFacIds = [
        ...new Set([...facilitatorsRef.current.map((f) => f.id), ...allFacIds]),
      ];

      const updatedFacilitators = await Promise.all(
        uniqueFacIds.map(async (id) => {
          const existing = facilitatorsRef.current.find((f) => f.id === id);
          if (existing) return existing;
          const docRef = doc(db, "users", id);
          const docSnap = await getDoc(docRef);
          return docSnap.exists() ? { id, ...docSnap.data() } : { id, fullname: id };
        })
      );

      setFacilitators(updatedFacilitators);
      facilitatorsRef.current = updatedFacilitators;
    });

    return () => unsub();
  }, [user, selectedFacilitator]);

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedFacilitator || !user) return;

    const convRef = collection(db, "conversations");
    const convQ = query(convRef, where("participants", "array-contains", user.uid));
    const snap = await getDocs(convQ);

    let conversation = snap.docs.find((d) =>
      d.data().participants.includes(selectedFacilitator.id)
    );

    if (!conversation) {
      const newConvRef = await addDoc(convRef, {
        participants: [user.uid, selectedFacilitator.id],
        createdAt: serverTimestamp(),
      });
      conversation = await getDoc(newConvRef);
    }

    await addDoc(collection(db, "conversations", conversation.id, "messages"), {
      senderId: user.uid,
      senderRole: "Learner",
      senderName: user.displayName || user.email,
      text: newMessage,
      timestamp: serverTimestamp(),
    });

    setNewMessage("");
  };

  if (!user) return <p className="p-6">Loading messages...</p>;

  // Group messages by date
  const groupedMessages = messages.reduce((acc, msg) => {
    const dateStr = msg.timestamp?.toDate
      ? format(msg.timestamp.toDate(), "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd");
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(msg);
    return acc;
  }, {});

  return (
    <div className={`flex h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
  <LearnerSidebar
    sidebarOpen={sidebarOpen}
    setSidebarOpen={setSidebarOpen}
    activePage={activePage}
    setActivePage={setActivePage}
    darkMode={darkMode}
  />

  <main className="flex-1 p-4 md:p-6 overflow-y-auto">
    {/* Header Card */}
    <div className="max-w-3xl mx-auto mb-6 p-6 bg-white text-black rounded-xl shadow text-center">
      <h1 className="text-2xl font-extrabold"> My Messages</h1>
    </div>

    {/* Main Card */}
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-xl shadow space-y-6">
      
      {/* Facilitator Selector */}
      <div>
        <select
          value={selectedFacilitator?.id || ""}
          onChange={(e) => {
            const fac = facilitators.find((f) => f.id === e.target.value);
            setSelectedFacilitator(fac || null);
          }}
          className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400 dark:bg-gray-800"
        >
          <option value="">Select a facilitator...</option>
          {facilitators.map((f) => (
            <option key={f.id} value={f.id}>
              {f.fullname || f.name || f.email || f.id}
            </option>
          ))}
        </select>
      </div>

      {/* Chat Panel */}
      <div className="flex flex-col h-[500px]">
        {selectedFacilitator ? (
          <>
            <div className="flex-1 overflow-y-auto border rounded-lg p-4 mb-3 bg-gray-50 dark:bg-gray-800">
              {messages.length > 0 ? (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`mb-3 flex ${
                      msg.senderId === user.uid ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-xl shadow ${
                        msg.senderId === user.uid
                          ? "bg-gradient-to-r from-blue-300 to-pink-300 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                      }`}
                    >
                      <p className="text-sm font-semibold">{msg.senderName}</p>
                      <p>{msg.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  No messages yet with this facilitator.
                </p>
              )}
            </div>

            <div className="flex">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 border rounded-lg p-3 focus:ring-2 focus:ring-blue-300 dark:bg-gray-800 dark:text-white"
              />
              <button
                onClick={sendMessage}
                className="ml-2 bg-gradient-to-r from-blue-300 to-pink-300 text-white px-4 py-2 rounded-lg shadow hover:opacity-90 transition"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center flex-1 text-gray-500 dark:text-gray-400">
            Select a facilitator to start chatting.
          </div>
        )}
      </div>
    </div>
  </main>
</div>

  );
}
