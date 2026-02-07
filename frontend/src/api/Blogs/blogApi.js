import apiClient from "../client.js";

// output format: {status: true, blogs: [], error: null}
export async function getBlogs() {
    try{
        const res = await apiClient.get("/blog/");
        return {
            status: true,
            blogs: res.data,
            error: null
        }
    }catch(error){
        return {
            status: false,
            blogs: null,
            error: error.status
        }
    }
}
// getBlogs().then(res => console.log(res)).catch(err => console.log(err))

// input formtat: {blog_name: blogName} | /blog/ with payload
export async function createBlog(blogName) {
    try{
        const res = await apiClient.post("/blog/", {'blog_name': blogName});
        const output = {
            status: true,
            blog_id: res.data.collection_id,
            error: null
        }
        
        return output
    } catch(err){
        return {
            status: false,
            blog_id: null,
            error: err.response.statusText
        }
    }
}
/*Test
createBlog('From Frontend: Testing Delete without Note').
    then(res => console.log(res)).
    catch(err => console.log(err))
*/


// input format: {blog_name: blogName, note: {title: title, content: content}} | /blog/blog_note/ with payload
export async function createBlogNote(data){
    try {
        const res = await apiClient.post('/blog/blog_note/', data);
        const status = res.data.status
        if(status == true)
            return {
                'status': res.data.status,
                'blog_id': res.data.collection_id,
                'note_id': res.data.note_id,
            }
        else
            return {
                'status': res.data.status,
                'error': res.data.message,
                'timestamp': res.data.timestamp
            }
    } catch (error) {
        console.log("catch error: ", error);
        return {
            'status': false,
            'error': error.response.statusText,
            'code': error.code
        }
    }
}
/*Test
const data = {
    "blog_name": "From Frontend: Testing Delete with Note",
    "note": {
        "title": "Test from frontend with Note",
        "content": "Sending from creating both blog and note request!"
    }
}
createBlogNote(data).
    then(res => console.log(res)).
    catch(err => console.log(err))
*/


// input format: {blog_name: blogName}
export async function renameBlog(blog_id, blog_name){
    try{
        const res = await apiClient.patch(`/blog/${blog_id}/`, {'blog_name': blog_name});

        if(res.data.status == true)
            return {
                status: true,
                error: null
            }
        
        return {
                status: false,
                error: res.data.error.message
            }
    } catch(err){
        return {
            status: false,
            error: err.response.statusText
        }
    }

}
/*Test
renameBlog('69786bc03d75d4fc1a7a2b0d', 'From Frontend: 27th Tuesday')
    .then(res => console.log(res))
    .catch(err => console.log(err))
*/

export async function deleteBlogNote(blog_id){
    try{
        const res = await apiClient.delete(`/blog/${blog_id}/`)

        if(res.data.status == true)
            return {
                status: true,
                error: null
            }
        
        return {
                status: false,
                error: res.data.error.message
            }
    } catch(err){
        return {
            status: false,
            error: err.response.statusText
        }
    }
}
/*Test
deleteBlogNote('69787c17c78ed686c450b53e')
    .then(res => console.log(res))
    .catch(err => console.log(err))
*/
