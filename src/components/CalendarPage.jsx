// src/pages/CalendarPage.jsx
import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

export default function CalendarPage() {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]); // ✅ fixed typo
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);

  const eventsCollection = collection(db, "events");

  // Fetch all events from Firestore
  const fetchEvents = async () => { // ✅ unified naming
    const snapshot = await getDocs(eventsCollection);
    const eventsData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setEvents(eventsData);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Filter events when date changes
  useEffect(() => {
    const filtered = events.filter(
      (event) => event.date === date.toISOString().split("T")[0]
    );
    setSelectedDateEvents(filtered);
  }, [date, events]);

  // Add new event
  const addEvent = async () => {
    const title = prompt("Enter event title:");
    if (!title) return;

    await addDoc(eventsCollection, {
      title,
      date: date.toISOString().split("T")[0], // YYYY-MM-DD
    });

    fetchEvents();
  };

  // Delete event
  const deleteEvent = async (id) => {
    await deleteDoc(doc(db, "events", id));
    fetchEvents();
  };

  // Highlight days with events (red dot)
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const eventForDay = events.find(
        (event) => event.date === date.toISOString().split("T")[0]
      );
      return eventForDay ? (
        <div style={{ textAlign: "center", marginTop: "2px" }}>
          <span style={{ color: "red", fontSize: "18px" }}>•</span>
        </div>
      ) : null;
    }
  };

  return (
    <div>
      <h2>Calendar</h2>
      <Calendar
        onChange={setDate}
        value={date}
        tileContent={tileContent} // 🔹 Add event marker
      />
      <h3>Events on {date.toDateString()}</h3>
      <ul>
        {selectedDateEvents.length === 0 ? (
          <li>No events</li>
        ) : (
          selectedDateEvents.map((event) => (
            <li key={event.id}>
              {event.title}{" "}
              <button onClick={() => deleteEvent(event.id)}>❌</button>
            </li>
          ))
        )}
      </ul>
      <button onClick={addEvent}>➕ Add Event</button>
    </div>
  );
}
