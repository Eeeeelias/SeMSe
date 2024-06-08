# this is supposed to add a title column to the existing db and populate it with the titles corresponding to each entry
import os.path
import tqdm
import psycopg2
from psycopg2.extras import DictCursor


# change the connection string to match your db
conn = psycopg2.connect("dbname=postgres user=postgres password=secret host=192.168.192.2 port=5432")


def add_title_column():
    cur = conn.cursor()
    cur.execute("ALTER TABLE descriptions ADD COLUMN episodeTitle VARCHAR(255)")
    cur.execute("ALTER TABLE subtitles ADD COLUMN episodeTitle VARCHAR(255)")
    conn.commit()


def add_runtime_column():
    cur = conn.cursor()
    cur.execute("ALTER TABLE subtitles ADD COLUMN runtime INT")
    conn.commit()


def fetch_titles(table_name, media_id):
    cur = conn.cursor()
    table_id = table_name[:-1]
    cur.execute(f"""
    SELECT title FROM %s
    WHERE {table_id}id = %s
    """ % (table_name, media_id))
    rows = cur.fetchone()
    return rows


def get_file_path(table_name, title, episode_id):
    base_path = "/mnt/MediaFiles/MediaFiles/"
    if table_name == "animes":
        base_path += "Anime/"
    elif table_name == "tvshows":
        base_path += "TV Shows/"
    else:
        base_path += "Movies/"
    show_name = title

    # take care of movies here
    if table_name == "movies":
        for file in os.listdir(base_path + show_name):
            if file.find(title) != -1 and any([x in file for x in [".mkv", ".mp4", ".avi"]]):
                return base_path + show_name + "/" + file
        return

    season = int(episode_id.upper().split("E")[0].split("S")[1])
    season_name = f"Season {season}"
    if not os.path.isdir(base_path + show_name + "/" + season_name):
        season_name = f"Season 0{season}"
        if not os.path.isdir(base_path + show_name + "/" + season_name):
            print(f"Season not found for {show_name}")
            return
    # find filename that contains the episode id
    for file in os.listdir(base_path + show_name + "/" + season_name):
        if file.find(episode_id) != -1 and any([x in file for x in [".mkv", ".mp4", ".avi"]]):
            return base_path + show_name + "/" + season_name + "/" + file
    print("File not found for ", show_name, episode_id)
    return


def get_tag(file_path, tag="title"):
    info_file = file_path[:-4] + ".nfo"
    if not os.path.isfile(info_file):
        info_file = "/".join(info_file.split("/")[:-1]) + "/movie.nfo"
        if not os.path.isfile(info_file):
            print("Info file not found for ", file_path)
            return
    with open(info_file, 'r') as file:
        data = file.read()
    try:
        # get the <{tag}> tag
        found_tag = data.split(f"<{tag}>")[1].split(f"</{tag}>")[0]
    except IndexError:
        found_tag = ''
    return found_tag


def populate_new_column(tag="title", column="episodeTitle", tables=("descriptions", "subtitles")):
    cur = conn.cursor(cursor_factory=DictCursor)
    cur.execute("SELECT DISTINCT episodeid, movieid, animeid, tvshowid FROM subtitles")
    rows = cur.fetchall()
    cur.execute(f"SELECT DISTINCT {column}, episodeid, movieid, animeid, tvshowid FROM subtitles")
    existing_rows = cur.fetchall()
    print("Found ", len(existing_rows), " existing rows.")
    for row in tqdm.tqdm(rows, desc=f"Populating {tag}s", unit="episodes"):
        if not any([row[1], row[2], row[3]]):
            continue

        if row['animeid']:
            table_name = "animes"
            id_type = "anime"
            id_value = row['animeid']
        elif row['tvshowid']:
            table_name = "tvshows"
            id_type = "tvshow"
            id_value = row['tvshowid']
        else:
            table_name = "movies"
            id_type = "movie"
            id_value = row['movieid']

        # check if the episodeid + id_value already have a value in the column
        if any([x['episodeid'] == row['episodeid'] and x['movieid'] == row['movieid'] and x['animeid'] == row['animeid']
                and x['tvshowid'] == row['tvshowid'] and isinstance(x[column], int) and x[column] > 0 for x in existing_rows]):
            continue

        show_title = fetch_titles(table_name, id_value)[0]
        file_path = get_file_path(table_name, show_title, row['episodeid'])

        if not file_path:
            continue
        title = get_tag(file_path, tag)
        if not title:
            continue

        if "descriptions" in tables:
            sql = f"UPDATE descriptions SET {column} = %s WHERE episodeid = %s AND {id_type}id = %s"
            cur.execute(sql, (title, row[0], id_value))
        elif "subtitles" in tables:
            sql_sub = f"UPDATE subtitles SET {column} = %s WHERE episodeid = %s AND {id_type}id = %s"
            cur.execute(sql_sub, (title, row[0], id_value))
        else:
            print("No table to update")
    conn.commit()


def populate_runtime_column():
    cur = conn.cursor()
    cur.execute("SELECT episodeid, animeid, tvshowid FROM descriptions")
    rows = cur.fetchall()
    for row in rows:
        if not row[1] and not row[2]:
            continue


if __name__ == '__main__':
    # add_runtime_column()
    populate_new_column(tag="runtime", column="runtime", tables=("subtitles",))
    conn.close()
