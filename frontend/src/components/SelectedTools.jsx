import React from "react";
import { useTools } from "../hooks/GlobalTools";

const SelectedTools = (

) => {
    const {selectedTools, setSelectedTools} = useTools();
    function removeTool(tool) {
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
                    {tool}
                </span>
            ))}
        </div></>
    );
}

export default SelectedTools;