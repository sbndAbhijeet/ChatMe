import apiClient from "./client";

export async function getHistory () {
    try{
        const res = await apiClient.get("/api/chat_history");
        return {data: res.data, error: null};
    } catch(error){
        return {data: null, error: error};
    }
    
}

export async function getOngoingChat (docId) {
    try {
        const res = await apiClient.get(`/api/chat_session/${docId}`);
        return {data: res.data, error: null}
    } catch (error) {
        return {data: null, error: error}
    }
}

export async function create_new_chat(chat_id){
    try {
        const res = await apiClient.post(`/api/chatbot/lists/${chat_id}`)
        return {data: res.data, error: null}
    } catch(error){
        return {data: null, error: error};
    }
}

export async function postMessage (docId, msg) {
    try {
        const res = await apiClient.post(`/api/save_response/${String(docId)}`, {message: msg})
        console.log(res.data);
        return {data: res.data, error: null};
    } catch (error){
        return {data: null, error: error};
    }
}

export const renameTitle = async (docId,title) => {
    try {
        const res = await apiClient.patch(`/api/chat_rename/${docId}`, {title})
        return {data: res.data, error: null};
    } catch (error){
        return {data: null, error: error}
    }
}

export const deleteChat = async (docId) => {
    try {
        const res = await apiClient.delete(`/api/delete_chat/${docId}`)
        return {data: res.data, error: null}
    } catch (error){
        return {data: null, error: error}
    }
}

/* 
getHistory:
[
    {
        "id": "68973238805046d1e4aa0b44",
        "chat_id": 2,
        "title": "New Chat - 2",
        "messages_count": 0
    },
    {
        "id": "68973227805046d1e4aa0b43",
        "chat_id": 1,
        "title": "New Chat - 1",
        "messages_count": 4
    },
    {
        "id": "689739f635ca31cd8e5c5b6a",
        "chat_id": 1,
        "title": "New Chat - <built-in function id>",
        "messages_count": 0
    }
]
------------------------------------
*/