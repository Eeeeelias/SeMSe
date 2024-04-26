# the goal is to save descriptions of video files as embeddigns to a vector database and then query the database to
# find the most similar video to a given query. This should enable the user to more easily find episodes based on
# plot that they remember.
from backend.retrieve_embeddings import *

descriptions, subtitles = retrieve_media("/mnt/MediaFiles/MediaFiles/Movies/Youjo Senki Movie (2019)", "Movie")
print(len(descriptions))

