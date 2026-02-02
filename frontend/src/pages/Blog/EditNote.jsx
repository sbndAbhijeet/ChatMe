import {useEffect, useState} from "react";
import { useParams } from "react-router-dom";
import {getNote} from "../../api/Blogs/noteApi";
import { useError } from "../../hooks/ErrorContext";

const note = {
    blog_id: "blog-1",
    note_id: "note-1",
    title: "Test note",
    content: "This is a test note"
}

const EditNote = () => {
    const { blogId, noteId } = useParams();

    const {showError} = useError();

    const [title, setTitle] = useState();
    const [content, setContent] = useState();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchNote = async () => {
            setLoading(true);

            const res = await getNote(noteId); // 👈 WAIT here

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
    }, [noteId]);


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
                // onClick={handleSave}
                className="px-4 py-2 rounded-md bg-[#618985] text-white"
                >
                Save Note
                </button>
            </div>
            </div>
        </div>

        {/* {toast && (
            <div className="fixed inset-0 flex justify-center pt-20 pointer-events-none">
            <div className="px-6 py-4 rounded-xl shadow-xl bg-gradient-to-r from-[#618985]/90 to-emerald-600/90 text-white">
                {toast}
            </div>
            </div>
        )} */}
        </div>
    );
}

export default EditNote;