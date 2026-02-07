import { createContext, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import * as blogApi from "../api/Blogs/blogApi";
import { useError } from "./ErrorContext";
import { useNotes } from "./NoteContext";

export const BlogContext = createContext(null);

export const BlogProvider = (props) => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true)

    const {showError} = useError()
    // const {setNotes} = useNotes()

    useEffect(() => {
        loadBlogs()
    }, []);
    
    const loadBlogs = async () => {
        setLoading(true)

        const res = await blogApi.getBlogs()
        if(!res.status){
            showError(res.error);
            setLoading(false);
            return;
        }
        //initialize notes array
        const normalized = res.blogs.map((b) => ({
            ...b
        }))

        setBlogs(normalized);
        setLoading(false);
    }

    const createBlog = async (blogName) => {
        const res = await blogApi.createBlog(blogName)

        if(!res.status){
            showError(res.error)
            return null;
        } 

        const newBlog = {
            blog_id: res.blog_id,
            blog_name: blogName
        };

        setBlogs((prev) => [...prev, newBlog])
        return newBlog
    }

    const createBlogWithNote = async (data) => {
        const res = await blogApi.createBlogNote(data)

        if(!res.status){
            showError(res.error)
            return;
        }
    
        /* Incoming data 
        {blog_name: blogName, note: {title: title, content: content}}
        */

        const {blog_id, note_id} = res;
        const newBlog = {
            blog_id: blog_id,
            blog_name: data.blog_name
        };
        
        setBlogs((prev) => [...prev, newBlog])
        const newNote = {
            note_id: res.note_id,
            ...data.note
        }
        // setNotes((prev) => [...prev, newNote]);
    }

    const renameBlog = async (blogId, blogName) => {
        const res = await blogApi.renameBlog(blogId, blogName)

        if(!res.status){
            showError(res.error)
            return;
        }

        setBlogs((prev) => prev.map((b) =>
            b.blog_id === blogId ? {...b, blog_name: blogName} : b
        ))
    }

    const deleteBlogNote = async (blogId) => {
        const res = await blogApi.deleteBlogNote(blogId)

        if(!res.status){
            showError(res.error)
            return;
        }

        setBlogs((prev) => prev.filter(
            (b) =>  b.blog_id === blogId
        ))
    }
    
    

    return (
        <BlogContext.Provider
        value={{
            blogs,
            loading,
            loadBlogs,
            createBlog,
            createBlogWithNote,
            renameBlog,
            deleteBlogNote
        }}
        >
            {props.children}
        </BlogContext.Provider>
    )
}

export const useBlog = () => {
    const ctx = useContext(BlogContext)

    if(!ctx)
        throw new Error("useBlog must be used inside BlogProvider")
    return ctx
}