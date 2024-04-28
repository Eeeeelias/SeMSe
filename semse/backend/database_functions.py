from uuid import uuid4
import numpy as np
import psycopg2
import os
from dotenv import load_dotenv
from backend.retrieve_embeddings import retrieve_media, encode_text, compute_cosine_similarity


load_dotenv()


# connect to postgres
def get_conn():
    conn = psycopg2.connect(
        host="semantic_search_db",
        database="postgres",
        user=os.getenv('POSTGRES_USER'),
        password=os.getenv('POSTGRES_PASSWORD'),
        port=5432
    )
    return conn


def init_db(conn):
    enable_extension(conn, "vectors")
    create_tables(conn)
    print("Database initialized successfully")


def enable_extension(conn, extension):
    with conn.cursor() as cursor:
        cursor.execute(f"CREATE EXTENSION IF NOT EXISTS {extension}")
    conn.commit()


def create_tables(conn):
    with conn.cursor() as cursor:
        cursor.execute(
            """
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
            Embedding vector(768) NOT NULL,
            TVShowID INT,
            AnimeID INT,
            MovieID INT,
            FOREIGN KEY (TVShowID) REFERENCES TVShows(TVShowID),
            FOREIGN KEY (AnimeID) REFERENCES Animes(AnimeID),
            FOREIGN KEY (MovieID) REFERENCES Movies(MovieID)
            );

            CREATE TABLE IF NOT EXISTS Subtitles (
            SubtitleID SERIAL PRIMARY KEY,
            EpisodeID VARCHAR(255),
            Language VARCHAR(255) NOT NULL,
            Timestamp VARCHAR(255) NOT NULL,
            PlainText TEXT NOT NULL,
            Embedding vector(768) NOT NULL,
            TVShowID INT,
            AnimeID INT,
            MovieID INT,
            FOREIGN KEY (TVShowID) REFERENCES TVShows(TVShowID),
            FOREIGN KEY (AnimeID) REFERENCES Animes(AnimeID),
            FOREIGN KEY (MovieID) REFERENCES Movies(MovieID)
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
                INSERT INTO Descriptions (EpisodeID, PlainText, Embedding, {table_name_single}ID)
                VALUES (%s, %s, %s, %s)
                """,
                (data['episode_id'], data['plain_text'], str_embedding, show_id)
            )
        elif table_type == "subtitles":
            cursor.execute(
                f"""
                INSERT INTO Subtitles (EpisodeID, Language, Timestamp, PlainText, Embedding, {table_name_single}ID)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (data['episode_id'], data['language'], data['timestamp'], data['plain_text'], str_embedding, show_id)
            )
    conn.commit()


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
            SELECT t.Title, d.EpisodeID, d.PlainText, d.Embedding
            FROM {table} AS t
            JOIN Descriptions AS d ON t.{id_name} = d.{id_name}
            {where_title}
            {season_sql}
            ORDER BY d.Embedding <=> %s
            LIMIT %s OFFSET %s
            """
    # Parameters for the query
    params = [x for x in [show, season, str_embedding, limit, offset] if x not in [None, ""]]

    with conn.cursor() as cursor:
        cursor.execute(sql_string, [x for x in params if x])
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
            SELECT t.Title, d.EpisodeID, d.Language, d.Timestamp, d.PlainText, d.Embedding
            FROM {table} AS t
            JOIN Subtitles AS d ON t.{table_id} = d.{table_id}
            {where_title}
            {lang}
            {season_sql}
            ORDER BY d.Embedding <=> %s
            LIMIT %s OFFSET %s
            """

    # Parameters for the query
    params = [x for x in [show, language, season, str_embedding, limit, offset] if x not in [None, ""]]
    try:
        with conn.cursor() as cursor:
            cursor.execute(sql_string, params)
            return cursor.fetchall()
    except Exception as e:
        print(e)
        return []


def remove_table(conn, table_name: str):
    with conn.cursor() as cursor:
        cursor.execute(
            """
            DROP TABLE IF EXISTS {}
            """.format(table_name)
        )
    conn.commit()


def remove_show(conn, show_name: str):
    with conn.cursor() as cursor:
        cursor.execute(
            """
            DELETE FROM Descriptions subtitles WHERE show_name = %s
            """,
            (show_name,)
        )
    conn.commit()


def get_existing_media(table, conn):
    with conn.cursor() as cursor:
        cursor.execute(
            f"""
            SELECT DISTINCT Title FROM {table}
            """
        )
        return cursor.fetchall()


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
            SELECT COUNT(*) FROM Descriptions;
            """
        )
        descriptions = cursor.fetchone()[0]
        cursor.execute(
            """
            SELECT COUNT(*) FROM Subtitles;
            """
        )
        subtitles = cursor.fetchone()[0]
        return {'tv_shows': tv_shows, 'animes': animes, 'movies': movies,
                'descriptions': descriptions, 'subtitles': subtitles}
