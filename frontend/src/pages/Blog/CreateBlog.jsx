import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useBlog } from "../../hooks/BlogContext";

function CreateBlog() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [toast, setToast] = useState(null);

  const {createBlog} = useBlog();


  const showToast = msg => {
    setToast({ msg });
    setTimeout(() => setToast(null), 2500);
  };

  const handleSave = () => {
    if (!title.trim()) return showToast("Blog name required");

    // later: send to backend
    console.log("New Blog:", title);
    createBlog(title);

    showToast("Blog created successfully");

    setTimeout(() => navigate("/blogs"), 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F9FB] to-[#EEF3F6]">
      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Header */}
        <h1 className="text-3xl font-semibold">Create New Blog</h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">
          Give your blog a name
        </p>

        {/* Card */}
        <div className="bg-white border rounded-xl p-6 shadow-sm">

          <label className="text-sm text-gray-600">Blog Name</label>

          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="eg. My AI Notes"
            className="mt-2 w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#618985]"
          />

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => navigate("/blogs")}
              className="px-4 py-2 rounded-md border text-sm"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-md bg-[#618985] text-white text-sm"
            >
              Save Blog
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div className="flex justify-center pt-20">
            <div className="px-6 py-4 rounded-xl shadow-xl bg-gradient-to-r from-[#618985]/90 to-emerald-600/90 text-white">
              {toast.msg}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateBlog;
