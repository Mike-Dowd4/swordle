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

swimmer_data = df[['Name',
'Gender',
'Nationality',
'Age','Stroke',
'Speciality',
'US College / University',
'DI Conference',
'Birthday',
'Previous US College / University',
'Previous DI Conference',
'Continent 1',
'Continent 2',
'ISL Team',
'Former ISL Teams']].copy()

conference_info = df[['NCAA College','Conference']].copy()
country_info = df[['USA', 'North America']].copy()
country_info = country_info.rename(columns={"USA": "Country", "North America": "Continent"})

#delete NaN rows
country_info.dropna(inplace=True)

#add USA, NA
country_info.loc[len(country_info.index)] = ['USA', 'North America'] 

#convert to dicts for insertion
swimmers = swimmer_data.to_dict("records")
countries = country_info.to_dict("records")


#inserts all data
with MongoClient(MONGO_DB_PASS) as client:
    swimmers_collection = client.swimmer_data.swimmers
    swimmers_collection.insert_many(swimmers)

    countries_collection = client.swimmer_data.countries
    countries_collection.insert_many(countries)