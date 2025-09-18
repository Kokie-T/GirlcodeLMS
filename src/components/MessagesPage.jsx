import React, { useEffect, useState, useRef } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  onSnapshot,
  orderBy,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { FaThumbtack, FaTimesCircle } from "react-icons/fa";

export default function MessagesPage() {
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [participantsToAdd, setParticipantsToAdd] = useState([]);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (usr) => {
      setUser(usr);
    });
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersSnap = await getDocs(collection(db, "users"));
      setUsers(usersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchUsers();
  }, []);

  // Listen to conversations with messages only (filter where lastMessageTimestamp exists)
  useEffect(() => {
    if (!user) {
      setConversations([]);
      return;
    }
    const convQuery = query(
      collection(db, "conversations"),
      where("participants", "array-contains", user.uid),
      where("lastMessageTimestamp", "!=", null) // Firestore does not support not equals so this is conceptual
    );

    // Since Firestore does not support "!=" filter directly, fetch all and filter clientside:
    const unsubscribe = onSnapshot(
      query(collection(db, "conversations"), where("participants", "array-contains", user.uid)),
      (snap) => {
        const convsWithMessages = snap.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((conv) => conv.lastMessageTimestamp); // Only those with messages
        setConversations(convsWithMessages);
      }
    );
    return unsubscribe;
  }, [user]);

  // Filter conversations by search term:
  useEffect(() => {
    if (!searchTerm) {
      setFilteredConversations(conversations);
      return;
    }
    const lowerSearch = searchTerm.toLowerCase();

    const filtered = conversations.filter((conv) => {
      if (conv.isGroup && conv.name) {
        return conv.name.toLowerCase().includes(lowerSearch);
      } else {
        const otherUserId = conv.participants.find((id) => id !== user.uid);
        const otherUser = users.find((u) => u.id === otherUserId);
        if (!otherUser) return false;
        const otherName =
          (otherUser.firstName || otherUser.name || otherUser.email || "").toLowerCase();
        return otherName.includes(lowerSearch);
      }
    });

    setFilteredConversations(filtered);
  }, [searchTerm, conversations, users, user]);

  // Listen for messages in selected conversation
  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      return;
    }
    const msgsRef = collection(db, "conversations", selectedConversationId, "messages");
    const msgsQuery = query(msgsRef, orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(msgsQuery, (snap) => {
      setMessages(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

      // Scroll to bottom on new messages
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    });

    return unsubscribe;
  }, [selectedConversationId]);

  // Mark conversation as read when selected
  useEffect(() => {
    if (!selectedConversationId || !user) return;
    const convRef = doc(db, "conversations", selectedConversationId);
    updateDoc(convRef, {
      [`lastReadAt.${user.uid}`]: serverTimestamp(),
    }).catch(console.error);
  }, [selectedConversationId, user]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversationId || !user) return;
    const msgRef = collection(db, "conversations", selectedConversationId, "messages");
    await addDoc(msgRef, {
      senderId: user.uid,
      senderName: user.displayName || user.email,
      text: newMessage.trim(),
      timestamp: serverTimestamp(),
      pinned: false,
    });

    // Update last message timestamp on conversation doc
    const convRef = doc(db, "conversations", selectedConversationId);
    await updateDoc(convRef, { lastMessageTimestamp: serverTimestamp() });

    setNewMessage("");
  };

  const togglePinMessage = async (msgId, pinned) => {
    const msgRef = doc(db, "conversations", selectedConversationId, "messages", msgId);
    await updateDoc(msgRef, { pinned: !pinned });
  };

  const clearMessages = async () => {
    if (!selectedConversationId) return;
    if (!window.confirm("Are you sure you want to clear all messages in this conversation?")) return;

    const msgsSnap = await getDocs(collection(db, "conversations", selectedConversationId, "messages"));
    const deletions = msgsSnap.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletions);
  };

  const startConversation = async () => {
    if (!user) return;
    const participantIds = isGroupChat ? [user.uid, ...participantsToAdd] : [user.uid, participantsToAdd[0]];
    if (isGroupChat && newGroupName.trim() === "") {
      alert("Please enter a group chat name.");
      return;
    }
    if (!isGroupChat) {
      // Check for existing private chat
      const convQuery = query(collection(db, "conversations"), where("participants", "array-contains", user.uid));
      const convSnap = await getDocs(convQuery);
      const existingConv = convSnap.docs.find((doc) => {
        const p = doc.data().participants;
        return p.length === 2 && p.includes(participantIds[1]);
      });
      if (existingConv) {
        setSelectedConversationId(existingConv.id);
        return;
      }
    }
    const newConv = await addDoc(collection(db, "conversations"), {
      participants: participantIds,
      isGroup: isGroupChat,
      name: isGroupChat ? newGroupName.trim() : "",
      createdAt: serverTimestamp(),
      lastMessageTimestamp: null,
      lastReadAt: { [user.uid]: serverTimestamp() },
    });
    setSelectedConversationId(newConv.id);
    setIsGroupChat(false);
    setNewGroupName("");
    setParticipantsToAdd([]);
  };

  const toggleParticipant = (userId) => {
    if (participantsToAdd.includes(userId)) {
      setParticipantsToAdd(participantsToAdd.filter((id) => id !== userId));
    } else {
      setParticipantsToAdd([...participantsToAdd, userId]);
    }
  };

  // Render conversations with bold for unread
  const renderConversationName = (conv) => {
    const lastReadAtTimestamp = conv.lastReadAt?.[user.uid];
    const lastReadMillis = lastReadAtTimestamp ? lastReadAtTimestamp.toMillis() : 0;
    const lastMsgMillis = conv.lastMessageTimestamp ? conv.lastMessageTimestamp.toMillis() : 0;
    const hasUnread = lastMsgMillis > lastReadMillis;

    if (conv.isGroup) return conv.name || "Unnamed Group";
    const otherIds = conv.participants.filter((id) => id !== user.uid);
    const names = otherIds
      .map((id) => {
        const u = users.find((user) => user.id === id);
        return u ? u.firstName || u.name || u.email : "Unknown";
      })
      .join(", ");

    return (
      <span style={{ fontWeight: hasUnread ? "bold" : "normal" }}>
        {names}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col gap-6">
      <div className="w-full py-3 bg-gradient-to-r from-blue-400 to-pink-400 text-white font-semibold rounded-xl shadow hover:opacity-90 transition text-center text-3xl">
        Messages
      </div>
      <div className="flex gap-6 flex-1">
        <aside className="w-72 bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col gap-3">
          <h3 className="text-lg font-semibold">Conversations</h3>
          <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                className={`text-left p-2 rounded-lg focus:outline-none w-full ${
                  conv.id === selectedConversationId
                    ? "bg-blue-100 dark:bg-blue-600"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                onClick={() => setSelectedConversationId(conv.id)}
              >
                {renderConversationName(conv)}
              </button>
            ))}
          </div>
          {/* New conversation UI like before */}
          <div className="border-t border-gray-300 dark:border-gray-700 pt-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isGroupChat}
                onChange={() => {
                  setIsGroupChat(!isGroupChat);
                  setParticipantsToAdd([]);
                  setNewGroupName("");
                }}
                className="form-checkbox"
              />
              Group Chat
            </label>
            {isGroupChat && (
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Group chat name"
                className="w-full mt-2 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            )}
            <div className="mt-2 max-h-64 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-1 bg-white dark:bg-gray-700">
              {users
                .filter((u) => u.id !== user?.uid)
                .map((u) => (
                  <label
                    key={u.id}
                    className="flex items-center gap-2 p-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={participantsToAdd.includes(u.id)}
                      onChange={() => toggleParticipant(u.id)}
                      className="form-checkbox"
                    />
                    {u.firstName || u.name || u.email}
                  </label>
                ))}
            </div>
            <button
              onClick={startConversation}
              disabled={participantsToAdd.length === 0 || (isGroupChat && newGroupName.trim() === "")}
              className="w-full mt-3 py-2 bg-gradient-to-r from-blue-400 to-pink-400 text-white font-semibold rounded-xl shadow hover:opacity-90 transition disabled:opacity-50"
            >
              Start {isGroupChat ? "Group Chat" : "Private Chat"}
            </button>
          </div>
        </aside>
        <main className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow p-4">
          <div className="flex-1 overflow-y-auto mb-4 space-y-3">
            {messages.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400">
                No messages in this conversation.
              </p>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-xs p-3 rounded-lg break-words ${
                  msg.senderId === user?.uid
                    ? "bg-blue-100 text-blue-800 ml-auto"
                    : "bg-gray-200 text-gray-800 mr-auto"
                }`}
              >
                <div className="flex justify-between items-center">
                  <strong>{msg.senderName}</strong>
                  <button
                    title={msg.pinned ? "Unpin message" : "Pin message"}
                    onClick={() => togglePinMessage(msg.id, msg.pinned)}
                    className={`ml-2 text-sm ${
                      msg.pinned ? "text-yellow-500" : "text-gray-400 hover:text-yellow-400"
                    }`}
                    aria-label="Pin message"
                  >
                    <FaThumbtack />
                  </button>
                </div>
                <p>{msg.text}</p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!selectedConversationId}
            />
            <button
              onClick={sendMessage}
              disabled={!selectedConversationId || !newMessage.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-400 to-pink-400 text-white font-semibold rounded-xl shadow hover:opacity-90 transition disabled:opacity-50"
              aria-label="Send message"
            >
              Send
            </button>
            <button
              onClick={clearMessages}
              disabled={!selectedConversationId}
              className="ml-2 px-4 py-3 bg-red-500 text-white rounded-xl shadow hover:bg-red-600 transition disabled:opacity-50"
              aria-label="Clear messages"
              title="Clear all messages in conversation"
            >
              <FaTimesCircle />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
