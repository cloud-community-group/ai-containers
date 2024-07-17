from pinecone import Pinecone, ServerlessSpec
from transformers import AutoTokenizer, AutoModel
import torch


# Initialize Pinecone client by your api key
pc = Pinecone(api_key="YOUR-API-KEY")

# Hugging Face model and tokenizer
model_name = "sentence-transformers/all-MiniLM-L6-v2"  # You can choose any appropriate model
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModel.from_pretrained(model_name)

# Function to generate embeddings
def generate_embeddings(texts):
    inputs = tokenizer(texts, return_tensors="pt", padding=True, truncation=True)
    with torch.no_grad():
        outputs = model(**inputs)
    embeddings = outputs.last_hidden_state.mean(dim=1).numpy()
    return embeddings

# Example of Dummy logs
logs = {
    "DEBUG": [
        "2024-07-17 12:35:10,789 DEBUG [com.example.Cache] - Cache miss for key: user_1234",
        "2024-07-17 12:35:30,901 DEBUG [com.example.Queue] - Added message to queue: messageId=abcd1234",
        "2024-07-17 12:35:50,123 DEBUG [com.example.Config] - Configuration reloaded from: /etc/app/config.yaml",
        "2024-07-17 12:36:10,345 DEBUG [com.example.Session] - Session created: sessionId=session_5678"
    ],
    "ERROR": [
        "2024-07-17 12:35:05,456 ERROR [com.example.Service] - Failed to process request: java.lang.NullPointerException",
        "2024-07-17 12:35:25,678 ERROR [com.example.Payment] - Payment processing failed for transactionId=7890",
        "2024-07-17 12:35:45,890 ERROR [com.example.Storage] - Disk space running low on server: serverId=server01",
        "2024-07-17 12:36:05,012 ERROR [com.example.Email] - Email delivery failed for recipient=user@example.com"
    ],
    "INFO": [
        "2024-07-17 12:34:56,789 INFO [com.example.App] - Application started successfully.",
        "2024-07-17 12:35:15,012 INFO [com.example.Metrics] - User logged in: userId=1234, ipAddress=192.168.1.1",
        "2024-07-17 12:35:35,234 INFO [com.example.App] - Graceful shutdown initiated.",
        "2024-07-17 12:35:55,456 INFO [com.example.Scheduler] - Scheduled task executed: taskId=task_9876"
    ],
    "WARN": [
        "2024-07-17 12:35:01,123 WARN [com.example.Database] - Database connection pool is running low.",
        "2024-07-17 12:35:20,345 WARN [com.example.Security] - Suspicious login attempt detected for userId=5678",
        "2024-07-17 12:35:40,567 WARN [com.example.Network] - Network latency detected: 500ms",
        "2024-07-17 12:36:00,789 WARN [com.example.Auth] - Invalid token detected for userId=1234"
    ]
}


# Flatten logs and Log types
flattened_logs = []
log_types = []
for log_type, messages in logs.items():
    for message in messages:
        flattened_logs.append(message)
        log_types.append(log_type)


# Generate embeddings for the logs
embeddings = generate_embeddings(flattened_logs)

# Upsert data to Pinecone
index_name = "analyze-log-type" # your index name
embedding_dim = embeddings.shape[1]  # Get the correct dimension from the embeddings
if index_name not in pc.list_indexes():
    pc.create_index(
        index_name,
        dimension=embedding_dim,
        metric="cosine",
        spec=ServerlessSpec(
            cloud="aws",
            region="us-east-1"
        )
    )
    
# Create vectors for upsert
vectors = [
    {
        "id": f"log-{i}",
        "values": embedding.tolist(),
        "metadata": {"type": log_type}
    }
    for i, (log_type, embedding) in enumerate(zip(log_types, embeddings))
]

index = pc.Index(index_name)
index.upsert(vectors)
print("Data is upserted in pine cone")

