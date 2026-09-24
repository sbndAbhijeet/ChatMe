import apiClient from "./client.js";

export async function streamMessage(docId, msg, tools, model, selectedDocumentIds = [], selectedNoteIds = [], onToken) {
    const url = `${apiClient.defaults.baseURL}/chat/stream_response/${encodeURIComponent(docId)}`;
    const body = JSON.stringify({message: msg, tools, model, selected_document_ids: selectedDocumentIds, selected_note_ids: selectedNoteIds});
    const send = () => fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
            ...(localStorage.getItem("access_token") ? {Authorization: `Bearer ${localStorage.getItem("access_token")}`} : {}),
        },
        body,
    });
    let response = await send();
    if (response.status === 401) {
        await apiClient.post("/auth/refresh", {});
        response = await send();
    }
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `Chat request failed (${response.status})`);
    }
    if (!response.body) throw new Error("Streaming is unavailable in this browser.");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let complete = false;
    let reply = "";
    try {
        while (true) {
            const {value, done} = await reader.read();
            buffer += decoder.decode(value, {stream: !done});
            buffer = buffer.replace(/\r\n/g, "\n");
            let boundary;
            while ((boundary = buffer.indexOf("\n\n")) !== -1) {
                const frame = buffer.slice(0, boundary);
                buffer = buffer.slice(boundary + 2);
                const event = frame.split("\n").find((line) => line.startsWith("event: "))?.slice(7);
                const data = frame.split("\n").find((line) => line.startsWith("data: "))?.slice(6);
                if (!event || !data) continue;
                const text = JSON.parse(data).text;
                if (event === "token") { reply += text; onToken(text); }
                if (event === "error") throw new Error(text);
                if (event === "done") { complete = true; reply = text; }
            }
            if (done || complete) break;
        }
    } finally {
        reader.releaseLock();
    }
    if (!complete) throw new Error("Connection lost before the answer was saved. Reopen the chat to check its history.");
    return reply;
}

export async function getHistory () {
    try{
        const res = await apiClient.get("/chat/chat_history");
        // console.log(res.data)
        return {data: res.data, error: null};
    } catch(error){
        return {data: null, error: error};
    }
    
}

export async function getOngoingChat (docId) {
    try {
        const res = await apiClient.get(`/chat/chat_session/${docId}`);
        return {data: res.data, error: null}
    } catch (error) {
        return {data: null, error: error}
    }
}

export async function create_new_chat(){
    try {
        const res = await apiClient.post(`/chat/chatbot`)
        return {data: res.data, error: null}
    } catch(error){
        return {data: null, error: error};
    }
}

export async function postMessage (docId, msg, tools, model, selectedDocumentIds = [], selectedNoteIds = []) {
    try {
        const res = await apiClient.post(`/chat/save_response/${String(docId)}`, {message: msg, tools: tools, model: model, selected_document_ids: selectedDocumentIds, selected_note_ids: selectedNoteIds})
        console.log(res.data);
        return {data: res.data, error: null};
    } catch (error){
        return {data: null, error: error};
    }
}

export const renameTitle = async (docId,title) => {
    try {
        const res = await apiClient.patch(`/chat/chat_rename/${docId}`, {title})
        return {data: res.data, error: null};
    } catch (error){
        return {data: null, error: error}
    }
}

export const deleteChat = async (docId) => {
    try {
        const res = await apiClient.delete(`/chat/delete_chat/${docId}`)
        return {data: res.data, error: null}
    } catch (error){
        return {data: null, error: error}
    }
}
