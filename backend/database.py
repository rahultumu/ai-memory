import os
from mongomock_motor import AsyncMongoMockClient
from dotenv import load_dotenv

load_dotenv()

# We use an in-memory mock MongoDB so it runs perfectly without a local MongoDB installation
client = AsyncMongoMockClient()
db = client.ai_memory_companion

def get_db():
    return db
