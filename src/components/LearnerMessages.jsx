// src/components/LearnerMessages.jsx
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
  getDocs
} from "firebase/firestore";

export default function LearnerMessages() {
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [facilitators, setFacilitators] = useState([]);
  const [selectedFacilitator, setSelectedFacilitator] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const facilitatorsRef = useRef([]);

  // Track logged-in learner
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) setUser(u);
      else setUser(null);
    });
    return () => unsubscribe();
  }, [auth]);

  // Fetch initial facilitators list
  useEffect(() => {
    const fetchFacilitators = async () => {
      const facQ = query(collection(db, "users"), where("role", "==", "Facilitator"));
      const facSnap = await getDocs(facQ);
      const facList = facSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFacilitators(facList);
      facilitatorsRef.current = facList;
    };
    fetchFacilitators();
  }, []);

  // Listen for all conversations involving learner
  useEffect(() => {
    if (!user) return;

    const convRef = collection(db, "conversations");
    const chatQ = query(convRef, where("participants", "array-contains", user.uid));

    const unsub = onSnapshot(chatQ, async (snap) => {
      const allConversations = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // If a facilitator is selected, show only relevant messages
      if (selectedFacilitator) {
        const conv = allConversations.find(c =>
          c.participants.includes(selectedFacilitator.id)
        );
        if (conv) {
          const msgRef = collection(db, "conversations", conv.id, "messages");
          const msgQ = query(msgRef, orderBy("timestamp", "asc"));
          onSnapshot(msgQ, (msgSnap) => {
            setMessages(msgSnap.docs.map(d => ({ id: d.id, ...d.data() })));
          });
        } else {
          setMessages([]);
        }
      }

      // Dynamically update facilitators list
      const allFacIds = allConversations
        .flatMap(c => c.participants)
        .filter(id => id !== user.uid);

      const uniqueFacIds = [...new Set([...facilitatorsRef.current.map(f => f.id), ...allFacIds])];

      const updatedFacilitators = await Promise.all(uniqueFacIds.map(async id => {
        const existing = facilitatorsRef.current.find(f => f.id === id);
        if (existing) return existing;
        const docRef = doc(db, "users", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) return { id, ...docSnap.data() };
        return { id, fullname: id };
      }));

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

    let conversation = snap.docs.find(d => d.data().participants.includes(selectedFacilitator.id));

    // If conversation does not exist, create it
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

  if (!user) return <p>Loading messages...</p>;

  return (
    <div className="flex h-screen">
      {/* Facilitators list */}
      <div className="w-1/3 border-r p-4 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Facilitators</h2>
        <ul>
          {facilitators.map(f => (
            <li
              key={f.id}
              onClick={() => setSelectedFacilitator(f)}
              className={`p-2 cursor-pointer rounded ${
                selectedFacilitator?.id === f.id ? "bg-blue-100" : "hover:bg-gray-100"
              }`}
            >
              {f.fullname || f.name || f.email || f.id}
            </li>
          ))}
        </ul>
      </div>

      {/* Chat panel */}
      <div className="w-2/3 p-4 flex flex-col">
        {selectedFacilitator ? (
          <>
            <h2 className="text-lg font-semibold mb-2">
              Chat with {selectedFacilitator.fullname || selectedFacilitator.name || selectedFacilitator.id}
            </h2>
            <div className="flex-1 overflow-y-auto border rounded p-3 mb-3">
              {messages.length > 0 ? (
                messages.map(msg => (
                  <p
                    key={msg.id}
                    className={`mb-2 ${
                      msg.senderId === user.uid ? "text-right text-blue-600" : "text-left text-gray-800"
                    }`}
                  >
                    <strong>{msg.senderName || msg.senderRole || msg.senderId}:</strong> {msg.text}
                  </p>
                ))
              ) : (
                <p className="text-gray-500">No messages yet with this facilitator.</p>
              )}
            </div>
            <div className="flex">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 border rounded p-2"
              />
              <button
                onClick={sendMessage}
                className="ml-2 bg-blue-500 text-white px-4 py-2 rounded"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <p className="text-gray-500">Select a facilitator to start chatting.</p>
        )}
      </div>
    </div>
  );
}
