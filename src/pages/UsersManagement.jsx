import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState("student");

  const [editingUserId, setEditingUserId] = useState(null);
  const [editingFirstName, setEditingFirstName] = useState("");
  const [editingLastName, setEditingLastName] = useState("");
  const [editingEmail, setEditingEmail] = useState("");
  const [editingRole, setEditingRole] = useState("");

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(data);
    };
    fetchUsers();
  }, []);

  // Filter users
  const filteredUsers = users.filter((user) => {
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();
    const matchesName = fullName.includes(searchTerm.toLowerCase());
    const matchesEmail = user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole =
      roleFilter === "all" ||
      (user.role && user.role.toLowerCase() === roleFilter.toLowerCase());
    return (matchesName || matchesEmail) && matchesRole;
  });

  // Add new user
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newFirstName.trim() || !newLastName.trim() || !newUserEmail.trim()) return;

    try {
      const docRef = await addDoc(collection(db, "users"), {
        firstName: newFirstName,
        lastName: newLastName,
        email: newUserEmail,
        role: newUserRole,
        status: "Active",
      });
      setUsers([
        {
          id: docRef.id,
          firstName: newFirstName,
          lastName: newLastName,
          email: newUserEmail,
          role: newUserRole,
        },
        ...users,
      ]);
      setNewFirstName("");
      setNewLastName("");
      setNewUserEmail("");
      setNewUserRole("student");
      alert("User added successfully!");
    } catch (err) {
      console.error("Error adding user:", err);
      alert("Failed to add user.");
    }
  };

  // Remove user
  const handleRemoveUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteDoc(doc(db, "users", userId));
      setUsers(users.filter((u) => u.id !== userId));
      alert("User removed successfully!");
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user.");
    }
  };

  // Start editing
  const startEditing = (user) => {
    setEditingUserId(user.id);
    setEditingFirstName(user.firstName || "");
    setEditingLastName(user.lastName || "");
    setEditingEmail(user.email);
    setEditingRole(user.role);
  };

  // Save edited user
  const saveEdit = async (userId) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        firstName: editingFirstName,
        lastName: editingLastName,
        email: editingEmail,
        role: editingRole,
      });
      setUsers(
        users.map((u) =>
          u.id === userId
            ? {
                ...u,
                firstName: editingFirstName,
                lastName: editingLastName,
                email: editingEmail,
                role: editingRole,
              }
            : u
        )
      );
      setEditingUserId(null);
      alert("User updated successfully!");
    } catch (err) {
      console.error("Error updating user:", err);
      alert("Failed to update user.");
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingUserId(null);
    setEditingFirstName("");
    setEditingLastName("");
    setEditingEmail("");
    setEditingRole("");
  };

  const getFullName = (user) => `${user.firstName || ""} ${user.lastName || ""}`.trim();

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <h3 className="text-2xl font-bold mb-4 text-gray-700">User Management</h3>

      {/* Add User Form */}
      <form onSubmit={handleAddUser} className="flex flex-col md:flex-row gap-2 mb-6">
        <input
          type="text"
          placeholder="First Name"
          value={newFirstName}
          onChange={(e) => setNewFirstName(e.target.value)}
          className="flex-1 px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Last Name"
          value={newLastName}
          onChange={(e) => setNewLastName(e.target.value)}
          className="flex-1 px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="email"
          placeholder="Email"
          value={newUserEmail}
          onChange={(e) => setNewUserEmail(e.target.value)}
          className="flex-1 px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={newUserRole}
          onChange={(e) => setNewUserRole(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="student">Student</option>
          <option value="Facilitator">Facilitator</option>
          <option value="Admin">Admin</option>
        </select>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition"
        >
          Add User
        </button>
      </form>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Roles</option>
          <option value="student">Student</option>
          <option value="Facilitator">Facilitator</option>
          <option value="Admin">Admin</option>
        </select>
      </div>

      {/* Users Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="bg-white rounded-2xl shadow hover:shadow-lg transition p-4 cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-lg">
                {getFullName(user).charAt(0) || "U"}
              </div>

              {editingUserId === user.id ? (
                <div className="flex-1">
                  <input
                    type="text"
                    value={editingFirstName}
                    onChange={(e) => setEditingFirstName(e.target.value)}
                    className="w-full px-2 py-1 border rounded-md mb-1"
                  />
                  <input
                    type="text"
                    value={editingLastName}
                    onChange={(e) => setEditingLastName(e.target.value)}
                    className="w-full px-2 py-1 border rounded-md mb-1"
                  />
                  <input
                    type="email"
                    value={editingEmail}
                    onChange={(e) => setEditingEmail(e.target.value)}
                    className="w-full px-2 py-1 border rounded-md mb-1"
                  />
                  <select
                    value={editingRole}
                    onChange={(e) => setEditingRole(e.target.value)}
                    className="w-full px-2 py-1 border rounded-md"
                  >
                    <option value="student">Student</option>
                    <option value="Facilitator">Facilitator</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              ) : (
                <div>
                  <h4 className="font-semibold text-gray-700">{getFullName(user)}</h4>
                  <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
              )}
            </div>

            {/* Edit / Delete / Save / Cancel buttons */}
            <div className="flex gap-2 mt-2">
              {editingUserId === user.id ? (
                <>
                  <button
                    onClick={() => saveEdit(user.id)}
                    className="bg-green-500 text-white px-3 py-1 rounded-xl hover:bg-green-600 transition text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded-xl hover:bg-gray-300 transition text-sm"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => startEditing(user)}
                    className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-xl hover:bg-yellow-300 transition text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleRemoveUser(user.id)}
                    className="bg-red-200 text-red-800 px-3 py-1 rounded-xl hover:bg-red-300 transition text-sm"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
