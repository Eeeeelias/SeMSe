# go through all movies and check how many of them have subtitles
import os
import glob

movie_path = "/mnt/MediaFiles/MediaFiles/Movies"

external_subs = 0
internal_subs = 0
for movie in glob.glob(movie_path + "/**/*.mkv", recursive=True) + glob.glob(movie_path + "/**/*.mp4", recursive=True):
    if os.path.exists(movie.replace(".mkv", ".srt").replace(".mkv", ".srt")):
        external_subs += 1
    # get output of ffprobe
    command = f"ffprobe -v error -show_entries stream=index,codec_name:stream_tags=language -of default=noprint_wrappers=1:nokey=1 \"{movie}\""
    output = os.popen(command).read()
    streams = iter(output)
    for line in streams:
        if line.strip().isdigit():
            stream_num = int(line.strip())
            codec = next(streams).strip()
            language = next(streams).strip()
            if not language.isdigit():
                pass
    if "subrip" in output or "ass" in output:
        internal_subs += 1

print(f"Found {external_subs} movies with external subtitles")
print(f"Found {internal_subs} movies with internal subtitles")