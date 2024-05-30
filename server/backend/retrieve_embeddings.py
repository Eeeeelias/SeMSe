import os
import re
import numpy as np
from sentence_transformers import SentenceTransformer
from backend.format_subtitles import extract_subtitles, format_subtitles, subtitle_information, WANTED_LANGUAGES
from uuid import uuid4


if WANTED_LANGUAGES == ["English"]:
    model = SentenceTransformer("all-MiniLM-L6-v2")
    MAX_TOKENS = 256
else:
    model = SentenceTransformer("paraphrase-multilingual-mpnet-base-v2")
    MAX_TOKENS = 128


def compute_cosine_similarity(u: np.ndarray, v: np.ndarray) -> float:
    """Compute the cosine similarity between two vectors"""
    return (u @ v) / (np.linalg.norm(u) * np.linalg.norm(v))


def find_end(description_part):
    # given a description part of no more than 150 words, find the last sentence ending character within 50 characters
    for i in range(len(description_part) - 1, max(len(description_part) - 50, 0), -1):
        if description_part[i] in ['.', '!', '?']:
            return i

    # if no sentence ending character is found, look for a comma
    for i in range(len(description_part) - 1, max(len(description_part) - 50, 0), -1):
        if description_part[i] == ',':
            return i

    return len(description_part) // 2


def split_description(description):
    if len(model.tokenize([description])['input_ids'][0]) < MAX_TOKENS:
        return [description]
    desc_splits = description.split(" ")
    check_parts = (len(desc_splits) // 150) + 1
    if check_parts == 1:
        return [description]

    description_parts = []
    split_idx = 0
    global_end = 0
    for _ in range(check_parts):
        # join the split_idx : i + 150 words
        split_text = " ".join(desc_splits[split_idx: split_idx + 150])

        end = find_end(split_text)
        # find the correct location in the split text to continue from
        split_idx = len(description[:global_end + end].split(" "))

        # plus one to include the sentence ending character
        description_parts.append(split_text[:end + 1])
        global_end += end + 1
    return description_parts


def encode_text(description) -> tuple[list, list[np.ndarray]]:
    # tokenize and encode the description
    description_parts = split_description(description)
    return description_parts, [model.encode(part) for part in description_parts]


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
    try:
        # get the <title> tag
        title = data.split("<title>")[1].split("</title>")[0]
    except IndexError:
        title = ''
    try:
        # get the <runtime> tag
        runtime = data.split("<runtime>")[1].split("</runtime>")[0]
    except IndexError:
        runtime = '0'
    return {str(uuid4()): {"episode_id": episode_id, "description": plot, "episode_title": title, "runtime": runtime}}


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

            # get the number of words in the subtitles as well as the last timestamp
            word_length = len(" ".join([x['plain_text'] for x in formatted_subs_episode.values()]).split(" "))
            episode_length = max([x['end'] for x in formatted_subs_episode.values()])
            episode_length = int(episode_length.split(":")[0]) * 60 + int(episode_length.split(":")[1])
            try:
                if word_length / episode_length > 200:
                    print(f"Subtitles for {os.path.basename(file)} are likely broken, skipping")
                    continue
            except ZeroDivisionError:
                print(f"Episode length is 0 for {os.path.basename(file)}, skipping")
                continue

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
    movie = True if table_name == "Movies" else False
    descriptions, subtitles = extract_raw_info(path, movie=movie)
    show_title = os.path.basename(path)
    episode_titles = {}
    if movie:
        # replace all episode ids with empty string
        for key in descriptions.keys():
            descriptions[key]['episode_id'] = ""
        for key in subtitles.keys():
            subtitles[key]['episode_id'] = ""
    else:
        # make a dictionary of episode_id with associated title in the descriptions to use later
        episode_titles = {descriptions[key]['episode_id']: descriptions[key]['episode_title']
                          for key in descriptions.keys()}

    num_langs = len(set([subtitles[key]['language'] for key in subtitles.keys()]))
    print(f"Found {len(descriptions)} descriptions and {len(subtitles)} conversations "
          f"in {num_langs} language(s)", end=" ")
    # add descriptions to db
    desc_embeddings = {}
    sub_embeddings = {}
    for idx, key in enumerate(descriptions.keys()):
        text_parts, encoded_text = encode_text(descriptions[key].get('description'))
        if len(encoded_text) > 1:
            for i, text in enumerate(encoded_text):
                desc_embeddings[f"{idx}_{i}"] = {'title': show_title, 'episode_id': descriptions[key].get('episode_id'),
                                                 'plain_text': text_parts[i],
                                                 'episode_title': episode_titles.get(descriptions[key].get('episode_id'), ""),
                                                 'embedding': text, 'part': i}
        else:
            desc_embeddings[idx] = {'title': show_title, 'episode_id': descriptions[key].get('episode_id'),
                                    'plain_text': descriptions[key].get('description'),
                                    'episode_title': episode_titles.get(descriptions[key].get('episode_id'), ""),
                                    'embedding': encoded_text[0], 'part': None}

    for idx, key in enumerate(subtitles.keys()):
        text_parts, encoded_text = encode_text(subtitles[key]['plain_text'])
        if len(encoded_text) > 1:
            for i, text in enumerate(encoded_text):
                sub_embeddings[f"{idx}_{i}"] = {'title': show_title,
                                                'episode_id': subtitles[key].get('episode_id'),
                                                'timestamp': f"{subtitles[key]['start']} - {subtitles[key]['end']}",
                                                'plain_text': text_parts[i],
                                                'episode_title': episode_titles.get(subtitles[key].get('episode_id'), ""),
                                                'language': subtitles[key].get('language'),
                                                'embedding': text,
                                                'part': i,
                                                'runtime:': episode_titles.get(subtitles[key].get('runtime', '0'), "0")}
        else:
            sub_embeddings[idx] = {'title': show_title, 'episode_id': subtitles[key].get('episode_id'),
                                   'timestamp': f"{subtitles[key]['start']} - {subtitles[key]['end']}",
                                   'plain_text': subtitles[key].get('plain_text'),
                                   'episode_title': episode_titles.get(subtitles[key].get('episode_id'), ""),
                                   'language': subtitles[key].get('language'),
                                   'embedding': encoded_text[0],
                                   'part': None,
                                   'runtime:': episode_titles.get(subtitles[key].get('runtime', '0'), "0")}

    return desc_embeddings, sub_embeddings
