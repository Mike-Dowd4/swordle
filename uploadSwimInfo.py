import pandas as pd 
from pymongo import MongoClient
from dotenv import load_dotenv
import os
from os.path import join, dirname

dotenv_path = join(dirname(__file__), '.env')
print(dotenv_path)
load_dotenv(dotenv_path)

MONGO_DB_PASS = os.environ.get("MONGO_URL")

df = pd.read_csv("Swim Info - Swimmer Info.csv")
print(df.head())

data_dict = df.to_dict("records")

with MongoClient(MONGO_DB_PASS) as client:
    swimmers_collection = client.swimmer_data.swimmers
    swimmers_collection.insert_one(data_dict[0])