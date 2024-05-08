import os
import io
import psycopg2
from PIL import Image as PILImage

from backend.database_functions import query_images, get_conn, insert_into_images

LIBRARY_MAP = {
    "Animes": "Anime",
    "TVShows": "TV Shows",
    "Movies": "Movies"
}

BASE_PATH = "media"
# BASE_PATH = "mnt/MediaFiles/MediaFiles"


def find_image_path(title: str, episode_id: str, library: str) -> str | None:
    season_number = episode_id.split("E")[0][2:3]
    path = f"/{BASE_PATH}/{LIBRARY_MAP[library]}/{title}/Season {season_number}/"
    # if there is a leading zero
    if not os.path.isdir(path):
        season_number = season_number.zfill(2)
        path = f"/{BASE_PATH}/{LIBRARY_MAP[library]}/{title}/Season {season_number}/"
        if not os.path.isdir(path):
            print("Season not found")
            return None

    # find the correct episode in either the folder itself or any subfolder
    for root, dirs, files in os.walk(path):
        for file in files:
            if episode_id in file and file.endswith((".jpg", ".png")):
                return os.path.join(root, file)
    print("Episode not found")
    return None


def map_image(title: str, episode_id: str, library: str, conn: psycopg2.connect = None) -> str | None:
    image_path = find_image_path(title, episode_id, library)
    if image_path is None:
        return None
    if not conn:
        conn = get_conn()
    potential_uuid = query_images(conn, file_path=image_path)
    if potential_uuid:
        return potential_uuid[0]
    else:
        true_uuid = insert_into_images(conn, image_path)

    return true_uuid


def convert_image(image_path, width=300) -> io.BytesIO:
    with open(image_path, 'rb') as image_file:
        image = PILImage.open(image_file)

        # scale image to width px while maintaining aspect ratio
        w_percent = (float(width) / float(image.size[0]))
        h_size = int((float(image.size[1]) * float(w_percent)))
        image = image.resize((int(width), h_size))

        # Convert the image to bytes in memory
        image_buffer = io.BytesIO()
        image.save(image_buffer, format='JPEG')
        image_buffer.seek(0)
    return image_buffer
