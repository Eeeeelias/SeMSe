# this is supposed to add a title column to the existing db and populate it with the titles corresponding to each entry
import os.path
import tqdm
import psycopg2

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
    else:
        base_path += "TV Shows/"
    show_name = title
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
    cur = conn.cursor()
    cur.execute("SELECT episodeid, animeid, tvshowid FROM descriptions")
    rows = cur.fetchall()
    for row in tqdm.tqdm(rows, desc=f"Populating {tag}s", unit="episodes"):
        if not row[1] and not row[2]:
            continue
        table_name = "animes" if row[1] else "tvshows"
        id_type = "anime" if row[1] else "tvshow"
        id_value = row[1] if row[1] else row[2]
        show_title = fetch_titles(table_name, row[1] if row[1] else row[2])[0]
        file_path = get_file_path(table_name, show_title, row[0])

        if not file_path:
            continue
        title = get_tag(file_path, tag)
        if not title:
            continue

        if "descriptions" in tables:
            sql = f"UPDATE descriptions SET {column} = %s WHERE episodeid = %s AND {id_type}id = %s"
            cur.execute(sql, (title, row[0], id_value))
        if "subtitles" in tables:
            sql_sub = f"UPDATE subtitles SET {column} = %s WHERE episodeid = %s AND {id_type}id = %s"
            cur.execute(sql_sub, (title, row[0], id_value))
    conn.commit()


def populate_runtime_column():
    cur = conn.cursor()
    cur.execute("SELECT episodeid, animeid, tvshowid FROM descriptions")
    rows = cur.fetchall()
    for row in rows:
        if not row[1] and not row[2]:
            continue


if __name__ == '__main__':
    add_runtime_column()
    populate_new_column(tag="runtime", column="runtime", tables=("subtitles",))
    conn.close()
