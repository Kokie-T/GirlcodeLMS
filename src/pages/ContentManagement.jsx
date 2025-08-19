import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function ContentManagement() {
  const [content, setContent] = useState([]);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "content"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setContent(data);
      } catch (error) {
        console.error("Error fetching content:", error);
      }
    };
    fetchContent();
  }, []);

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Content Management</h3>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 bg-white shadow rounded-lg">
          <thead className="bg-indigo-100 text-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Title</th>
              <th className="px-4 py-2 text-left">Category</th>
              <th className="px-4 py-2 text-left">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {content.length > 0 ? (
              content.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-2">{item.id}</td>
                  <td className="px-4 py-2">{item.title}</td>
                  <td className="px-4 py-2">{item.category || "General"}</td>
                  <td className="px-4 py-2">
                    {item.updatedAt?.toDate
                      ? item.updatedAt.toDate().toLocaleString()
                      : "N/A"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">
                  No content available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
