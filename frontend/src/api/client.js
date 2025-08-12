import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:8000",
    headers: {
        "Content-Type": "application/json",
    },
})

//adding interceptors for error handling

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.log("API error: ", error);
        return Promise.reject(error);
    }
)

export default apiClient;