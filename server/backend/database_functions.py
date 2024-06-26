from uuid import uuid4
import numpy as np
import psycopg2
from psycopg2.extras import DictCursor
import os
from dotenv import load_dotenv
from backend.retrieve_embeddings import WANTED_LANGUAGES

load_dotenv()


# connect to postgres
def get_conn():
    conn = psycopg2.connect(
        host="semse-db",
        database="postgres",
        user=os.getenv('POSTGRES_USER'),
        password=os.getenv('POSTGRES_PASSWORD'),
        port=5432
    )
    return conn


def init_db(conn):
    enable_extension(conn, "vectors")
    enable_extension(conn, "pg_trgm")
    create_tables(conn)
    print("Database initialized successfully")


def enable_extension(conn, extension):
    with conn.cursor() as cursor:
        cursor.execute(f"CREATE EXTENSION IF NOT EXISTS {extension}")
    conn.commit()


def create_tables(conn):
    if WANTED_LANGUAGES == ["English"]:
        vector_length = 384
    else:
        vector_length = 768
    with conn.cursor() as cursor:
        cursor.execute(
            f"""
            CREATE TABLE IF NOT EXISTS TVShows(
            TVShowID SERIAL PRIMARY KEY,
            Title VARCHAR(255) NOT NULL
            );
            
            CREATE TABLE IF NOT EXISTS Animes (
                AnimeID SERIAL PRIMARY KEY,
                Title VARCHAR(255) NOT NULL
            );
            
            CREATE TABLE IF NOT EXISTS Movies (
                MovieID SERIAL PRIMARY KEY,
                Title VARCHAR(255) NOT NULL
            );
            
            CREATE TABLE IF NOT EXISTS Descriptions (
            DescriptionID SERIAL PRIMARY KEY,
            EpisodeID VARCHAR(255),
            PlainText TEXT NOT NULL,
            EpisodeTitle VARCHAR(255),
            Embedding vector({vector_length}) NOT NULL,
            Part INT,
            TVShowID INT,
            AnimeID INT,
            MovieID INT,
            FOREIGN KEY (TVShowID) REFERENCES TVShows(TVShowID) ON DELETE CASCADE,
            FOREIGN KEY (AnimeID) REFERENCES Animes(AnimeID) ON DELETE CASCADE,
            FOREIGN KEY (MovieID) REFERENCES Movies(MovieID) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS Subtitles (
            SubtitleID SERIAL PRIMARY KEY,
            EpisodeID VARCHAR(255),
            Language VARCHAR(255) NOT NULL,
            Timestamp VARCHAR(255) NOT NULL,
            PlainText TEXT NOT NULL,
            EpisodeTitle VARCHAR(255),
            Embedding vector({vector_length}) NOT NULL,
            Part INT,
            TVShowID INT,
            AnimeID INT,
            MovieID INT,
            Runtime INT,
            FOREIGN KEY (TVShowID) REFERENCES TVShows(TVShowID) ON DELETE CASCADE,
            FOREIGN KEY (AnimeID) REFERENCES Animes(AnimeID) ON DELETE CASCADE,
            FOREIGN KEY (MovieID) REFERENCES Movies(MovieID) ON DELETE CASCADE
            );
            
            CREATE TABLE IF NOT EXISTS ImageMappings (
            ImageMappingID UUID PRIMARY KEY,
            ImagePath TEXT NOT NULL
            );
            """
        )
        cursor.execute(
            """
            CREATE INDEX IF NOT EXISTS tv_show_title_index ON TVShows(Title);
            CREATE INDEX IF NOT EXISTS anime_title_index ON Animes(Title);
            CREATE INDEX IF NOT EXISTS movie_title_index ON Movies(Title);
            """
        )
        for lang in WANTED_LANGUAGES:
            cursor.execute(
                f"""
                CREATE INDEX IF NOT EXISTS idx_gin_content_{lang.lower()} ON Subtitles USING GIN(to_tsvector('{lang}', plaintext));
                """
            )
    conn.commit()


def insert_into_table(conn, table_name, table_type, data):
    str_embedding = "[" + ",".join(map(str, data['embedding'])) + "]"
    table_name_single = table_name[:-1]
    with conn.cursor() as cursor:
        # possible names for table_name: TVShows, Animes, Movies
        select_title = f"SELECT {table_name_single}ID FROM {table_name} WHERE Title = %s;"
        cursor.execute(select_title, (data['title'],))
        show_id = cursor.fetchone()
        if show_id:
            show_id = show_id[0]
        else:
            insert_title = f"INSERT INTO {table_name} (Title) VALUES (%s) RETURNING {table_name_single}ID;"
            cursor.execute(insert_title, (data['title'],))
            show_id = cursor.fetchone()[0]

        if table_type == "descriptions":
            cursor.execute(
                f"""
                INSERT INTO Descriptions (EpisodeID, PlainText, episodeTitle, Embedding, Part, {table_name_single}ID)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (data['episode_id'], data['plain_text'], data['episode_title'], str_embedding, data['part'], show_id)
            )
        elif table_type == "subtitles":
            cursor.execute(
                f"""
                INSERT INTO Subtitles (EpisodeID, Language, Timestamp, PlainText, episodeTitle, Embedding, Part, 
                {table_name_single}ID, Runtime)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (data['episode_id'], data['language'], data['timestamp'], data['plain_text'], data['episode_title'],
                 str_embedding, data['part'], show_id, data['runtime'])
            )
    conn.commit()


def remove_from_tables(conn, table_name, title):
    table_name_single = table_name[:-1]
    with conn.cursor() as cursor:
        cursor.execute(
            f"""
            SELECT {table_name_single}ID FROM {table_name} WHERE Title = %s;
            """,
            (title,)
        )
        show_id = cursor.fetchone()
        if show_id:
            show_id = show_id[0]
            cursor.execute(
                f"""
                DELETE FROM Descriptions WHERE {table_name_single}ID = %s;
                DELETE FROM Subtitles WHERE {table_name_single}ID = %s;
                DELETE FROM {table_name} WHERE {table_name_single}ID = %s;
                """,
                (show_id, show_id, show_id)
            )
    conn.commit()


def insert_into_images(conn, file_path):
    uuid = str(uuid4())
    with conn.cursor() as cursor:
        cursor.execute(
            """
            INSERT INTO ImageMappings (ImageMappingID, ImagePath) VALUES (%s, %s)
            """,
            (uuid, file_path)
        )
    conn.commit()
    return uuid


def query_description(conn: psycopg2.connect, query: np.ndarray, show: str = None,
                      table: str = None, limit: int = 5, offset: int = 0, season: str = None):
    if not table:
        return ["No table specified"]
    # table is either TVShows, Animes, or Movies
    id_name = f"{table[:-1]}ID"
    str_embedding = "[" + ",".join(map(str, query)) + "]"
    where_title = "WHERE t.Title = %s" if show else ""
    and_or_where = "AND" if where_title else "WHERE"
    season_sql = f"{and_or_where} d.EpisodeID LIKE %s" if season else ""
    season = season + "%" if season else ""

    sql_string = f"""
    WITH TopDescriptions AS (
            SELECT t.Title, d.EpisodeID, d.episodetitle, d.Part, d.{id_name}
            FROM {table} AS t
            JOIN Descriptions AS d ON t.{id_name} = d.{id_name}
            {where_title}
            {season_sql}
            ORDER BY d.Embedding <=> %s
            LIMIT %s OFFSET %s
            )
    SELECT td.Title, d.EpisodeID, d.PlainText, d.episodetitle, d.Embedding, d.Part
    FROM Descriptions AS d
    JOIN TopDescriptions AS td ON d.{id_name} = td.{id_name} AND d.EpisodeID = td.EpisodeID
    """
    # Parameters for the query
    params = [x for x in [show, season, str_embedding, limit, offset] if x not in [None, ""]]

    with conn.cursor(cursor_factory=DictCursor) as cursor:
        try:
            cursor.execute(sql_string, params)
        except:
            conn.rollback()
            print("Error, rolled back: query_description")
            return []
        return cursor.fetchall()


def query_subtitle(conn: psycopg2.connect, query: np.ndarray, show: str = None,
                   table: str = None, language: str = None, limit: int = 5, offset: int = 0, season: str = None):
    if not table:
        return ["No table specified"]
    str_embedding = "[" + ",".join(map(str, query)) + "]"
    table_id = f"{table[:-1]}ID"
    where_title = "WHERE t.Title = %s" if show else ""
    and_or_where = "AND" if where_title else "WHERE"
    lang = f"{and_or_where} language = %s" if language else ""
    and_or_where = "AND" if where_title or language else "WHERE"
    season_sql = f"{and_or_where} d.EpisodeID LIKE %s" if season else ""
    season = season + "%" if season else ""
    sql_string = f"""
    WITH TopSubtitles AS (
            SELECT t.Title, d.EpisodeID, d.Language, d.Timestamp, d.PlainText, d.episodetitle, d.Embedding, d.part, d.{table_id}, d.Runtime
            FROM {table} AS t
            JOIN Subtitles AS d ON t.{table_id} = d.{table_id}
            {where_title}
            {lang}
            {season_sql}
            ORDER BY d.Embedding <=> %s
            LIMIT %s OFFSET %s
            )
    SELECT td.Title, d.EpisodeID, d.Language, d.Timestamp, d.PlainText, d.episodetitle, d.Embedding, d.part, d.Runtime
    FROM Subtitles AS d
    JOIN TopSubtitles AS td ON d.{table_id} = td.{table_id} AND d.timestamp = td.timestamp AND d.EpisodeID = td.EpisodeID
            """

    # Parameters for the query
    params = [x for x in [show, language, season, str_embedding, limit, offset] if x not in [None, ""]]
    try:
        with conn.cursor(cursor_factory=DictCursor) as cursor:
            try:
                cursor.execute(sql_string, params)
            except:
                conn.rollback()
                print("Error, rolled back in query_subtitle")
                return []
            return cursor.fetchall()
    except Exception as e:
        print(e)
        return []


def query_description_fts(conn: psycopg2.connect, query: str, show: str = None, language: str = None,
                          table: str = None, limit: int = 5, offset: int = 0, season: str = None):
    if not table:
        return ["No table specified"]
    # table is either TVShows, Animes, or Movies
    table_id = f"{table[:-1]}ID"
    where_title = "WHERE t.Title = %s" if show else ""
    and_or_where = "AND" if where_title else "WHERE"
    season_sql = f"{and_or_where} d.EpisodeID LIKE %s" if season else ""
    season = season + "%" if season else ""
    and_or_where = "AND" if where_title or season_sql else "WHERE"
    match_lang = WANTED_LANGUAGES[0] if not language else language

    sql_string = f"""
    SELECT t.Title, d.EpisodeID, d.PlainText, d.episodetitle, d.embedding, d.Part
    FROM {table} AS t
    JOIN Descriptions AS d ON t.{table_id} = d.{table_id}
    {where_title}
    {season_sql}
    {and_or_where} to_tsvector(%s, d.PlainText) @@ plainto_tsquery(%s, %s)
    LIMIT %s OFFSET %s
    
    """
    params = [x for x in [show, season, match_lang, match_lang, query, limit, offset] if x not in [None, ""]]

    try:
        with conn.cursor(cursor_factory=DictCursor) as cursor:
            try:
                cursor.execute(sql_string, params)
            except:
                conn.rollback()
                print("Error, rolled back in query_description_fts")
                return []
            return cursor.fetchall()
    except Exception as e:
        print(e)
        return []


def query_subtitle_fts(conn: psycopg2.connect, query: str, show: str = None,
                   table: str = None, language: str = None, limit: int = 5, offset: int = 0, season: str = None):
    if not table:
        return ["No table specified"]
    table_id = f"{table[:-1]}ID"
    where_title = "WHERE t.Title = %s" if show else ""
    and_or_where = "AND" if where_title else "WHERE"
    lang = f"{and_or_where} language = %s" if language else ""
    and_or_where = "AND" if where_title or language else "WHERE"
    season_sql = f"{and_or_where} d.EpisodeID LIKE %s" if season else ""
    season = season + "%" if season else ""
    and_or_where = "AND" if where_title or language or season_sql else "WHERE"
    match_lang = WANTED_LANGUAGES[0] if not language else language

    sql_string = f"""
    SELECT t.Title, d.EpisodeID, d.Language, d.Timestamp, d.PlainText, d.episodetitle, d.Embedding, d.part, d.runtime
    FROM {table} AS t
    JOIN subtitles AS d ON t.{table_id} = d.{table_id}
    {where_title}
    {lang}
    {season_sql}
    {and_or_where} to_tsvector(%s, d.PlainText) @@ plainto_tsquery(%s, %s)
    LIMIT %s OFFSET %s
    """

    params = [x for x in [show, language, season, match_lang, match_lang, query, limit, offset] if x not in [None, ""]]

    try:
        with conn.cursor(cursor_factory=DictCursor) as cursor:
            try:
                cursor.execute(sql_string, params)
            except:
                conn.rollback()
                print("Error, rolled back in query_subtitle_fts")
                return []
            return cursor.fetchall()
    except Exception as e:
        print(e)
        return []


def query_images(conn: psycopg2.connect, uuid: str = None, file_path: str = None):
    if uuid:
        sql = """
        SELECT ImagePath FROM ImageMappings WHERE ImageMappingID = %s
        """
        input_value = uuid
    else:
        sql = """
        Select ImageMappingID FROM ImageMappings WHERE ImagePath = %s
        """
        input_value = file_path

    with conn.cursor() as cursor:
        cursor.execute(sql, (input_value,))
        return cursor.fetchone()


def remove_table(conn, table_name: str):
    with conn.cursor() as cursor:
        cursor.execute(
            """
            DROP TABLE IF EXISTS {}
            """.format(table_name)
        )
    conn.commit()


def get_existing_media(table, conn):
    # get title of each show as well as all the episode ids
    with conn.cursor() as cursor:
        cursor.execute(
            f"""
            SELECT t.Title, d.EpisodeID
            FROM {table} AS t
            JOIN Descriptions AS d ON t.{table[:-1]}ID = d.{table[:-1]}ID
            """
        )
        description_shows = cursor.fetchall()
        cursor.execute(
            f"""
            SELECT t.Title, s.EpisodeID
            FROM {table} AS t
            JOIN Subtitles AS s ON t.{table[:-1]}ID = s.{table[:-1]}ID
            """
        )
        subtitle_shows = cursor.fetchall()
    return description_shows, subtitle_shows


def size_of_db(conn):
    # get the number of rows of each table
    with conn.cursor() as cursor:
        cursor.execute(
            """
            SELECT COUNT(*) FROM TVShows;
            """
        )
        tv_shows = cursor.fetchone()[0]
        cursor.execute(
            """
            SELECT COUNT(*) FROM Animes;
            """
        )
        animes = cursor.fetchone()[0]
        cursor.execute(
            """
            SELECT COUNT(*) FROM Movies;
            """
        )
        movies = cursor.fetchone()[0]
        cursor.execute(
            """
            SELECT COUNT(*) FROM Descriptions
            WHERE part IS NULL OR part = 1;
            """
        )
        descriptions = cursor.fetchone()[0]
        cursor.execute(
            """
            SELECT COUNT(*) FROM Subtitles
            WHERE part IS NULL OR part = 1;
            """
        )
        subtitles = cursor.fetchone()[0]
        return {'tv_shows': tv_shows, 'animes': animes, 'movies': movies,
                'descriptions': descriptions, 'subtitles': subtitles}
