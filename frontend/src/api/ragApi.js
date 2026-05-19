import apiClient from "./client";

export async function listPdfs() {
  try {
    const res = await apiClient.get("/rag/documents");
    return { data: res.data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function uploadPdf(file) {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await apiClient.post("/rag/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return { data: res.data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function deletePdf(documentId) {
  try {
    const res = await apiClient.delete(`/rag/documents/${documentId}`);
    return { data: res.data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function queryPdfContext(query, selectedDocumentIds = [], topK = 5) {
  try {
    const res = await apiClient.post("/rag/query", {
      query,
      selected_document_ids: selectedDocumentIds,
      top_k: topK,
    });
    return { data: res.data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}