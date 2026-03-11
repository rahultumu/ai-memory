from textblob import TextBlob
from sentence_transformers import SentenceTransformer
import os
import numpy as np

# Initialize embedding model (this downloads it on first run, it's a lightweight local model)
# We use all-MiniLM-L6-v2 which is standard and fast for semantic search
model_name = "all-MiniLM-L6-v2"
model = SentenceTransformer(model_name)

def analyze_emotion(text: str) -> str:
    """
    Analyzes the sentiment of a text and categorizes it into basic emotions:
    Happy, Sad, Neutral, Stressed.
    """
    analysis = TextBlob(text)
    polarity = analysis.sentiment.polarity
    
    # Simple heuristic
    if polarity >= 0.3:
        return "Happy"
    elif polarity <= -0.3:
        # Check for stress keywords to differentiate from Sad
        stress_words = ["stress", "anxious", "overwhelmed", "panic", "worried", "pressure", "work"]
        if any(word in text.lower() for word in stress_words):
            return "Stressed"
        return "Sad"
    else:
        return "Neutral"

def get_embedding(text: str) -> list[float]:
    """
    Generates a generic fixed-size semantic embedding for a text snippet.
    Returns: A list of floats representing the embedding vector.
    """
    # model.encode returns a numpy array, convert to list for MongoDB storage
    embedding = model.encode(text)
    return embedding.tolist()

def compute_cosine_similarity(vec1, vec2):
    """
    Compute cosine similarity between two vectors.
    """
    v1 = np.array(vec1)
    v2 = np.array(vec2)
    return np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2) + 1e-10)
