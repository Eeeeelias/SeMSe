# This should handle user queries and return the appropriate response
from backend.retrieve_embeddings import encode_text, compute_cosine_similarity
from backend import database_functions as dbf


def query_db(query: str, show: str = None):
    conn = dbf.get_conn()
    query = encode_text(query)
    results_sub = dbf.query_subtitle(conn, query, show)
    results_desc = dbf.query_description(conn, query, show)
    # calculate the cosine similarities for all results
    results = []
    for result in results_sub:
        result = list(result)
        result.append(compute_cosine_similarity(query, eval(result[-1])))
        # reverse the order of the tuple so that the cosine similarity is the first element
        # show_name, episode_id, timestamp, plain_text, embedding
        result = [result[-1], result[0], result[1], result[2], result[3]]
        results.append(result)
    for result in results_desc:
        result = list(result)
        result.append(compute_cosine_similarity(query, eval(result[-1])))
        # reverse the order of the tuple so that the cosine similarity is the first element
        result = [result[-1], result[0], result[1], result[2], result[3], result[4]]
        results.append(result)
    # sort the results by cosine similarity
    return sorted(results, key=lambda x: x[0], reverse=True)
