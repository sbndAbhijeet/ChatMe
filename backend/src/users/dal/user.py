from bson import ObjectId

class UserDAL:
    def __init__(self, user_collection):
        self._collection = user_collection

    async def create_user(self, email: str, password: str):
        return await self._collection.insert_one({
            "email": email,
            "password": password,
            "openrouter_api_key": None,
        })

    async def get_user_by_email(self, email: str):
        return await self._collection.find_one({"email": email})

    async def get_user_by_id(self, user_id: str):
        return await self._collection.find_one({"_id": ObjectId(user_id)})

    async def update_openrouter_api_key(self, user_id: str, api_key: str):
        return await self._collection.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    "openrouter_api_key": api_key,
                }
            }
        )