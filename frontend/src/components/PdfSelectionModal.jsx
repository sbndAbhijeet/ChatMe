import React, { useEffect, useMemo, useState } from "react";
import { useTools } from "../hooks/GlobalTools";
import { listPdfs } from "../api/ragApi";

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

const PdfSelectionModal = ({ open, setOpen }) => {
  const { selectedPdfIds, setSelectedPdfIds, setSelectedTools } = useTools();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [localSelection, setLocalSelection] = useState([]);

  useEffect(() => {
    if (!open) return;

    setLocalSelection(selectedPdfIds || []);
    const load = async () => {
      setLoading(true);
      setError("");

      const res = await listPdfs();
      setLoading(false);

      if (res.error) {
        setError("Unable to load your PDFs");
        return;
      }

      setDocuments(res.data?.documents || []);
    };

    load();
  }, [open, selectedPdfIds]);

  const selectedCount = useMemo(() => localSelection.length, [localSelection]);

  const toggleDocument = (documentId) => {
    setLocalSelection((prev) =>
      prev.includes(documentId)
        ? prev.filter((id) => id !== documentId)
        : [...prev, documentId]
    );
  };

  const handleCancel = () => {
    setSelectedPdfIds([]);
    setSelectedTools((prev) => prev.filter((tool) => tool !== 2));
    setOpen(false);
  };

  const handleProceed = () => {
    setSelectedPdfIds(localSelection);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
      <div className="w-full max-w-2xl rounded-2xl border border-[#96BBBB]/40 bg-white shadow-2xl overflow-hidden">
        <div className="border-b border-[#96BBBB]/20 bg-gradient-to-r from-[#618985]/10 to-transparent px-5 py-4">
          <h3 className="text-lg font-semibold text-[#414535]">Select PDFs</h3>
          <p className="text-sm text-[#414535]/70 mt-1">
            Choose one or more saved PDFs to use in chat.
          </p>
        </div>

        <div className="px-5 py-4 max-h-[60vh] overflow-y-auto">
          {loading && <p className="text-sm text-gray-500">Loading PDFs...</p>}

          {!loading && error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && documents.length === 0 && (
            <div className="rounded-xl border border-dashed border-[#96BBBB]/40 bg-[#F2E3BC]/20 px-4 py-8 text-center text-sm text-[#414535]/70">
              No PDFs uploaded yet. Add PDFs from <span className="font-medium">Your PDFs</span> first.
            </div>
          )}

          <div className="space-y-2">
            {documents.map((doc) => {
              const id = String(doc._id || doc.id);
              const checked = localSelection.includes(id);

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleDocument(id)}
                  className={`w-full rounded-xl border px-4 py-3 text-left transition-all ${
                    checked
                      ? "border-[#618985] bg-[#618985]/10"
                      : "border-gray-200 bg-white hover:border-[#96BBBB]/60 hover:bg-[#F8FAFB]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium text-[#414535] truncate">
                        {doc.filename || doc.stored_filename || "Untitled PDF"}
                      </p>
                      <p className="text-xs text-[#414535]/60 mt-1 truncate">
                        {doc.pdf_hash ? `Hash: ${doc.pdf_hash.slice(0, 16)}...` : "Hash unavailable"}
                      </p>
                      <p className="text-xs text-[#414535]/60 mt-1">
                        Uploaded: {formatDate(doc.uploaded_at || doc.created_at)}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                        checked
                          ? "bg-[#618985] text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {checked ? "Selected" : "Select"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[#96BBBB]/20 bg-[#F2E3BC]/20 px-5 py-4">
          <p className="text-sm text-[#414535]/70">
            {selectedCount} PDF{selectedCount === 1 ? "" : "s"} selected
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-[#414535] hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleProceed}
              disabled={selectedCount === 0}
              className="rounded-lg bg-[#618985] px-4 py-2 text-sm font-medium text-white hover:bg-[#52776f] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Proceed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfSelectionModal;