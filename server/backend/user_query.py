# This should handle user queries and return the appropriate response
import numpy as np
from backend.retrieve_embeddings import encode_text, compute_cosine_similarity
from backend.format_subtitles import convert_stamp_to_seconds
from backend import database_functions as dbf
from backend.retrieve_images import map_image
import re


def format_episode_id(episode_id: str):
    episode_id = episode_id.upper()
    # remove leading zeros after 'E' if the number after is greater than 9
    episode_id = re.sub(r'(?<=E)0+(?=\d{2,})', '', episode_id)
    return episode_id


def compute_progress(runtime, timestamp):
    start = timestamp.split(' - ')[0]
    end = timestamp.split(' - ')[1]
    start_seconds = convert_stamp_to_seconds(start)
    end_seconds = convert_stamp_to_seconds(end)
    runtime_seconds = runtime * 60
    progress_start = (start_seconds / runtime_seconds) * 100
    progress_end = (end_seconds / runtime_seconds) * 100
    # make sure progress_end is always greater than progress_start and within 0-100
    progress_end = progress_end if progress_start - progress_end > 0 else progress_end + 1
    return [max(0, int(progress_start)), min(100, int(progress_end))]


def combine_parts(query_result, title, episode_id, embedded_query, timestamp=None):
    query_result.sort(key=lambda x: x['part'] if x['part'] is not None else 0)

    combined_text = []
    embeddings = []
    for k in query_result:
        if k['title'] == title and k['episodeid'] == episode_id and (timestamp is None or k['timestamp'] == timestamp):
            combined_text.append(k['plaintext'] + " ")
            embeddings.append(eval(k['embedding']))
    try:
        similarities = [compute_cosine_similarity(embed, embedded_query) for embed in embeddings]
    except (SyntaxError, TypeError):
        similarities = [1 / (i + 1) for i in range(len(embeddings))]
    highest_index = similarities.index(max(similarities))
    best_match = combined_text[highest_index] if combined_text[highest_index] else None
    combined_text = " ".join(combined_text)

    return combined_text, best_match, similarities


def combine_multi_part_query(query_result: list, embedded_query, type=None) -> list:
    combined = []
    c = 1
    if not any(q[-1] is not None for q in query_result):
        # eval q[-2] to make sure it's always of the correct datatype
        query_formatted = []
        for result in query_result:
            try:
                similarity = compute_cosine_similarity(eval(result['embedding']), embedded_query)
            except (SyntaxError, TypeError):
                similarity = 1 / c
            computed = {**result, 'similarity': [similarity], 'best_match': None}
            query_formatted.append(computed)
            c += 1
        return query_formatted

    c = 1
    if type == 'conversation':
        for q in query_result:
            if q['part'] is None:
                try:
                    similarity = compute_cosine_similarity(eval(q['embedding']), embedded_query)
                except (SyntaxError, TypeError):
                    similarity = 1 / c
                combined.append({**q, 'similarity': [similarity], 'best_match': None})

            elif q['part'] == 0:
                combined_text, best_match, similarities = combine_parts(query_result, q['title'], q['episodeid'],
                                                                        embedded_query, q['timestamp'])
                combined.append({**q, 'similarity': similarities, 'best_match': best_match})

            c += 1

    elif type == 'description':
        #                     title, episode_id, text, ep_title, best_match, embeddings, _ = result

        for q in query_result:
            if q['part'] is None:
                try:
                    similarity = compute_cosine_similarity(eval(q['embedding']), embedded_query)
                except (SyntaxError, TypeError):
                    similarity = 1 / c
                combined.append({**q, 'similarity': [similarity], 'best_match': None})

            else:
                combined_text, best_match, similarities = combine_parts(query_result, q['title'],
                                                                        q['episodeid'], embedded_query)
                combined.append({**q, 'similarity': similarities, 'best_match': best_match})

            c += 1
    return combined


def query_db(query: str, show: str = None, table: str = None,
             language: str = None, season=None, type='both', offset=0, fts=False, conn=None):

    conn = conn if conn else dbf.get_conn()

    # if full text search, don't encode the query
    encoded_query = query if fts else encode_text(query)[1][0]

    general_data = [conn, encoded_query, show, table]

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


def subtitle_query(conn, query: np.ndarray | str, show: str = None,
                   table: str = None, language: str = 'English', limit=5, offset=0, season=None):
    # if query is a string, it's a full text search
    if isinstance(query, str):
        results_sub = dbf.query_subtitle_fts(conn, query, show, table, language, limit, offset, season)
    else:
        results_sub = dbf.query_subtitle(conn, query, show, table, language, limit, offset, season)

    results_sub = combine_multi_part_query(results_sub, query, 'conversation')
    results = {}
    for idx, result in enumerate(results_sub):
        # idea: maybe retrieve file path of image from here and send it to frontend
        image_uuid = map_image(result['title'], result['episodeid'], table)
        similarity = max(result['similarity'])
        offset = int(offset)
        progress = compute_progress(result['runtime'], result['timestamp'])
        results[idx + offset] = {'title': result['title'],
                                 'episodeId': format_episode_id(result['episodeid']),
                                 'timestamp': result['timestamp'],
                                 'text': result['plaintext'],
                                 'exactMatch': result['best_match'],
                                 'episodeTitle': result['episodetitle'],
                                 'similarity': similarity,
                                 'type': 'conversation',
                                 'imageId': image_uuid,
                                 'progress': progress}
    return results


def description_query(conn, query: np.ndarray | str, show: str = None,
                      table: str = None, ex=0, limit=5, offset=0, season=None, language=None):

    if isinstance(query, str):
        results_desc = dbf.query_description_fts(conn, query, show, language, table, limit, offset, season)
    else:
        results_desc = dbf.query_description(conn, query, show, table, limit, offset, season)

    results_desc = combine_multi_part_query(results_desc, query, 'description')
    results = {}
    for idx, result in enumerate(results_desc):
        image_uuid = map_image(result['title'], result['episodeid'], table)
        similarity = max(result['similarity'])
        offset = int(offset)
        results[idx + ex + offset] = {'title': result['title'],
                                      'episodeId': format_episode_id(result['episodeid']),
                                      'text': result['plaintext'],
                                      'exactMatch': result['best_match'],
                                      'episodeTitle': result['episodetitle'],
                                      'similarity': similarity,
                                      'type': 'description',
                                      'imageId': image_uuid,
                                      'progress': None}
    return results
