import os
import struct
import array
import timeit

from PIL import Image
import io
import psycopg2
from sentence_transformers import SentenceTransformer
from backend.user_query import query_db
from backend.retrieve_embeddings import retrieve_subtitles, encode_text

def read_bif(bif_file):
    with open(bif_file, 'rb') as f:
        # Read magic number
        magic_number = array.array('B', f.read(8))
        if magic_number != array.array('B', [0x89, 0x42, 0x49, 0x46, 0x0d, 0x0a, 0x1a, 0x0a]):
            raise ValueError("Invalid BIF file format")

        # Read version
        version = struct.unpack('<I', f.read(4))[0]

        # Read number of images
        num_images = struct.unpack('<I', f.read(4))[0]

        # Read interval between images
        interval = struct.unpack('<I', f.read(4))[0] / 1000

        # Skip 44 bytes
        f.seek(44, os.SEEK_CUR)

        image_offsets = []
        for _ in range(num_images):
            # Read image index and data offset
            index, offset = struct.unpack('<II', f.read(8))
            image_offsets.append((index, offset))

        # Read end marker
        end_marker = struct.unpack('<I', f.read(4))[0]

        if end_marker != 0xffffffff:
            raise ValueError("Invalid end marker in BIF file")

        # Read total size
        total_size = struct.unpack('<I', f.read(4))[0]

        # Read image data
        images = []
        for index, offset in image_offsets:
            f.seek(offset)
            try:
                image_data = f.read(image_offsets[index + 1][1] - offset)
                images.append(image_data)
            except IndexError:
                image_data = f.read(total_size - offset)
                images.append(image_data)

        return {
            'version': version,
            'num_images': num_images,
            'interval': interval,
            'images': images
        }


def save_images_from_bif(bif_data, output_directory):
    if not os.path.exists(output_directory):
        os.makedirs(output_directory)

    for i, image_data in enumerate(bif_data['images']):
        image = Image.open(io.BytesIO(image_data))
        image_path = os.path.join(output_directory, f"image_{i}.jpg")
        image.save(image_path)
        print(f"Saved image {i + 1}/{bif_data['num_images']} as {image_path}")


# Example usage
bif_file = '/mnt/MediaFiles/MediaFiles/TV Shows/Arcane/Season 01/trickplay/Arcane S01E01-320.bif'

# connect to db
conn = psycopg2.connect(
    host="192.168.0.2",
    database="postgres",
    user="postgres",
    password="secret"
)


query = "So, Rin-chan, let's cross all the bridges  we see along the way to Lake Hatanagi. Okay."
query = query_db(query, show='Yuru Camp', table='Animes', type='conversation', conn=conn)

for q, v in query.items():
    print(q, v)
