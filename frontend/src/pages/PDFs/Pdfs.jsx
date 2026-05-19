import React, { useEffect, useRef, useState } from "react";
import { Upload, Trash2, FileText } from "lucide-react";
import { deletePdf, listPdfs, uploadPdf } from "../../api/ragApi";

const formatDate = (value) => {
  if (!value) return "Unknown date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Pdfs = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef(null);

  const loadDocuments = async () => {
    setLoading(true);
    const res = await listPdfs();
    setLoading(false);

    if (res.error) {
      setMessage("Unable to load your PDFs right now.");
      return;
    }

    setDocuments(res.data?.documents || []);
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handlePickFile = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSaving(true);
    setMessage("");
    const res = await uploadPdf(file);
    setSaving(false);

    if (res.error) {
      setMessage("Upload failed. Please try again.");
      return;
    }

    setMessage(res.data?.status === "exists" ? "PDF already exists. Reusing stored embeddings." : "PDF uploaded successfully.");
    await loadDocuments();
    e.target.value = "";
  };

  const handleDelete = async (documentId) => {
    const confirmed = window.confirm("Delete this PDF and its embeddings?");
    if (!confirmed) return;

    setSaving(true);
    const res = await deletePdf(documentId);
    setSaving(false);

    if (res.error) {
      setMessage("Delete failed. Please try again.");
      return;
    }

    setMessage("PDF deleted successfully.");
    setDocuments((prev) => prev.filter((doc) => String(doc._id || doc.id) !== String(documentId)));
  };

  return (
    <div className="min-h-full bg-[#F2E3BC]/10 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="rounded-2xl border border-[#96BBBB]/30 bg-white/80 p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#414535]">Your PDFs</h1>
              <p className="mt-1 text-sm text-[#414535]/70">
                Upload once, reuse across chats, and manage the PDFs connected to your RAG flow.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleUpload}
                className="hidden"
              />
              <button
                onClick={handlePickFile}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-[#618985] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#4f7c73] disabled:opacity-60"
              >
                <Upload size={16} />
                {saving ? "Processing..." : "Add PDF"}
              </button>
            </div>
          </div>

          {message && (
            <div className="mt-4 rounded-lg bg-[#F2E3BC]/40 px-4 py-3 text-sm text-[#414535]">
              {message}
            </div>
          )}
        </div>

        {loading ? (
          <div className="rounded-2xl border border-dashed border-[#96BBBB]/40 bg-white/70 p-8 text-center text-sm text-[#414535]/70">
            Loading PDFs...
          </div>
        ) : documents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#96BBBB]/40 bg-white/70 p-10 text-center">
            <FileText className="mx-auto text-[#618985]" size={40} />
            <h2 className="mt-4 text-xl font-semibold text-[#414535]">No PDFs yet</h2>
            <p className="mt-2 text-sm text-[#414535]/70">
              Add a PDF to start using the document picker in chat.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {documents.map((doc) => {
              const id = String(doc._id || doc.id);

              return (
                <div
                  key={id}
                  className="rounded-2xl border border-[#96BBBB]/30 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-semibold text-[#414535]">
                        {doc.filename || doc.stored_filename || "Untitled PDF"}
                      </h3>
                      <p className="mt-1 text-xs text-[#414535]/60">
                        Uploaded: {formatDate(doc.uploaded_at || doc.created_at)}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDelete(id)}
                      className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                      title="Delete PDF"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="mt-4 rounded-xl bg-[#F2E3BC]/25 p-3 text-xs text-[#414535]/80">
                    <div className="truncate"><span className="font-semibold">Hash:</span> {doc.pdf_hash}</div>
                    <div className="mt-1 truncate"><span className="font-semibold">Document ID:</span> {id}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Pdfs;