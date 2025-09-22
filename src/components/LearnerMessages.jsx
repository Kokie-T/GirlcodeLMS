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
  getDoc,
  getDocs,
  doc,
} from "firebase/firestore";
import LearnerSidebar from "../components/LearnerSidebar";
import { FaBars } from "react-icons/fa";
import { format } from "date-fns";

export default function LearnerMessages() {
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("Messages");
  const [darkMode, setDarkMode] = useState(
    JSON.parse(localStorage.getItem("darkMode")) || false
  );

  const messagesEndRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Track logged-in learner
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u || null));
    return () => unsubscribe();
  }, [auth]);

  // ------------------ Fetch Contacts ------------------
  useEffect(() => {
    if (!user) return;
    let unsubContacts;

    const fetchContacts = async () => {
      const rolesQ = query(collection(db, "users"), where("role", "in", ["Facilitator", "Admin"]));
      const rolesSnap = await getDocs(rolesQ);
      const initialContacts = rolesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const convRef = collection(db, "conversations");
      const convQ = query(convRef, where("participants", "array-contains", user.uid));

      unsubContacts = onSnapshot(convQ, async (convSnap) => {
        const dynamicIds = convSnap.docs
          .flatMap((d) => d.data().participants)
          .filter((id) => id !== user.uid);

        const newContacts = await Promise.all(
          dynamicIds.map(async (id) => {
            if (initialContacts.find((c) => c.id === id)) return null;
            const docSnap = await getDoc(doc(db, "users", id));
            return docSnap.exists() ? { id, ...docSnap.data() } : { id, fullname: id };
          })
        );

        setContacts([...initialContacts, ...newContacts.filter(Boolean)]);
      });
    };

    fetchContacts();

    return () => unsubContacts?.();
  }, [user]);

  // ------------------ Fetch Messages ------------------
  useEffect(() => {
    if (!user || !selectedContact) return;
    let unsubMessages;

    const fetchMessages = async () => {
      const convRef = collection(db, "conversations");
      const convQ = query(convRef, where("participants", "array-contains", user.uid));
      const snap = await getDocs(convQ);

      const conversationDoc = snap.docs.find((d) =>
        d.data().participants.includes(selectedContact.id)
      );

      if (!conversationDoc) {
        setMessages([]);
        return;
      }

      const msgRef = collection(db, "conversations", conversationDoc.id, "messages");
      const msgQ = query(msgRef, orderBy("timestamp", "asc"));

      unsubMessages = onSnapshot(msgQ, (msgSnap) => {
        setMessages(msgSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      });
    };

    fetchMessages();

    return () => unsubMessages?.();
  }, [user, selectedContact]);

  // ------------------ Send Message ------------------
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedContact || !user) return;

    const convRef = collection(db, "conversations");
    const convQ = query(convRef, where("participants", "array-contains", user.uid));
    const snap = await getDocs(convQ);

    let conversation = snap.docs.find((d) =>
      d.data().participants.includes(selectedContact.id)
    );

    // Create new conversation if missing
    if (!conversation) {
      const newConvRef = await addDoc(convRef, {
        participants: [user.uid, selectedContact.id],
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

  if (!user) return <p className="p-6 dark:text-white">Loading messages...</p>;

  return (
    <div className={`flex h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Sidebar */}
      <LearnerSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activePage={activePage}
        setActivePage={setActivePage}
        darkMode={darkMode}
      />

      <main
      
  className={`flex-1 p-4 md:p-6 overflow-y-auto transition-all duration-300 
    ${sidebarOpen ? "ml-80" : "ml-20"}`}
>


        {/* Header */}
        <div className="max-w-3xl mx-auto mb-6 p-6 bg-white dark:bg-gray-800 text-center rounded-xl shadow-lg">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 dark:text-white">
            My Messages
          </h1>
        </div>

        {/* Contacts & Chat */}
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-6">
          {/* Contact List */}
          <div className="md:w-1/3 bg-white dark:bg-gray-800 p-4 rounded-xl shadow space-y-2 h-[500px] overflow-y-auto">
            <p className="text-gray-500 dark:text-gray-400 mb-2 font-semibold">
              Select a Facilitator or Admin:
            </p>
            {contacts.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No contacts found.</p>
            ) : (
              contacts.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedContact(c)}
                  className={`w-full text-left p-3 rounded-lg transition hover:bg-blue-100 dark:hover:bg-gray-700 flex flex-col gap-1 ${
                    selectedContact?.id === c.id
                      ? "bg-blue-100 dark:bg-gray-700 font-semibold"
                      : "bg-transparent"
                  }`}
                >
                  <span className="font-medium">{c.fullname || c.name || c.email || c.id}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{c.role || "User"}</span>
                </button>
              ))
            )}
          </div>

          {/* Chat Panel */}
          <div className="md:w-2/3 flex flex-col h-[500px] bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
            {selectedContact ? (
              <>
                <div className="flex-1 overflow-y-auto space-y-3 mb-3">
                  {messages.length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400 text-center mt-10">
                      No messages yet with this contact.
                    </p>
                  )}

                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderId === user.uid ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-xl shadow ${
                          msg.senderId === user.uid
                            ? "bg-gradient-to-r from-blue-300 to-pink-300 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        }`}
                      >
                        <p className="text-sm font-semibold">{msg.senderName}</p>
                        <p className="mt-1">{msg.text}</p>
                        {msg.timestamp?.toDate && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                            {format(msg.timestamp.toDate(), "dd MMM yyyy, HH:mm")}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 border rounded-xl p-3 focus:ring-2 focus:ring-blue-300 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    onClick={sendMessage}
                    className="bg-gradient-to-r from-blue-300 to-pink-300 text-white px-6 py-3 rounded-xl shadow hover:opacity-90 transition"
                  >
                    Send
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                Select a contact to start chatting.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
