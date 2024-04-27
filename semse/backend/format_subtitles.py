# extract subtitles from video file if there are any (text-based subtitles only)
import json
import os
from uuid import uuid4
import subprocess
import re
import srt
import iso639
from dotenv import load_dotenv

load_dotenv()
try:
    WANTED_LANGUAGES = os.getenv("LANGUAGES").split(",")
except AttributeError:
    WANTED_LANGUAGES = ["en", "de"]
WANTED_LANGUAGES = [iso639.to_name(key) for key in WANTED_LANGUAGES]


def convert_stamp_to_seconds(time: str):
    time = time.split(":")
    hours = int(time[0])
    minutes = int(time[1])
    seconds = float(time[2].replace(",", "."))
    return (hours * 3600) + (minutes * 60) + seconds


def convert_seconds_to_stamp(seconds: float):
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    seconds = seconds % 60
    return f"{hours:02d}:{minutes:02d}:{seconds:.3f}".replace(".", ",")


def subtitle_information(input_file):
    if os.path.splitext(input_file)[1] == ".srt":
        # get the language of the subtitle based on the file name
        try:
            language = os.path.basename(input_file).split(".")[-2]
        except IndexError:
            language = "unknown"
        if len(language) == 2 or len(language) == 3:
            try:
                language = iso639.to_name(language)
            except KeyError:
                print(f"Found unknown language code {language}, skipping subtitle stream.")
                language = "unknown"
        else:
            language = "unknown"
        if language not in WANTED_LANGUAGES:
            return None
        return {0: {'language': language}}

    # extract subtitle information from video file using ffprobe
    # support text based subtitles only
    supported_subtitle_codecs = ['ass', 'srt', 'hdmv_pgs_subtitle', 'subrip']
    excluded_titles = ['Signs & Songs', 'Signs/Songs', 'Forced']

    command = f"ffprobe -hide_banner -loglevel panic -print_format json -show_streams -select_streams s \"{input_file}\""
    result = subprocess.run(command, shell=True, stdout=subprocess.PIPE)
    if result.returncode != 0:
        return None
    subtitle_streams = json.loads(result.stdout)["streams"]
    if not subtitle_streams:
        return None
    sub_info = {}
    for idx, stream in enumerate(subtitle_streams):
        stream_index = idx  # the stream_index tag in the stream object is the abs. stream_index but we need relative
        title = stream.get("tags", {}).get("title")

        # if codec can't be transcoded to srt we don't need to look at it
        if stream.get('codec_name') not in supported_subtitle_codecs:
            continue
        # skip subtitles that are not actual conversation
        if title and any(term in title for term in excluded_titles):
            continue

        language = stream.get("tags", {}).get("language", "unknown")
        if len(language) == 2 or len(language) == 3:
            try:
                language = iso639.to_name(language)
            except Exception as e:
                print(f"Found unknown language code {language}, skipping subtitle stream.")
                language = "unknown"
        else:
            language = "unknown"
        # check if the language is in the wanted languages or if we already have it
        if language not in WANTED_LANGUAGES or len([x for x in sub_info.values() if x['language'] == language]) > 0:
            continue
        sub_info[stream_index] = {'language': language}
    return sub_info


def extract_subtitles(video_file, process_path, index=None):
    # check if srt file exists, add it to the subtitles dict
    # srt_file = os.path.join(root, os.path.splitext(file)[0] + ".srt")
    if os.path.splitext(video_file)[1] == ".srt":
        try:
            with open(video_file, 'r', encoding='utf-8') as file:
                subtitles = file.read()
            return subtitles
        except UnicodeDecodeError:
            with open(video_file, 'r', encoding='latin-1') as file:
                subtitles = file.read()
        return subtitles

    # extract subtitles from video file
    sub_name = str(uuid4())
    command = f"ffmpeg -hide_banner -loglevel panic -i \"{video_file}\" -map 0:s:{index} -c:s srt -f srt -y {process_path}{sub_name}.srt"
    subprocess.run(command, shell=True)
    if os.path.exists(f"{process_path}{sub_name}.srt"):
        with open(f"{process_path}{sub_name}.srt", "r", encoding='utf-8') as file:
            subtitles = file.read()
        os.remove(f"{process_path}{sub_name}.srt")
        return subtitles
    return None


def format_subtitles(subs):
    subtitles = list(srt.parse(subs))
    formatted_subtitles = {}
    conversation_text = ""
    conversation_start = subtitles[0].start.total_seconds()
    prev_end_time = None
    for sub in subtitles:
        if prev_end_time is not None:
            time_diff = (sub.start - prev_end_time).total_seconds()

            if time_diff < 3:
                conversation_text += " " + sub.content
            else:
                conversation_id = str(uuid4())
                conversation_text = re.sub(r"<.*?>", "", conversation_text)
                conversation_text = re.sub(r"{\\+an8}", "", conversation_text)
                formatted_subtitles[conversation_id] = {'start': convert_seconds_to_stamp(conversation_start),
                                                        'end': convert_seconds_to_stamp(prev_end_time.total_seconds()),
                                                        'plain_text': conversation_text}
                conversation_start = sub.start.total_seconds()
                conversation_text = sub.content

        else:
            conversation_text += sub.content

        prev_end_time = sub.end

    # save the last conversation
    if conversation_text:
        conversation_id = str(uuid4())
        conversation_text = re.sub(r"<.*?>", "", conversation_text)
        formatted_subtitles[conversation_id] = {'start': convert_seconds_to_stamp(conversation_start),
                                                'end': convert_seconds_to_stamp(prev_end_time.total_seconds()),
                                                'plain_text': conversation_text}
    return formatted_subtitles

