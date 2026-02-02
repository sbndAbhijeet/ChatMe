import { createContext, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import * as notesApi from "../api/Blogs/noteApi";
import {useError} from "./ErrorContext"


export const NoteContext = createContext(null);


export const NoteProvider = ({children}) => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(false)

    const {showError} = useError();

    // Get Notes by blog id
    const loadNotes = async (collectionId) => {
        setLoading(true);
        
        const res = await notesApi.getNotes(collectionId);
        if(!res.status){
            showError(res.error);
            setLoading(false);
            return;
        }

        setNotes(prev => {
            const merged = [...prev, ...res.notes];

            const seen = new Set();

            return merged.filter(note => {
                if (seen.has(note.note_id)) return false;
                seen.add(note.note_id);
                return true;
            }); 
        });

        setLoading(false);
    }

    // creation note
    const createNote = async (blogId, noteData) => {
        const res = await notesApi.createNote(blogId, noteData);

        if(!res.status){
            showError(res.error);
            return null;
        }

        const newNote = {
            note_id: res.note_id,
            ...noteData
        }
        setNotes((prev) => [...prev, newNote]);
        return newNote;
    }

    const updateTitle = async (noteId, title) => {
        const res = await notesApi.updateNoteTitle(noteId, title);

        if(!res.status){
            showError(res.error);
            return null;
        }

        setNotes((prev) => prev.map(note => note.note_id === noteId ? {...note, title} : note));
    }

    // const updateContent = async (noteId, content) => {
    //     const res = await notesApi.updateNoteContent(noteId, content);

    //     if (!res.status) {
    //         showError(res.error);
    //         return;
    //     }

    //     setNotes((prev) => prev.map(
    //       (n) => noteId === n.noteId ? {...n, content} : n
    //     ))
    // }

    const deleteNote = async (noteId) => {
        const res = await notesApi.deleteNote(noteId)

        if (!res.status) {
            showError(res.error);
            return;
        }

        setNotes((prev) => prev.filter(
            (n) => n.note_id !== noteId
        ))
    }


    return (
        <NoteContext.Provider
        value={{
            notes,
            loading,
            loadNotes,
            createNote,
            updateTitle,
            // updateContent,
            deleteNote,
        }}
        >
            {children}
        </NoteContext.Provider>
    )
}

export const useNotes = () => {
    const ctx = useContext(NoteContext)

    if(!ctx)
        throw new Error("useNotes must be used inside NotesProvider")
    return ctx;
}


/*
Note:
For getNotes and UpdateContent we are not making an global context as we are not going to use them in multiple pages as view management.
*/