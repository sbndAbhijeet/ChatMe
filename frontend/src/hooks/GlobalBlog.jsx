import { createContext, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export const GlobalBlogContext = createContext(null);

export const useBlog = () => {
    return useContext(GlobalBlogContext);
}

export const GlobalBlogProvider = (props) => {
    const [blog, setBlog] = useState([]);
    const { id: blog_session} = useParams();

    

    return (
        <GlobalBlogContext.Provider
        value={{
            blog,
            setBlog,
            blog_session
        }}
        >
            {props.children}
        </GlobalBlogContext.Provider>
    )
}