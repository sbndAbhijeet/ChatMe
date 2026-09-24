import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import "./NoteMarkdown.css";

export default function NoteMarkdown({ children, className = "" }) {
  return (
    <div className={`note-markdown ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]} rehypePlugins={[rehypeKatex]}>
        {children || ""}
      </ReactMarkdown>
    </div>
  );
}
