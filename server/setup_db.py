import os

import backend.database_functions as dbf
import backend.retrieve_embeddings as ret

convert_dirs = {
    "TV Shows": "TVShows",
    "Animes": "Animes",
    "Movies": "Movies",
    "Anime": "Animes",
    "TV Show": "TVShows",
    "Movie": "Movies",
}


def add_media_to_db(conn, path: str, table_name):
    # table_name here is already converted to the correct table name
    # get all descriptions and subtitle texts from video files
    descriptions, subtitles = ret.retrieve_media(path, table_name)
    for desc_id, data in descriptions.items():
        dbf.insert_into_table(conn, table_name, "descriptions", data)

    # add subtitles to db
    for sub_id, data in subtitles.items():
        dbf.insert_into_table(conn, table_name, "subtitles", data)
    print("... complete")


def fill_database():
    conn = dbf.get_conn()
    dbf.init_db(conn)
    # go through all shows in the TV Shows directory and add them to the database
    dir_types = os.listdir("/media")
    for dir_type in dir_types:
        if dir_type not in convert_dirs:
            continue
        print("Looking at directory", dir_type, "...")
        existing_media, _ = dbf.get_existing_media(convert_dirs[dir_type], conn)
        existing_media = set([media[0] for media in existing_media])
        dirs = os.listdir(f"/media/{dir_type}")
        c = 0
        for show in dirs:
            c += 1
            if show in existing_media:
                continue
            print(f"[{c}/{len(dirs)}] {show}:", end=" ")

            media_path = os.path.join(f"/media/{dir_type}", show)
            add_media_to_db(conn, media_path, convert_dirs[dir_type])

        for show in existing_media:
            # remove media that are not in the directory anymore
            if show not in dirs:
                print(f"Removing {show} from database")
                dbf.remove_from_tables(conn, convert_dirs[dir_type], show)


if __name__ == '__main__':
    print("Starting to fill database...")
    fill_database()
    print("Database filled")
