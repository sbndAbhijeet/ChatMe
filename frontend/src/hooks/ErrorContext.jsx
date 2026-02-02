import { createContext, useContext, useState } from "react";

const ErrorContext = createContext();

export const ErrorProvider = ({ children }) => {
    const [error, setError] = useState(null);

    const showError = (message) => {
        setError(message);

        //auto hide after 3s
        setTimeout(() => {
            setError(null);
        }, 3000);
    }

    return (
        <ErrorContext.Provider value={{ error, setError, showError }}>
            {children}
            {error && <ErrorPopup message={error}/>}
        </ErrorContext.Provider>
    );
};

export const useError = () => useContext(ErrorContext);