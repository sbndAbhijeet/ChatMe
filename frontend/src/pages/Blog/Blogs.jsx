import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import PlusButton from "../../components/PlusButton";

import { useBlog } from "../../hooks/BlogContext";
import { useNotes } from "../../hooks/NoteContext";

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
  const { blogs, loadBlogs, loading } = useBlog();
  const { notes, loadNotes } = useNotes();

  // Load blogs on mount
  useEffect(() => {
    loadBlogs();
  }, []);

  // Load notes after blogs arrive
  useEffect(() => {
    if (!blogs.length) return;

    blogs.forEach(blog => {
      loadNotes(blog.blog_id);
    });
  }, [blogs]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F9FB] to-[#EEF3F6] p-8">

      <div className="max-w-5xl mx-auto mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Create</h1>
        <p className="text-sm text-gray-500 mt-1">
          Start writing blogs or taking notes
        </p>
      </div>

      {/* Buttons */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        <PlusButton
          to="/create-blog"
          title="Create New Blog"
          subtitle="Share your learning journey"
        />

        <PlusButton
          to="/create-note"
          title="Create New Note"
          subtitle="Capture quick thoughts"
        />
      </div>

      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">
          Recent Blogs
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Your latest notes and learning trails
        </p>
      </div>

      {loading && (
        <div className="text-center text-gray-500">Loading blogs...</div>
      )}

      {/* Blog Cards */}
      <div className="max-w-5xl mx-auto grid grid-cols-2 gap-6">
        {blogs.map(blog => {

          const blogNotes = notes.filter(
            n => String(n.blog_id) === String(blog.blog_id)
          );

          return (
            <div
              key={blog.blog_id}
              className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Blog Header */}
              <div className="px-6 py-4 border-b bg-gradient-to-r from-[#618985]/10 to-transparent rounded-t-xl">
                <h2 className="text-lg font-medium text-gray-800">
                  {blog.blog_name}
                </h2>
              </div>

              {/* Notes */}
              <div className="p-4 space-y-2">

                {blogNotes.length === 0 && (
                  <p className="text-sm text-gray-500">No notes found</p>
                )}

                {blogNotes.map(note => (
                  <Link
                    key={note.note_id}
                    to={`/blogs/${blog.blog_id}/note/${note.note_id}`}
                  >
                    <div className="flex items-center justify-between px-4 py-3 rounded-lg text-sm bg-[#F8FAFB] hover:bg-[#618985]/20 transition-all cursor-pointer group">

                      <span className="text-gray-800 group-hover:text-gray-900">
                        {note.title}
                      </span>

                      <span className="text-xs text-gray-500 group-hover:text-gray-600">
                        {randomTime()}
                      </span>

                    </div>
                  </Link>
                ))}

              </div>
            </div>
          );
        })}
      </div>  
    </div>
  );
}

export default Blogs;
