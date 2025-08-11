// LogoutButton.js
import React, { useState } from "react";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      localStorage.clear();
      sessionStorage.clear();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error.message);
    }
  };

  return (
    <>
      {/* Logout Menu Item */}
      <button
        onClick={() => setShowConfirm(true)}
        className="block px-3 py-2 rounded-md hover:bg-red-100 hover:shadow-md transition w-full text-left text-red-600"
      >
        Logout
      </button>

      {/* Toast-style Confirmation */}
      {showConfirm && (
        <div className="fixed top-5 right-5 z-50 animate-slideIn">
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg w-80 p-4">
            <h2 className="text-lg font-semibold mb-2">Confirm Logout</h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to log out?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style jsx="true">{`
        @keyframes slideIn {
          from {
            transform: translateX(120%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
