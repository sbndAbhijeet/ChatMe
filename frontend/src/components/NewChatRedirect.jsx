import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useHistory } from "../hooks/GlobalChatHistory";

const NewChatRedirect = () => {
    const navigate = useNavigate();
    const {history} = useHistory();
    
    useEffect(() => {
        // const session_id = history.length+1;
        // history.push({
        //     id: session_id,
        //     title: `New chat - ${session_id}`,
        //     messages: []
        // })

        navigate(`/chatbot/0`)
    })

    return null;
}

export default NewChatRedirect;