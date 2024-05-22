import pandas as pd 
from pymongo import MongoClient

df = pd.read_csv("Swim Info - Swimmer Info.csv")
print(df.head())

data_dict = df.to_dict("records")

for record in data_dict:
    print()
    print()
    print(record)