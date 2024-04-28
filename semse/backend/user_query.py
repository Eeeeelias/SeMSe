# This should handle user queries and return the appropriate response
import numpy as np
from backend.retrieve_embeddings import encode_text, compute_cosine_similarity
from backend import database_functions as dbf
import re


def format_episode_id(episode_id: str):
    episode_id = episode_id.upper()
    # remove leading zeros after 'E' if the number after is greater than 9
    episode_id = re.sub(r'(?<=E)0+(?=\d{2,})', '', episode_id)
    return episode_id


def query_db(query: str, show: str = None, table: str = None,
             language: str = 'English', season=None, type='both', offset=0):
    conn = dbf.get_conn()
    query = encode_text(query)

    general_data = [conn, query, show, table]

    if type == 'description':
        results = description_query(*general_data, limit=10, offset=offset, season=season)
    elif type == 'conversation':
        results = subtitle_query(*general_data, language, limit=10, offset=offset, season=season)
    else:
        results_sub = subtitle_query(*general_data, language, limit=5, offset=offset, season=season)
        results_desc = description_query(*general_data, len(results_sub), limit=5, offset=offset, season=season)
        results = {**results_desc, **results_sub}

    # query descriptions as well
    return results


def subtitle_query(conn, embed_query: np.ndarray, show: str = None,
                   table: str = None, language: str = 'English', limit=5, offset=0, season=None):

    results_sub = dbf.query_subtitle(conn, embed_query, show, table, language, limit, offset, season)
    results = {}
    for idx, result in enumerate(results_sub):
        title, episode_id, _, timestamp, text, embedding = result
        similarity = compute_cosine_similarity(embed_query, eval(embedding))
        offset = int(offset)
        results[idx + offset] = {'title': title, 'episode_id': format_episode_id(episode_id), 'timestamp': timestamp,
                                 'text': text, 'similarity': similarity, 'type': 'conversation'}
    return results


def description_query(conn, embed_query: np.ndarray, show: str = None,
                      table: str = None, ex=0, limit=5, offset=0, season=None):

    results_desc = dbf.query_description(conn, embed_query, show, table, limit, offset, season)
    results = {}
    for idx, result in enumerate(results_desc):
        title, episode_id, text, embedding = result
        similarity = compute_cosine_similarity(embed_query, eval(embedding))
        offset = int(offset)
        results[idx + ex + offset] = {'title': title, 'episode_id': format_episode_id(episode_id), 'text': text,
                                      'similarity': similarity, 'type': 'description'}
    return results
