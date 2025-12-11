import { createContext, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export const GlobalToolsContext = createContext(null);

export const useTools = () => {
    return useContext(GlobalToolsContext);
}

export const GlobalToolsProvider = (props) => {
    const [selectedTools, setSelectedTools] = useState([]);
    const { id: chat_session} = useParams();

    return (
        <GlobalToolsContext.Provider
        value={{
            chat_session,
            selectedTools,
            setSelectedTools
        }}
        >
            {props.children}
        </GlobalToolsContext.Provider>
    )
}