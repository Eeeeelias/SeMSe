# This should handle user queries and return the appropriate response
import numpy as np
from backend.retrieve_embeddings import encode_text, compute_cosine_similarity
from backend import database_functions as dbf
import re


def combine_parts(query_result, title, episode_id, timestamp=None):
    query_result.sort(key=lambda x: x[-1] if x[-1] is not None else 0)

    combined_text = ""
    embeddings = []
    for k in query_result:
        if k[0] == title and k[1] == episode_id and (timestamp is None or k[3] == timestamp):
            combined_text += k[4] + " "
            embeddings.append(eval(k[-2]))
    return combined_text, embeddings


def combine_multi_part_query(query_result: list, type=None) -> list:
    combined = []
    if not any(q[-1] is not None for q in query_result):
        return query_result

    if type == 'conversation':
        for q in query_result:
            title, episode_id, language, timestamp, text, embedding, part = q
            if part is None:
                embedding = eval(embedding)
                combined.append((title, episode_id, language, timestamp, text, [embedding], None))
            elif part == 0:
                combined_text, embeddings = combine_parts(query_result, title, episode_id, timestamp)
                combined.append((title, episode_id, language, timestamp, combined_text, embeddings, None))
    elif type == 'description':
        for q in query_result:
            title, episode_id, text, embedding, part = q
            if part is None:
                embedding = eval(embedding)
                combined.append((title, episode_id, text, [embedding], None))
            else:
                combined_text, embeddings = combine_parts(query_result, title, episode_id)
                combined.append((title, episode_id, combined_text, embeddings, None))
    return combined


def format_episode_id(episode_id: str):
    episode_id = episode_id.upper()
    # remove leading zeros after 'E' if the number after is greater than 9
    episode_id = re.sub(r'(?<=E)0+(?=\d{2,})', '', episode_id)
    return episode_id


def query_db(query: str, show: str = None, table: str = None,
             language: str = None, season=None, type='both', offset=0, conn=None):
    if not conn:
        conn = dbf.get_conn()
    else:
        conn = conn
    # take only the first encoding
    query = encode_text(query)[1][0]

    general_data = [conn, query, show, table]

    if type == 'description':
        results = description_query(*general_data, limit=10, offset=offset, season=season)
    elif type == 'conversation':
        results = subtitle_query(*general_data, language, limit=10, offset=offset, season=season)
    else:
        results_sub = subtitle_query(*general_data, language, limit=5, offset=offset, season=season)
        results_desc = description_query(*general_data, len(results_sub), limit=5, offset=offset, season=season)
        results = {**results_desc, **results_sub}

    # sort results by similarity
    results = {k: v for k, v in sorted(results.items(), key=lambda item: item[1]['similarity'], reverse=True)}
    return results


def subtitle_query(conn, embed_query: np.ndarray, show: str = None,
                   table: str = None, language: str = 'English', limit=5, offset=0, season=None):

    results_sub = dbf.query_subtitle(conn, embed_query, show, table, language, limit, offset, season)
    results_sub = combine_multi_part_query(results_sub, 'conversation')
    results = {}
    for idx, result in enumerate(results_sub):
        title, episode_id, _, timestamp, text, embeddings, _ = result
        similarity = max([compute_cosine_similarity(x, embed_query) for x in embeddings])
        offset = int(offset)
        results[idx + offset] = {'title': title, 'episode_id': format_episode_id(episode_id), 'timestamp': timestamp,
                                 'text': text, 'similarity': similarity, 'type': 'conversation'}
    return results


def description_query(conn, embed_query: np.ndarray, show: str = None,
                      table: str = None, ex=0, limit=5, offset=0, season=None):

    results_desc = dbf.query_description(conn, embed_query, show, table, limit, offset, season)
    results_desc = combine_multi_part_query(results_desc, 'description')
    results = {}
    for idx, result in enumerate(results_desc):
        title, episode_id, text, embedding, _ = result
        similarity = compute_cosine_similarity(embed_query, eval(embedding))
        offset = int(offset)
        results[idx + ex + offset] = {'title': title, 'episode_id': format_episode_id(episode_id), 'text': text,
                                      'similarity': similarity, 'type': 'description'}
    return results
