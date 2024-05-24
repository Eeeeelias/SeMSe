# This should handle user queries and return the appropriate response
import numpy as np
from backend.retrieve_embeddings import encode_text, compute_cosine_similarity
from backend import database_functions as dbf
from backend.retrieve_images import map_image
import re


def format_episode_id(episode_id: str):
    episode_id = episode_id.upper()
    # remove leading zeros after 'E' if the number after is greater than 9
    episode_id = re.sub(r'(?<=E)0+(?=\d{2,})', '', episode_id)
    return episode_id


def combine_parts(query_result, title, episode_id, embedded_query, timestamp=None):
    query_result.sort(key=lambda x: x[-1] if x[-1] is not None else 0)

    combined_text = []
    embeddings = []
    for k in query_result:
        if k[0] == title and k[1] == episode_id and (timestamp is None or k[3] == timestamp):
            combined_text.append(k[4] + " ")
            embeddings.append(eval(k[-2]))

    similarities = [compute_cosine_similarity(embed, embedded_query) for embed in embeddings]
    highest_index = similarities.index(max(similarities))
    best_match = combined_text[highest_index] if combined_text[highest_index] else None
    combined_text = " ".join(combined_text)

    return combined_text, best_match, similarities


def combine_multi_part_query(query_result: list, embedded_query, type=None) -> list:
    combined = []
    if not any(q[-1] is not None for q in query_result):
        # eval q[-2] to make sure it's always of the correct datatype
        query_formatted = []
        for result in query_result:
            computed = list(result)
            similarity = compute_cosine_similarity(eval(result[-2]), embedded_query)
            computed[-2] = [similarity]
            computed.insert(-2, None)
            query_formatted.append(computed)
        return query_formatted

    if type == 'conversation':
        for q in query_result:
            title, episode_id, language, timestamp, text, ep_title, embedding, part = q
            if part is None:
                similarity = compute_cosine_similarity(eval(embedding), embedded_query)
                combined.append((title, episode_id, language, timestamp, text, ep_title, None, [similarity], None))

            elif part == 0:
                combined_text, best_match, similarities = combine_parts(query_result, title, episode_id, embedded_query, timestamp)
                combined.append((title, episode_id, language, timestamp, combined_text, ep_title, best_match, similarities, None))

    elif type == 'description':
        for q in query_result:
            title, episode_id, text, ep_title, embedding, part = q
            if part is None:
                similarity = compute_cosine_similarity(eval(embedding), embedded_query)
                combined.append((title, episode_id, text, ep_title, None, [similarity], None))
            else:
                combined_text, best_match, similarities = combine_parts(query_result, title, episode_id, embedded_query)
                combined.append((title, episode_id, combined_text, ep_title, best_match, similarities, None))

    return combined


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
    return [v for v in sorted(results.values(), key=lambda x: x['similarity'], reverse=True)]


def subtitle_query(conn, embed_query: np.ndarray, show: str = None,
                   table: str = None, language: str = 'English', limit=5, offset=0, season=None):

    results_sub = dbf.query_subtitle(conn, embed_query, show, table, language, limit, offset, season)
    results_sub = combine_multi_part_query(results_sub, embed_query, 'conversation')
    results = {}
    for idx, result in enumerate(results_sub):
        title, episode_id, _, timestamp, text, ep_title, best_match, embeddings, _ = result
        # idea: maybe retrieve file path of image from here and send it to frontend
        image_uuid = map_image(title, episode_id, table)
        similarity = max(embeddings)
        offset = int(offset)
        results[idx + offset] = {'title': title,
                                 'episodeId': format_episode_id(episode_id),
                                 'timestamp': timestamp,
                                 'text': text,
                                 'exactMatch': best_match,
                                 'episodeTitle': ep_title,
                                 'similarity': similarity,
                                 'type': 'conversation',
                                 'imageId': image_uuid}
    return results


def description_query(conn, embed_query: np.ndarray, show: str = None,
                      table: str = None, ex=0, limit=5, offset=0, season=None):

    results_desc = dbf.query_description(conn, embed_query, show, table, limit, offset, season)
    results_desc = combine_multi_part_query(results_desc, embed_query, 'description')
    results = {}
    for idx, result in enumerate(results_desc):
        title, episode_id, text, ep_title, best_match, embeddings, _ = result
        image_uuid = map_image(title, episode_id, table)
        similarity = max(embeddings)
        offset = int(offset)
        results[idx + ex + offset] = {'title': title,
                                      'episodeId': format_episode_id(episode_id),
                                      'text': text,
                                      'exactMatch': best_match,
                                      'episodeTitle': ep_title,
                                      'similarity': similarity,
                                      'type': 'description',
                                      'imageId': image_uuid}
    return results
