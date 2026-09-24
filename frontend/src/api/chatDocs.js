import apiClient from "./client.js";

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

export async function postMessage (docId, msg, tools, model, selectedDocumentIds = []) {
    try {
        const res = await apiClient.post(`/chat/save_response/${String(docId)}`, {message: msg, tools: tools, model: model, selected_document_ids: selectedDocumentIds})
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

