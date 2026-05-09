import pandas as pd

# Load dataset
df = pd.read_csv("../data/hvac_sensor_data.csv")

# First rows
print("\nFIRST 5 ROWS")
print(df.head())

# Columns
print("\nCOLUMNS")
print(df.columns)

# Dataset info
print("\nDATASET INFO")
print(df.info())

# Missing values
print("\nMISSING VALUES")
print(df.isnull().sum())

# Statistics
print("\nSTATISTICS")
print(df.describe())