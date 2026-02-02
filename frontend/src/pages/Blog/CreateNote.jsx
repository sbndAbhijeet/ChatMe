import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBlog } from "../../hooks/BlogContext";
import { useNotes } from "../../hooks/NoteContext";

function CreateNote() {
  const navigate = useNavigate();

  const { blogs, createBlogWithNote } = useBlog();
  const {createNote} = useNotes();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [createNewBlog, setCreateNewBlog] = useState(false);
  const [newBlogName, setNewBlogName] = useState("");

  const [selectedBlog, setSelectedBlog] = useState(null);
  const [selectedBlogId, setSelectedBlogId] = useState(null);
  const [search, setSearch] = useState("");

  const [toast, setToast] = useState(null);


  const filteredBlogs = blogs.filter(b =>
    b.blog_name.toLowerCase().includes(search.toLowerCase())
  );

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleSave = async () => {
    if (!title.trim()) return showToast("Note title required");

    // validation first
if (createNewBlog && !newBlogName.trim()) {
  return showToast("Enter new blog name");
}

if (!createNewBlog && !selectedBlog) {
  return showToast("Select a blog");
}

if (createNewBlog) {
  const data = {
    "blog_name": newBlogName,
    "note": {
      title,
      content,
    },
  };

  createBlogWithNote(data);
} else {
  const data = {
    title,
    content,
  };

  createNote(selectedBlogId, data);
}


    const payload = {
      title,
      content,
      blog: createNewBlog ? newBlogName : selectedBlog.blog_id
    };

    console.log(payload);

    showToast("Note created");

    setTimeout(() => navigate("/blogs"), 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F9FB] to-[#EEF3F6]">
      <div className="max-w-3xl mx-auto px-6 py-10">

        <h1 className="text-3xl font-semibold">Create Note</h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">
          Choose blog and start writing
        </p>

        <div className="bg-white border rounded-xl p-6 shadow-sm space-y-6">

          {/* Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Create new blog?
            </span>

            <button
              onClick={() => setCreateNewBlog(!createNewBlog)}
              className={`w-12 h-6 rounded-full relative transition ${
                createNewBlog ? "bg-[#618985]" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition ${
                  createNewBlog ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Existing Blogs */}
          {!createNewBlog && (
            <div>
              <label className="text-sm text-gray-600">
                Select Blog
              </label>

              <input
                placeholder="Search blogs..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="mt-2 w-full border rounded-lg px-4 py-2"
              />

              <div className="mt-3 max-h-40 overflow-y-auto border rounded-lg">

                {filteredBlogs.map(blog => (
                  <div
                    key={blog.blog_id}
                    onClick={() => {
                      setSelectedBlog(blog)
                      setSelectedBlogId(blog.blog_id)
                      // console.log(selectedBlogId)
                    }}
                    className={`px-4 py-2 cursor-pointer text-sm hover:bg-[#618985]/20
                      ${
                        selectedBlog?.blog_id === blog.blog_id
                          ? "bg-[#618985]/30"
                          : ""
                      }`}
                  >
                    {blog.blog_name}
                  </div>
                ))}

                {filteredBlogs.length === 0 && (
                  <p className="p-3 text-sm text-gray-400">
                    No blogs found
                  </p>
                )}
              </div>
            </div>
          )}

          {/* New Blog Input */}
          {createNewBlog && (
            <div>
              <label className="text-sm text-gray-600">
                New Blog Name
              </label>

              <input
                value={newBlogName}
                onChange={e => setNewBlogName(e.target.value)}
                placeholder="My new blog"
                className="mt-2 w-full border rounded-lg px-4 py-3"
              />
            </div>
          )}

          {/* Note Title */}
          <div>
            <label className="text-sm text-gray-600">Note Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="mt-2 w-full border rounded-lg px-4 py-3"
            />
          </div>

          {/* Content */}
          <div>
            <label className="text-sm text-gray-600">Content</label>
            <textarea
              rows={8}
              value={content}
              onChange={e => setContent(e.target.value)}
              className="mt-2 w-full border rounded-lg px-4 py-3 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 border rounded-md"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-md bg-[#618985] text-white"
            >
              Save Note
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed inset-0 flex justify-center pt-20 pointer-events-none">
          <div className="px-6 py-4 rounded-xl shadow-xl bg-gradient-to-r from-[#618985]/90 to-emerald-600/90 text-white">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateNote;
