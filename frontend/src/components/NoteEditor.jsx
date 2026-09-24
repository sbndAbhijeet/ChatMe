import { useRef, useState } from "react";
import NoteMarkdown from "./NoteMarkdown";

const tools = [
  { label: "Heading", title: "Heading", before: "## ", after: "", placeholder: "Heading", block: true },
  { label: "B", title: "Bold", before: "**", after: "**", placeholder: "bold text" },
  { label: "I", title: "Italic", before: "*", after: "*", placeholder: "italic text" },
  { label: "Code", title: "Inline code", before: "`", after: "`", placeholder: "code" },
  { label: "• List", title: "Bullet list", before: "- ", after: "", placeholder: "List item", block: true },
  { label: "1. List", title: "Numbered list", before: "1. ", after: "", placeholder: "List item", block: true },
  { label: "Quote", title: "Block quote", before: "> ", after: "", placeholder: "Quote", block: true },
  { label: "Link", title: "Link", before: "[", after: "](https://example.com)", placeholder: "link text" },
  { label: "Math", title: "Inline equation", before: "$", after: "$", placeholder: "E=mc^2" },
];

export default function NoteEditor({ value, onChange, id = "note-content", initialView = "split" }) {
  const editorRef = useRef(null);
  const [view, setView] = useState(initialView);

  const insert = ({ before, after = "", placeholder = "", block = false }) => {
    const editor = editorRef.current;
    const start = editor?.selectionStart ?? value.length;
    const end = editor?.selectionEnd ?? value.length;
    const selected = value.slice(start, end) || placeholder;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const prefix = block && start !== lineStart ? "\n" : "";
    const suffix = block && value[end] && value[end] !== "\n" ? "\n" : "";
    const replacement = prefix + before + selected + after + suffix;
    onChange(value.slice(0, start) + replacement + value.slice(end));
    if (!editor) setView("split");
    requestAnimationFrame(() => {
      const target = editorRef.current;
      if (!target) return;
      target.focus();
      const selectionFrom = start + prefix.length + before.length;
      target.setSelectionRange(selectionFrom, selectionFrom + selected.length);
    });
  };

  const handleKeyDown = (event) => {
    if ((event.ctrlKey || event.metaKey) && ["b", "i"].includes(event.key.toLowerCase())) {
      event.preventDefault();
      insert(tools[event.key.toLowerCase() === "b" ? 1 : 2]);
    }
  };

  return (
    <section aria-label="Note content editor" className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-3 py-2">
        {tools.map((tool) => (
          <button key={tool.title} type="button" title={tool.title} aria-label={tool.title}
            onClick={() => insert(tool)} className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-sm font-medium text-slate-700 hover:border-[#618985] hover:text-[#31746e]">
            {tool.label}
          </button>
        ))}
        <button type="button" onClick={() => insert({ before: "\n| Topic | Detail |\n| --- | --- |\n| First | Explanation |\n", placeholder: "" })}
          className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-sm font-medium text-slate-700 hover:border-[#618985]" title="Insert table">Table</button>
        <button type="button" onClick={() => insert({ before: "\n$$\n", after: "\n$$\n", placeholder: "E = mc^2" })}
          className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-sm font-medium text-slate-700 hover:border-[#618985]" title="Display equation">Equation</button>
        <div className="ml-auto flex rounded-md border border-slate-200 bg-white p-0.5" aria-label="Editor view">
          {["write", "split", "preview"].map((mode) => (
            <button key={mode} type="button" onClick={() => setView(mode)} aria-pressed={view === mode}
              className={`rounded px-2.5 py-1 text-xs capitalize ${view === mode ? "bg-[#618985] text-white" : "text-slate-600 hover:bg-slate-100"}`}>{mode}</button>
          ))}
        </div>
      </div>
      <div className={view === "split" ? "grid md:grid-cols-2" : ""}>
        {view !== "preview" && (
          <div className={view === "split" ? "border-b md:border-b-0 md:border-r border-slate-200" : ""}>
            <label htmlFor={id} className="block border-b border-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Markdown</label>
            <textarea ref={editorRef} id={id} value={value} onChange={(event) => onChange(event.target.value)} onKeyDown={handleKeyDown}
              placeholder="Write a note or paste an AI answer…" spellCheck="true"
              className="block min-h-[360px] w-full resize-y px-4 py-4 font-mono text-sm leading-7 text-slate-800 outline-none placeholder:text-slate-400" />
          </div>
        )}
        {view !== "write" && (
          <div>
            <div className="border-b border-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Preview</div>
            <div className="min-h-[360px] px-5 py-4">
              {value.trim() ? <NoteMarkdown>{value}</NoteMarkdown> : <p className="text-sm text-slate-400">Your formatted note will appear here.</p>}
            </div>
          </div>
        )}
      </div>
      <div className="border-t border-slate-100 px-4 py-2 text-xs text-slate-500">Markdown is saved as text. Use $...$ for inline math or $$...$$ for a display equation.</div>
    </section>
  );
}
