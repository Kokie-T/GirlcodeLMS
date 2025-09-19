import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";

export default function AdminCalendar() {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingEventId, setEditingEventId] = useState(null);

  // Fetch events from Firestore
  const fetchEvents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "events"));
      const eventsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(eventsData);
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Handle add or update event
  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (!title) return alert("Title is required!");

    try {
      if (editingEventId) {
        // Update existing event
        const eventRef = doc(db, "events", editingEventId);
        await updateDoc(eventRef, {
          title,
          description,
          date: date.toISOString(),
        });
        alert("✅ Event updated!");
      } else {
        // Add new event
        await addDoc(collection(db, "events"), {
          title,
          description,
          date: date.toISOString(),
        });
        alert("✅ Event added!");
      }

      setTitle("");
      setDescription("");
      setEditingEventId(null);
      setShowForm(false);
      fetchEvents(); // Refresh events
    } catch (err) {
      console.error("Error saving event:", err);
      alert("❌ Could not save event");
    }
  };

  // Handle delete
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await deleteDoc(doc(db, "events", eventId));
      fetchEvents();
      alert("✅ Event deleted!");
    } catch (err) {
      console.error("Error deleting event:", err);
      alert("❌ Could not delete event");
    }
  };

  // Start editing
  const handleEditEvent = (event) => {
    setTitle(event.title);
    setDescription(event.description || "");
    setEditingEventId(event.id);
    setShowForm(true);
  };

  // Show small indicator on dates with events
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const dayEvents = events.filter(
        (event) => new Date(event.date).toDateString() === date.toDateString()
      );
      return dayEvents.length > 0 ? (
        <div className="mt-1 w-full text-center bg-blue-600 text-white rounded-full text-xs">
          {dayEvents.length}
        </div>
      ) : null;
    }
  };

  const eventsForSelectedDate = events.filter(
    (event) => new Date(event.date).toDateString() === date.toDateString()
  );

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md w-full max-w-3xl mx-auto">
      <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
        📅 Admin Calendar
      </h3>

      <Calendar
        onChange={setDate}
        value={date}
        tileContent={tileContent}
        className="rounded-xl shadow-inner border border-gray-200 dark:border-gray-700 overflow-hidden"
      />

      <button
        onClick={() => {
          setShowForm(!showForm);
          setEditingEventId(null);
          setTitle("");
          setDescription("");
        }}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        {showForm ? "Cancel" : "Add Event"}
      </button>

      {/* Event Form */}
      {showForm && (
        <form onSubmit={handleSaveEvent} className="mt-4 space-y-3">
          <input
            type="text"
            placeholder="Event Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded-lg"
          />
          <textarea
            placeholder="Event Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded-lg"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            {editingEventId ? "Update Event" : "Save Event"}
          </button>
        </form>
      )}

      {/* Events list */}
      <div className="mt-6">
        <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
          Events on {date.toDateString()}
        </h4>
        {eventsForSelectedDate.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 mt-2">No events</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {eventsForSelectedDate.map((event) => (
              <li
                key={event.id}
                className="p-3 bg-blue-50 dark:bg-gray-700 rounded-md shadow-sm border border-blue-100 dark:border-gray-600 flex justify-between items-start"
              >
                <div>
                  <strong className="text-blue-700 dark:text-blue-300">{event.title}</strong>
                  {event.description && (
                    <p className="text-gray-700 dark:text-gray-300 mt-1">{event.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditEvent(event)}
                    className="px-2 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 transition text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
