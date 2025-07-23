import { createContext, useContext, useEffect, useState } from "react";
import { getHistory, postMessage } from "../api/chatDocs";

export const ChatHistoryContext = createContext(null);

export const useHistory = () => {
    return useContext(ChatHistoryContext);
}

export const ChatHistoryProvider = (props) => {

    const [history, setHistory] = useState([
        { 
            id: 1,
            title: 'Marketing strategy ideas',
            messages: [
            { 
            sender: "user",
            message: "Can you tell me some Stratergies of marketing"
            },
            {
            sender: "bot",
            message: "Sure Here are some marketing stratergies: **Know  Your Audience**, **Content is King**, **Build Relations**."
            }
        ]
        },
        { 
        id: 2,
        title: 'Python code review',
        messages: [
            {
            sender: "user",
            message: "def sum (a, b) -> int: return a+b is my code correct"
            },
            {
            sender: "bot",
            message: "No, your code is not correct. While it will likely appear to work in many cases, the is operator is not meant for comparing numerical values for equality. It's for checking object identity (whether two variables point to the same object in memory)."
            }
        ]  
        },
        { 
        id: 3,
        title: 'Favourite Cricketer Sachin',
        messages: [
            {
            sender: "user",
            message: "I am fan of Sachin Can you tell about him"
            },
            {
            sender: "bot",
            message: " Okay, here's a short summary of Sachin Tendulkar:Sachin Tendulkar is widely regarded as one of the greatest cricketers of all time. An Indian icon, he holds numerous batting records, including the most runs in both Test and One Day International (ODI) cricket. He's the only player to have scored 100 international centuries. Known for his incredible technique, dedication, and sportsmanship, Sachin is a national hero in India and an inspiration to millions. He retired from international cricket in 2013 after a remarkable 24-year career."
            }
        ]
        },
    // Would typically come from your API/local storage
    ]);
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        const {data, error} = await getHistory();
        if(error){
            alert("Error in Fetching data: "+error)
            return;
        }
        setHistory(data);
    }

    const addUserInput = async (msg) => {
        const {data, error} = await postMessage(msg)
        if(error){
            alert("Error in sending user message: "+error)
            return;
        }
    }

    const createChat = async (chat) => {
        try {
            const res = await axios.post('/api/create-chat/', msg);
            setHistory(prev => [...prev, res.data])
        } catch (error) {
            console.error("Failed to create Chat", error)
        }
    }

    return (
        <ChatHistoryContext.Provider value={{history, setHistory, isTyping, setIsTyping, fetchHistory, addUserInput, createChat}}>
            {props.children}
        </ChatHistoryContext.Provider>
    )
}