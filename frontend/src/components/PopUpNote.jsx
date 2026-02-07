
const PopUpNote = (
    { open, setOpen, selectedMessage, title, setTitle, collection, setCollection }
) => {

    

    return (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 backdrop-blur">
        <div className="bg-white text-[#414535] p-4 rounded-xl w-[320px] space-y-3">

        <h3 className="font-semibold">Save to Note</h3>

        <div>
            <label className="text-sm">Blog Name</label>
            <input
            value={collection}
            onChange={(e) => setCollection(e.target.value)}
            className="w-full mt-1 p-2 rounded bg-white text-[#414535] border-b-2 border-amber-800"
            />
        </div>

        <div>
            <label className="text-sm">Note Title</label>
            <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full mt-1 p-2 rounded bg-white text-[#414535] border-b-2 border-amber-800"
            />
        </div>

        <div className="flex gap-2 justify-end pt-2">
            <button onClick={() => {setOpen(false)
                console.log(selectedMessage)
            }}>Cancel</button>

            <button
            onClick={() => {
                saveNote({
                collection,
                title,
                content: chat.message,
                });
                setOpen(false);
            }}
            className="bg-[#d6c7a1] text-black px-3 py-1 rounded"
            >
            Save
            </button>
        </div>
        </div>
    </div>
    )
}

export default PopUpNote;