import pandas as pd 
from pymongo import MongoClient
from dotenv import load_dotenv
import mysql.connector
import os
from os.path import join, dirname

# dotenv_path = join(dirname(__file__), '.env')
# print(dotenv_path)
# load_dotenv(dotenv_path)

# MONGO_DB_PASS = os.environ.get("MONGO_URL")

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

swimmer_data = swimmer_data[['Name',
'Gender',
'Nationality',
'Stroke',
'Speciality',
'US College / University',
'DI Conference',
'Birthday',
'Continent 1',
'Continent 2'
]]

swimmer_data.fillna("N/A", inplace=True)

print(swimmer_data)

#convert to dicts for insertion
swimmers = swimmer_data.to_dict("records")
countries = country_info.to_dict("records")

swimmers = list(swimmer_data.itertuples(index=False, name=None))


mydb = mysql.connector.connect(
    host="localhost",
    user="root",
    password="MRD*goCaps4",
    database="swimmers"
)

sql = "INSERT INTO swimmers (Name, Gender, Nationality,Stroke,Speciality,`US College / University`,`DI Conference`,Birthday,`Continent 1`,`Continent 2`) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"

mycursor = mydb.cursor()

mycursor.executemany(sql, swimmers)
mydb.commit()

print(mycursor.rowcount, "was inserted.")
