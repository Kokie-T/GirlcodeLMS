// src/components/LearnerMessages.jsx
import React, { useState, useEffect, useRef } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
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
import {
  FaTachometerAlt,
  FaBook,
  FaEnvelope,
  FaCalendar,
  FaScrewdriver,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function LearnerMessages() {
  const auth = getAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [facilitators, setFacilitators] = useState([]);
  const [selectedFacilitator, setSelectedFacilitator] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const facilitatorsRef = useRef([]);

  // 🔹 Track logged-in learner
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) setUser(u);
      else navigate("/login");
    });
    return () => unsubscribe();
  }, [auth, navigate]);

  // 🔹 Fetch facilitators
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

  // 🔹 Listen for conversations + messages
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
          if (docSnap.exists()) return { id, ...docSnap.data() };
          return { id, fullname: id };
        })
      );

      setFacilitators(updatedFacilitators);
      facilitatorsRef.current = updatedFacilitators;
    });

    return () => unsub();
  }, [user, selectedFacilitator]);

  // 🔹 Send message
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

  // 🔹 Sidebar items
  const sidebarItems = [
    { icon: <FaTachometerAlt />, label: "Dashboard", path: "/learner-dashboard" },
    { icon: <FaBook />, label: "My Courses", path: "/courses" },
    { icon: <FaEnvelope />, label: "Messages", path: "/learner/messages" },
    { icon: <FaCalendar />, label: "Calendar", path: "/learner/calendar" },
    { icon: <FaScrewdriver />, label: "Settings", path: "/learner-settings" },
  ];

  if (!user) return <p>Loading messages...</p>;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:static inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-200 ease-in-out z-50`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b dark:border-gray-700">
          <h1 className="text-lg font-bold text-gray-800 dark:text-white">Learner</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-gray-600 dark:text-gray-300"
          >
            <FaTimes />
          </button>
        </div>
        <nav className="mt-4">
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                location.pathname === item.path ? "bg-gray-200 dark:bg-gray-700 font-semibold" : ""
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <button
          onClick={() => signOut(auth)}
          className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 mt-auto"
        >
          <FaSignOutAlt className="mr-3" /> Logout
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">
        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden mb-4 p-2 bg-gray-200 dark:bg-gray-700 rounded"
        >
          <FaBars />
        </button>

        {/* Page Title */}
        <div className="p-4 bg-gradient-to-r from-blue-300 to-pink-300 text-white rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold">📩 Learner Messages</h2>
        </div>

        {/* Facilitator Dropdown */}
        <div className="mb-4">
          <select
            value={selectedFacilitator?.id || ""}
            onChange={(e) => {
              const fac = facilitators.find((f) => f.id === e.target.value);
              setSelectedFacilitator(fac || null);
            }}
            className="w-full p-2 rounded border dark:border-gray-600 text-gray-800"
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
        <div className="flex flex-col h-[70vh] bg-gray-100 rounded-lg shadow p-4">
          {selectedFacilitator ? (
            <>
              <div className="flex-1 overflow-y-auto border rounded-lg p-4 mb-3 bg-white shadow">
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
                            : "bg-gray-200"
                        }`}
                      >
                        <p className="text-sm font-semibold">{msg.senderName}</p>
                        <p>{msg.text}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">
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
                  className="flex-1 border rounded-lg p-2 focus:ring focus:ring-blue-300"
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
            <div className="flex items-center justify-center flex-1 text-gray-500">
              Select a facilitator to start chatting.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
