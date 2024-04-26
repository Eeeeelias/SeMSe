import os
import re
import numpy as np
from sentence_transformers import SentenceTransformer
from backend.format_subtitles import extract_subtitles, format_subtitles, subtitle_information
from uuid import uuid4

model = SentenceTransformer("paraphrase-multilingual-mpnet-base-v2")


def compute_cosine_similarity(u: np.ndarray, v: np.ndarray) -> float:
    """Compute the cosine similarity between two vectors"""
    return (u @ v) / (np.linalg.norm(u) * np.linalg.norm(v))


def encode_text(description) -> np.ndarray:
    return model.encode(description)


def retrieve_description(root, file, movie=False) -> dict | None:
    # immediately return if the file is irrelevant
    irrelevant = ['season.nfo', 'tvshow.nfo']
    if os.path.basename(file) in irrelevant:
        return None

    with open(os.path.join(root, file), "r", encoding='utf-8') as f:
        data = f.read()
    try:
        # get the episode id SxxExx
        episode_id = re.match(r".* ([sS]\d+[eE]\d+).*", os.path.basename(file)).group(1)
    except AttributeError:
        if not movie:
            print(f"No episode id found for {os.path.basename(file)}, using S01E01 as default")
        episode_id = "S01E01"
    try:
        # get the <plot> tag
        plot = data.split("<plot>")[1].split("</plot>")[0]
    except IndexError:
        return None
    return {str(uuid4()): {"episode_id": episode_id, "description": plot}}


def retrieve_subtitles(root, file, movie=False):
    # get episode id
    try:
        episode_id = re.match(r".* ([sS]\d+[eE]\d+).*", os.path.basename(file)).group(1)
    except AttributeError:
        if not movie:
            print(f"No episode id found for {os.path.basename(file)}, using S01E01 as default")
        episode_id = "S01E01"

    video_file = os.path.join(root, file)
    sub_info = subtitle_information(video_file)
    formatted_subs = {}

    if not sub_info:
        return None

    for lang_sub in sub_info:
        subs = extract_subtitles(video_file, "/tmp/", index=lang_sub)
        if subs:
            formatted_subs_episode = format_subtitles(subs)
            for sub in formatted_subs_episode:
                formatted_subs_episode[sub]['episode_id'] = episode_id
                formatted_subs_episode[sub]['language'] = sub_info[lang_sub]['language']
            formatted_subs.update(formatted_subs_episode)
    return formatted_subs


def extract_raw_info(path, movie=False):
    descriptions = {}
    subtitles = {}
    for root, dirs, files in os.walk(path):
        for file in files:
            if file.endswith(".nfo"):
                description = retrieve_description(root, file, movie=movie)
                if description:
                    descriptions.update(description)
            if file.endswith(".mkv") or file.endswith(".mp4") or file.endswith(".srt"):
                subs = retrieve_subtitles(root, file, movie=movie)
                if subs:
                    subtitles.update(subs)
    return descriptions, subtitles


def retrieve_media(path, table_name) -> (dict, dict):
    movie = True if table_name == "Movie" else False
    descriptions, subtitles = extract_raw_info(path, movie=movie)
    show_title = os.path.basename(path)
    if movie:
        # replace all episode ids with empty string
        for key in descriptions.keys():
            descriptions[key]['episode_id'] = ""
        for key in subtitles.keys():
            subtitles[key]['episode_id'] = ""

    num_langs = len(set([subtitles[key]['language'] for key in subtitles.keys()]))
    print(f"Found {len(descriptions)} descriptions and {len(subtitles)} conversations "
          f"in {num_langs} language(s)", end=" ")
    # add descriptions to db
    desc_embeddigns = {idx: {'title': show_title, 'episode_id': descriptions[key]['episode_id'],
                             'plain_text': descriptions[key]['description'],
                             'embedding': encode_text(descriptions[key]['description'])}
                       for idx, key in enumerate(descriptions.keys())}

    sub_embeddings = {idx: {'title': show_title,
                            'episode_id': subtitles[key]['episode_id'],
                            'timestamp': f"{subtitles[key]['start']} - {subtitles[key]['end']}",
                            'plain_text': subtitles[key]['plain_text'],
                            'language': subtitles[key]['language'],
                            'embedding': encode_text(subtitles[key]['plain_text'])}
                      for idx, key in enumerate(subtitles.keys())}

    return desc_embeddigns, sub_embeddings
