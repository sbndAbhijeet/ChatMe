import React from "react";
import { useTools } from "../hooks/GlobalTools";

const SelectedTools = (

) => {
    const decode_tools = {
        1: "🌐 Web Search",
        2: "📄 Your PDFs",
        3: "🎤 Voice Input",
    }
    const {chat_session, selectedTools, setSelectedTools, setSelectedPdfIds} = useTools();
    function removeTool(tool) {
        if (tool === 2) {
            setSelectedPdfIds([]);
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
                    {decode_tools[tool]}
                </span>
            ))}
        </div></>
    );
}

export default SelectedTools;