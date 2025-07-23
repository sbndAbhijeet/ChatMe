import axios from "axios";

export async function post_message(userInput){
    try {
        const res = await axios.post("/api/bot", {message: userInput})

        console.log("ai-res: ", res.data.reply)
        return res.data.reply;
    } catch (error) {
        console.log("Error calling chat API:", error)
    }
}