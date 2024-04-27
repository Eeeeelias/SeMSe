# the goal is to save descriptions of video files as embeddigns to a vector database and then query the database to
# find the most similar video to a given query. This should enable the user to more easily find episodes based on
# plot that they remember.
import timeit

import psycopg2
import backend.database_functions as dbf
import backend.retrieve_embeddings as re

conn = psycopg2.connect(
    host="192.168.0.2",
    database="postgres",
    user="postgres",
    password="secret",
    port=5432
)

cur = conn.cursor()


query = "Rimuru transforms into a slime"
start = timeit.default_timer()
embedded_query = re.encode_text(query)
print("Embedding query took: ", timeit.default_timer() - start, "seconds")

# query subtitles
start = timeit.default_timer()
result = dbf.query_description(conn, embedded_query, table="Animes")
print("Querying subtitles took: ", timeit.default_timer() - start, "seconds")
# result = dbf.query_description(conn, embedded_query, table="Animes")

result = dbf.size_of_db(conn)

if len(result) == 0:
    print("No matches found")

for match in result:
    print(match, result[match])
    # print(match)
