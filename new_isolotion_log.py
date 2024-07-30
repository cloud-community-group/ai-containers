import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
import matplotlib.pyplot as plt
from datetime import datetime

# Read the log file
with open('logfile.txt', 'r') as file:
    logs = file.readlines()

# Define a mapping for log levels
log_level_mapping = {"DEBUG": 1, "INFO": 2, "WARN": 3, "ERROR": 4, "ALERT": 5, "UNKNOWN": 6}

# Extract features from log entries
data = []

# Process the logs
for log in logs:
    # Remove \n from string
    log = log.replace('\n', ' ')

    # Split log
    parts = log.split(" ", 5)
    
    # split datetime
    dates = parts[0].split("T")

    timestamp = datetime.strptime(parts[0] + " " + parts[1], "%Y-%m-%d %H:%M:%S.%f")
    log_level = log_level_mapping[parts[2]]
    message = parts[5]
    data.append([timestamp, log_level, message])

print('data = ', data)
# Create a DataFrame
df = pd.DataFrame(data, columns=["timestamp", "log_level", "message"])

# Convert timestamps to ordinal (numeric) format
df['timestamp'] = df['timestamp'].map(datetime.toordinal)

# We only use the timestamp and log_level as features for the Isolation Forest
X = df[["timestamp", "log_level"]]

# Train the Isolation Forest model
clf = IsolationForest(contamination=0.1, random_state=42)
clf.fit(X)

# Predict anomalies
df['anomaly'] = clf.predict(X)

# Print the DataFrame with anomaly detection results
print(df)

# Visualize the results
plt.scatter(df['timestamp'], df['log_level'], c=df['anomaly'], cmap='coolwarm')
plt.title("Isolation Forest Anomaly Detection on Log Data")
plt.xlabel("Timestamp")
plt.ylabel("Log Level")
plt.show()