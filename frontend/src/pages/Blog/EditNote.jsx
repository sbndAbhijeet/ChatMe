import {use, useEffect, useState} from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {getNote, updateNote} from "../../api/Blogs/noteApi";
import { useError } from "../../hooks/ErrorContext";
import {useNotes} from "../../hooks/NoteContext";

const note = {
    blog_id: "blog-1",
    note_id: "note-1",
    title: "Test note",
    content: "This is a test note"
}

const EditNote = () => {
    const { blogId, noteId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const {loadNotes} = useNotes();

    const {showError} = useError();
    const [toast, setToast] = useState(null);

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchNote = async () => {
            setLoading(true);

            const res = await getNote(noteId);

            if (!res.status) {
                showError(res.error);
                setLoading(false);
                return;
            }

            const { title, content } = res.note;

            console.log(res.note);

            setTitle(title);
            setContent(content);
            setLoading(false);
        };

        fetchNote();
    }, [noteId, location.pathname]);

    const showToast = msg => {
        setToast(msg);
        setTimeout(() => setToast(null), 2500);
    };

    const handleSave = async () => {
        const data = {
            'title': title,
            'content': content
        }
        console.log(data)

        const res = await updateNote(noteId, data);
        console.log("handle save")
        console.log(res.status)
        if (!res.status) {
            console.log(res.error);
            showError(res.error);
            setLoading(false);
            return;
        }

        setToast("Note Saved");
        setTimeout(() => navigate("/blogs"), 1200);
    }


    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F7F9FB] to-[#EEF3F6]">
        <div className="max-w-3xl mx-auto px-6 py-10">

            <h1 className="text-3xl font-semibold">Edit Note</h1>
            <div className="bg-white border rounded-xl p-6 shadow-sm space-y-6">

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
                className="px-4 py-2 rounded-md bg-[#618985] text-white hover:bg-emerald-500"
                >
                Save Note
                </button>
            </div>
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

export default EditNote;