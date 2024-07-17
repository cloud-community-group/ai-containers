from pinecone import Pinecone
from transformers import AutoTokenizer, AutoModel
import torch
import numpy as np


# Initialize Pinecone client
pc = Pinecone(api_key="YOUR-API-KEY")

# Hugging Face model and tokenizer
model_name = "sentence-transformers/all-MiniLM-L6-v2"  # Choosing an appropriate model
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModel.from_pretrained(model_name)

# Defining index parameters
index_name = "analyze-log-type" # your index name
index = pc.Index(index_name)

# Function to generate embeddings
def generate_embeddings(texts):
    inputs = tokenizer(texts, return_tensors="pt", padding=True, truncation=True)
    with torch.no_grad():
        outputs = model(**inputs)
    embeddings = outputs.last_hidden_state.mean(dim=1).numpy()
    return embeddings

query_sentence = "INFORMATION This package has been installed" # Example query sentence
query_embedding = generate_embeddings(query_sentence) # Generate embedding for the query sentence
query_embedding = (query_embedding - np.mean(query_embedding)) / np.std(query_embedding) # Normalize query embedding
query_embedding = query_embedding.astype(np.float32).tolist()  # Convert to list


# Query Pinecone index
query_response = index.query(
    vector=query_embedding,
    top_k=5,  # Adjust top_k as needed
    include_values=True,  # Retrieve document values
    include_metadata= True # Retrieve Metadata document values
)

for match in query_response['matches']:
    message = match['metadata']
    print(f"{message.get('type')}")