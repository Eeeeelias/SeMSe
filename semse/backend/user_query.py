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


def query_db(query: str, show: str = None, table: str = None, language: str = 'English', type='both'):
    conn = dbf.get_conn()
    query = encode_text(query)

    if type == 'description':
        results = description_query(conn, query, show, table, limit=10)
    elif type == 'conversation':
        results = subtitle_query(conn, query, show, table, language, limit=10)
    else:
        results_sub = subtitle_query(conn, query, show, table, language)
        results_desc = description_query(conn, query, show, table, len(results_sub))
        results = {**results_desc, **results_sub}

    # query descriptions as well
    return results


def subtitle_query(conn, embed_query: np.ndarray,
                   show: str = None, table: str = None, language: str = 'English', limit=5):
    results_sub = dbf.query_subtitle(conn, embed_query, show, table, language, limit)
    results = {}
    for idx, result in enumerate(results_sub):
        title, episode_id, _, timestamp, text, embedding = result
        similarity = compute_cosine_similarity(embed_query, eval(embedding))
        results[idx] = {'title': title, 'episode_id': format_episode_id(episode_id), 'timestamp': timestamp,
                        'text': text, 'similarity': similarity, 'type': 'conversation'}
    return results


def description_query(conn, embed_query: np.ndarray, show: str = None, table: str = None, ex=0, limit=5):
    results_desc = dbf.query_description(conn, embed_query, show, table, limit)
    results = {}
    for idx, result in enumerate(results_desc):
        title, episode_id, text, embedding = result
        similarity = compute_cosine_similarity(embed_query, eval(embedding))
        results[idx + ex] = {'title': title, 'episode_id': format_episode_id(episode_id), 'text': text,
                             'similarity': similarity, 'type': 'description'}
    return results
