import {useEffect, useState} from "react";
import { useParams, useNavigate } from "react-router-dom";
import {getNote, updateNote} from "../../api/Blogs/noteApi";
import { useError } from "../../hooks/ErrorContext";
import NoteEditor from "../../components/NoteEditor";

const EditNote = () => {
    const { noteId } = useParams();
    const navigate = useNavigate();

    const {showError} = useError();
    const [toast, setToast] = useState(null);

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loadError, setLoadError] = useState(null);

    useEffect(() => {
        const fetchNote = async () => {
            setLoading(true);
            setLoadError(null);

            const res = await getNote(noteId);

            if (!res.status) {
                setLoadError(res.error || "Unable to load this note.");
                setLoading(false);
                return;
            }

            const { title, content } = res.note;

            setTitle(title);
            setContent(content || "");
            setLoading(false);
        };

        fetchNote();
    }, [noteId]);

    const showToast = msg => {
        setToast(msg);
        setTimeout(() => setToast(null), 2500);
    };

    const handleSave = async () => {
        if (!title.trim()) return showToast("Note title required");
        setSaving(true);
        const data = {
            'title': title.trim(),
            'content': content
        }
        let res;
        try {
            res = await updateNote(noteId, data);
        } catch {
            showError("Could not save the note. Please try again.");
            return;
        } finally {
            setSaving(false);
        }
        if (!res.status) {
            showError(res.error);
            return;
        }

        showToast("Note saved");
    }


    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F7F9FB] to-[#EEF3F6]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

            <h1 className="text-3xl font-semibold">Your Note</h1>
            <p className="text-sm text-gray-500 mt-1 mb-6">Read in Preview, then choose Split or Write to edit.</p>
            {loading ? <p className="text-gray-500">Loading note…</p> : loadError ? <p className="text-red-700">{loadError}</p> : <>
            <div className="bg-white border rounded-xl p-6 shadow-sm mb-6">

            {/* Note Title */}
            <div>
                <label className="text-sm text-gray-600">Note Title</label>
                <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-2xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#618985]/40"
                />
            </div>
            

            </div>
            <NoteEditor value={content} onChange={setContent} initialView="preview" />
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
                className="px-4 py-2 rounded-md bg-[#618985] text-white hover:bg-emerald-500"
                >
                {saving ? "Saving…" : "Save Note"}
                </button>
            </div>
            </>}
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
