import apiClient from "../client.js";

const BASE_URL = "/blog/note"

export async function createNote(blog_id, note_data) {
    try{
        const res = await apiClient.post(`${BASE_URL}/${blog_id}`, note_data);
        const data = res.data
        return {
            status: data.status,
            note_id: data.status ? data.note_id : null,
            error: data.status ? null : data.message
        }
    }catch(error){
        return {
            status: false,
            note_id: null,
            error: error.status
        }
    }
}
/*Test
createNote('695d4e8151ae53cf487e8621', {'title': 'Test note', 'content': 'This is a test note'})
.then(res => console.log(res))
.catch(err => console.log(err))

output: { status: true, note_id: '697b5b89f8fb94a2d67b01ab', error: null }
*/


export async function getNote(note_id) {
  try {
    const res = await apiClient.get(`${BASE_URL}/${note_id}`);

    return {
      status: true,
      note: res.data,   // single note object
      error: null
    };

  } catch (error) {
    return {
      status: false,
      note: null,
      error: error?.response?.data?.detail || "Failed to fetch note"
    };
  }
}
/*Test
getNote('697b5b89f8fb94a2d67b01ab')
.then(res => console.log(res))
.catch(err => console.log(err))
*/

export async function getNotes(collection_id) {
  try {
    const res = await apiClient.get(`${BASE_URL}/${collection_id}/notes`);

    return {
      status: true,
      notes: res.data,   // this is the array of notes
      error: null
    };

  } catch (error) {
    return {
      status: false,
      notes: null,
      error: error?.response?.data?.detail || "Failed to fetch notes"
    };
  }
}
/* Test
getNotes('695d15f5407c32eb8db9b317')
.then(res => console.log(res))
.catch(err => console.log(err))
 */


// export async function updateNoteTitle(note_id, title) {
//     try {
//         const res = await apiClient.patch(`${BASE_URL}/title/${note_id}/`, {"title":title});
//         const data = res.data
//         return {
//             status: data.status,
//             message: data.status ? data.message : null,
//             error: data.status ? null : data.message
//         }
//     } catch (error) {
//         return {
//             status: false,
//             message: null,
//             error: error.status
//         }
//     }
// }
/*Test
updateNoteTitle('697b5b89f8fb94a2d67b01ab', 'Updated title').then(res => console.log(res)).catch(err => console.log(err))
*/


export async function updateNote(note_id, updatedData) {
    try {
        console.log("update note api")
        console.log(updatedData)
        const res = await apiClient.patch(`${BASE_URL}/${note_id}/`, updatedData);
        const data = res.data
        return {
            status: data.status,
            message: data.status ? data.message : null,
            error: data.status ? null : data.message
        }
    } catch (error) {
        console.log(error)
        return {
            status: false,
            error: error.status
        }
    }
}
/*Test
updateNote('697b5b89f8fb94a2d67b01ab', {'title':'noteApi change', 'content':'Updated content'}).then(res => console.log(res)).catch(err => console.log(err))

output:
{timestamp=
status=
message=}
*/


export async function deleteNote(note_id) {
    try {
        const res = await apiClient.delete(`${BASE_URL}/${note_id}/`);
        const data = res.data
        return {
            status: data.status,
            error: data.status ? null : data.message
        }
    } catch (error) {
        return {
            status: false,
            error: error.status
        }
    }
}

/*Test
deleteNote('697b5b89f8fb94a2d67b01ab').then(res => console.log(res)).catch(err => console.log(err))
*/