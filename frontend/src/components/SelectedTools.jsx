import React from "react";
import { useTools } from "../hooks/GlobalTools";

const SelectedTools = (

) => {
    const decode_tools = {
        1: "🌐 Web Search",
        2: "📎 Attachments",
        3: "🎤 Voice Input",
    }
    const {selectedTools, setSelectedTools, selectedPdfIds, selectedNoteIds, setSelectedPdfIds, setSelectedNoteIds} = useTools();
    function removeTool(tool) {
        if (tool === 2) {
            setSelectedPdfIds([]);
            setSelectedNoteIds([]);
        }
        setSelectedTools(prev => 
            {return prev.filter(t => t !== tool);}
        );
    }
    return (
        <><div className="flex gap-2 flex-wrap mb-2">
            {selectedTools.map((tool, index) => (
                <span
                    key={index}
                    className="bg-[#618985] text-white px-2 py-1 rounded-md text-sm hover:bg-red-800 cursor-pointer"
                    onClick={() => removeTool(tool)}
                >
                    {decode_tools[tool]}{tool === 2 ? ` (${selectedPdfIds.length} PDFs, ${selectedNoteIds.length} notes)` : ""} ×
                </span>
            ))}
        </div></>
    );
}

export default SelectedTools;
