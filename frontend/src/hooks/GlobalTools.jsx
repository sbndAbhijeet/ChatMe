import { createContext, useContext, useEffect, useState } from "react";

export const GlobalToolsContext = createContext(null);

export const useTools = () => {
    return useContext(GlobalToolsContext);
}

export const GlobalToolsProvider = (props) => {
    const [selectedTools, setSelectedTools] = useState([]);

    return (
        <GlobalToolsContext.Provider
        value={{
            selectedTools,
            setSelectedTools
        }}
        >
            {props.children}
        </GlobalToolsContext.Provider>
    )
}