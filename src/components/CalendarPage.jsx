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
  const [events, setEvents] = useState([]);
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [addingEvent, setAddingEvent] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");

  const eventsCollection = collection(db, "events");

  const fetchEvents = async () => {
    setLoading(true);
    setError("");
    try {
      const snapshot = await getDocs(eventsCollection);
      const eventsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(eventsData);
    } catch (err) {
      setError("Failed to fetch events");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const formatDate = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const currentDateStr = formatDate(date);
    const filtered = events.filter((event) => event.date === currentDateStr);
    setSelectedDateEvents(filtered);
  }, [date, events]);

  const addEvent = async () => {
    if (!newEventTitle.trim()) return;
    setLoading(true);
    setError("");
    try {
      await addDoc(eventsCollection, {
        title: newEventTitle.trim(),
        date: formatDate(date),
      });
      setNewEventTitle("");
      setAddingEvent(false);
      fetchEvents();
    } catch (err) {
      setError("Failed to add event");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (id) => {
    setLoading(true);
    setError("");
    try {
      await deleteDoc(doc(db, "events", id));
      fetchEvents();
    } catch (err) {
      setError("Failed to delete event");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const tileContent = ({ date: tileDate, view }) => {
    if (view === "month") {
      const eventForDay = events.find(
        (event) => event.date === formatDate(tileDate)
      );
      return eventForDay ? (
        <div style={{ textAlign: "center", marginTop: "2px" }}>
          <span style={{ color: "red", fontSize: "18px" }} aria-label="Event day">
            •
          </span>
        </div>
      ) : null;
    }
  };

  return (
    <>
      {/* Heading outside white container */}
      <div className="max-w-4xl mx-auto p-6 mb-6 bg-gradient-to-r from-blue-400 to-pink-400 text-white rounded-xl shadow text-center text-3xl font-semibold">
        Calendar
      </div>

      {/* Main white container */}
      <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-xl shadow space-y-6">
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>
        )}

        <Calendar onChange={setDate} value={date} tileContent={tileContent} />

        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-black">
              Events on {date.toDateString()}
            </h3>
            <button
              onClick={() => setAddingEvent(true)}
              className="bg-gradient-to-r from-blue-400 to-pink-400 text-white px-4 py-2 rounded shadow hover:opacity-90 transition"
              aria-label="Add new event"
            >
              Add Event
            </button>
          </div>

          {loading && <p className="text-gray-500 mt-2">Loading...</p>}

          {addingEvent && (
            <div className="mt-4 p-4 border rounded shadow-sm bg-gray-50 dark:bg-gray-800">
              <label
                htmlFor="newEvent"
                className="block text-sm font-medium mb-1"
              >
                Event Title
              </label>
              <input
                id="newEvent"
                type="text"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                className="w-full rounded py-2 px-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white dark:bg-gray-700 dark:text-white"
                placeholder="Enter event title"
              />
              <div className="flex space-x-4 mt-4">
                <button
                  onClick={addEvent}
                  disabled={loading || !newEventTitle.trim()}
                  className="bg-pink-600 text-white px-4 py-2 rounded shadow hover:bg-pink-700 disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setAddingEvent(false);
                    setNewEventTitle("");
                  }}
                  className="bg-gray-400 text-white px-4 py-2 rounded shadow hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {!loading && selectedDateEvents.length === 0 && !addingEvent && (
            <p className="mt-4 text-gray-500">No events</p>
          )}
          {!loading && selectedDateEvents.length > 0 && (
            <ul className="mt-4 space-y-2">
              {selectedDateEvents.map((event) => (
                <li
                  key={event.id}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <span className="dark:text-gray-200">{event.title}</span>
                  <button
                    onClick={() => deleteEvent(event.id)}
                    className="text-red-600 hover:text-red-800 px-2 rounded"
                    aria-label={`Delete event ${event.title}`}
                  >
                    ❌
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
