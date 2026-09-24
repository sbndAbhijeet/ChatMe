import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const NewChatRedirect = () => {
    const navigate = useNavigate();
    
    useEffect(() => {
        navigate(`/chatbot/0`)
    }, [navigate])

    return null;
}

export default NewChatRedirect;