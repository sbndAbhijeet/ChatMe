
export async function getHistory () {
    try {
        const res = await axios.get("/api/history")
        return {
            data: res.data,
            error: null
        }
    } catch (error) {
        return {
            data: null,
            error: error?.response?.data?.detail || error.message
        }
    }
}

export async function postMessage (msg) {
    try {
        const res = await axios.post('/api/post/history', msg);
        return {
            data: res.data,
            error: false
        }
    } catch (error) {
        return {
            data: null,
            error: true
        }
    }
}