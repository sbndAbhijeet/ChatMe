import React from "react";
import { Link } from "react-router-dom";
import PlusButton from "../components/PlusButton";

// Mock data (unchanged)
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
  },
  {
    id: "blog-3",
    title: "Data Preprocessing Tips",
    notes: [
      "Handling missing values",
      "Feature scaling techniques",
      "Encoding categorical data"
    ]
  }
];

// Random timestamp (last 7 days)
const randomTime = () => {
  const now = Date.now();
  const past = now - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000);
  return new Date(past).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

function Blogs() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F9FB] to-[#EEF3F6] p-8">
      <div className="max-w-5xl mx-auto mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">
          Create New Blog
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Start making notes
        </p>
      </div>

       <PlusButton />



      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">
          Recent Blogs
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Your latest notes and learning trails
        </p>
      </div>

      {/* Blog Cards */}
      <div className="max-w-5xl mx-auto grid grid-cols-2 gap-6">
        {blogs.map(blog => (
          <div
            key={blog.id}
            className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Blog Header */}
            <div className="px-6 py-4 border-b bg-gradient-to-r from-[#618985]/10 to-transparent rounded-t-xl">
              <h2 className="text-lg font-medium text-gray-800">
                {blog.title}
              </h2>
            </div>

            {/* Notes */}
            <div className="p-4 space-y-2">
              {blog.notes.map((note, idx) => (
                <Link
                  key={idx}
                  to={`/blogs/${blog.id}/note/${idx}`}
                >
                  <div className="flex items-center justify-between px-4 py-3 rounded-lg text-sm bg-[#F8FAFB] hover:bg-[#618985]/20 transition-all cursor-pointer group">
                    <span className="text-gray-800 group-hover:text-gray-900">
                      {note}
                    </span>

                    <span className="text-xs text-gray-500 group-hover:text-gray-600">
                      {randomTime()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Blogs;
