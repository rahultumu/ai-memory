import asyncio
from mongomock_motor import AsyncMongoMockClient

async def test_db():
    client = AsyncMongoMockClient()
    db = client.test_db
    result = await db.test_collection.insert_one({"test": "data"})
    print(f"Inserted ID: {result.inserted_id}")
    doc = await db.test_collection.find_one({"test": "data"})
    print(f"Found doc: {doc}")

if __name__ == "__main__":
    asyncio.run(test_db())
