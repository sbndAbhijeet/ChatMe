import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useBlog } from "../../hooks/BlogContext";
import { useNotes } from "../../hooks/NoteContext";
import NoteEditor from "../../components/NoteEditor";

function CreateNote() {
  const navigate = useNavigate();
  const location = useLocation();

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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (location.state) {
      const passedContent = location.state?.content || '';
      setContent(passedContent);
    }
  }, [location]);

  const filteredBlogs = blogs.filter(b =>
    b.blog_name.toLowerCase().includes(search.toLowerCase())
  );

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleSave = async () => {
    if (!title.trim()) return showToast("Note title required");
    if (!content.trim()) return showToast("Write something in your note");

    // validation first
    if (createNewBlog && !newBlogName.trim()) {
      return showToast("Enter new blog name");
    }

    if (!createNewBlog && !selectedBlog) {
      return showToast("Select a blog");
    }

    setSaving(true);
    try {
      if (createNewBlog) {
        const created = await createBlogWithNote({ blog_name: newBlogName.trim(), note: { title: title.trim(), content } });
        if (created) navigate(`/blogs/${created.blog_id}/note/${created.note_id}`);
      } else {
        const created = await createNote(selectedBlogId, { title: title.trim(), content });
        if (created) navigate(`/blogs/${selectedBlogId}/note/${created.note_id}`);
      }
    } catch {
      showToast("Could not save the note. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F9FB] to-[#EEF3F6]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

        <h1 className="text-3xl font-semibold">Create Note</h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">
          Choose blog and start writing
        </p>

        <div className="bg-white border rounded-xl p-6 shadow-sm space-y-6 mb-6">

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
              placeholder="Give this note a title"
              className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-2xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#618985]/40"
            />
          </div>

        </div>

        <NoteEditor value={content} onChange={setContent} />

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 border rounded-md"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-md bg-[#618985] text-white"
            >
              {saving ? "Saving…" : "Save Note"}
            </button>
          </div>
      </div>

      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
            <div
            className="px-6 py-3 rounded-xl shadow-xl
            bg-gradient-to-r from-[#618985]/90 to-emerald-600/90 text-white
            max-w-sm text-center break-words"
            >
            {toast}
            </div>
        </div>
        )}
    </div>
  );
}

export default CreateNote;
