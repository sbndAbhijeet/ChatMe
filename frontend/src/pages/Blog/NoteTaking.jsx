import React, { useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { useBlog } from "../../hooks/BlogContext";

const blogs = [
  {
    id: "blog-1",
    title: "Understanding Neural Networks",
    notes: [
      "Intro to neurons and layers",
      "Backpropagation basics",
      "Common activation functions"
    ]
  },
  {
    id: "blog-2",
    title: "Exploring Reinforcement Learning",
    notes: [
      "What is an agent?",
      "The concept of rewards and policies",
      "Q-learning overview"
    ]
  }
];

// fake updated time
const getUpdatedTime = () =>
  new Date().toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

function NoteTaking() {
  const { blogId, noteId } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);

  const blog = blogs.find(b => b.id === blogId);
  const noteTitle = blog?.notes?.[Number(noteId)];

  const [toast, setToast] = useState(null);

  if (!blog || !noteTitle) return <p className="p-6">Note not found</p>;

  // formatting helpers
  const format = command => document.execCommand(command);
  const highlight = () => document.execCommand("hiliteColor", false, "#FFF3BF");
  const setColor = color =>
    document.execCommand("foreColor", false, color);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F9FB] to-[#EEF3F6]">
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Header */}
        <p className="text-sm text-gray-500">{blog.title}</p>
        <h1 className="text-3xl font-semibold mt-1">{noteTitle}</h1>
        <p className="text-xs text-gray-400 mb-6">
          Last updated · {getUpdatedTime()}
        </p>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-2 mb-4 bg-white border rounded-lg p-2 shadow-sm">
          <button onClick={() => format("bold")} className="tool-btn">B</button>
          <button onClick={() => format("italic")} className="tool-btn italic">I</button>
          <button onClick={() => format("underline")} className="tool-btn underline">U</button>
          <button onClick={highlight} className="tool-btn">Highlight</button>

          <button onClick={() => setColor("#e03131")} className="tool-btn text-red-600">A</button>
          <button onClick={() => setColor("#2f9e44")} className="tool-btn text-green-600">A</button>
          <button onClick={() => setColor("#1c7ed6")} className="tool-btn text-blue-600">A</button>

          <div className="ml-auto flex gap-2">
            <button
              onClick={() => showToast("Note saved successfully")}
              className="px-3 py-1 rounded-md bg-[#618985] text-white text-sm"
            >
              Save
            </button>

            <button
              onClick={() => {
                showToast("Note deleted", "delete");
                setTimeout(() => navigate("/blogs"), 1200);
              }}
              className="px-3 py-1 rounded-md bg-red-500 text-white text-sm"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable
          className="min-h-[300px] bg-white border rounded-xl p-6 shadow-sm outline-none"
          suppressContentEditableWarning
        >
          <p>Start writing your notes here...</p>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed inset-0 z-50 pointer-events-none">
            <div className="flex justify-center items-start pt-20">
            <div
                className={`pointer-events-auto px-6 py-4 rounded-xl shadow-2xl backdrop-blur-sm border transform transition-all duration-500 ease-out animate-slide-in
                ${toast.type === "delete" 
                    ? "bg-gradient-to-r from-red-500/90 to-rose-600/90 border-red-400/30 text-white" 
                    : "bg-gradient-to-r from-[#618985]/90 to-emerald-600/90 border-emerald-400/30 text-white"
                }`}
            >
                <div className="flex items-center gap-3">
                {/* Icon */}
                <div className="flex-shrink-0">
                    {toast.type === "delete" ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    )}
                </div>
                
                {/* Message */}
                <div className="font-medium">{toast.msg}</div>
                
                {/* Close Button */}
                <button 
                    onClick={() => setToast(null)}
                    className="ml-4 flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-3 h-0.5 bg-white/30 rounded-full overflow-hidden">
                <div className={`h-full ${toast.type === "delete" ? "bg-white" : "bg-white"} animate-progress`}></div>
                </div>
            </div>
            </div>
        </div>
        )}

        

      {/* Button styles */}
      <style>
        {`
          .tool-btn {
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 14px;
            border: 1px solid #e5e7eb;
            background: #f9fafb;
          }
          .tool-btn:hover {
            background: #eef2f7;
          }
        `}
      </style>
    </div>
  );
}

export default NoteTaking;
