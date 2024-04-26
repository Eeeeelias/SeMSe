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
    with conn.cursor() as cursor:
        # possible names for table_name: TVShow, Anime, Movie
        select_title = f"SELECT {table_name}ID FROM {table_name}s WHERE Title = %s;"
        cursor.execute(select_title, (data['title'],))
        show_id = cursor.fetchone()
        if show_id:
            show_id = show_id[0]
        else:
            insert_title = f"INSERT INTO {table_name}s (Title) VALUES (%s) RETURNING {table_name}ID;"
            cursor.execute(insert_title, (data['title'],))
            show_id = cursor.fetchone()[0]

        if table_type == "descriptions":
            cursor.execute(
                f"""
                INSERT INTO Descriptions (EpisodeID, PlainText, Embedding, {table_name}ID)
                VALUES (%s, %s, %s, %s)
                """,
                (data['episode_id'], data['plain_text'], str_embedding, show_id)
            )
        elif table_type == "subtitles":
            cursor.execute(
                f"""
                INSERT INTO Subtitles (EpisodeID, Language, Timestamp, PlainText, Embedding, {table_name}ID)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (data['episode_id'], data['language'], data['timestamp'], data['plain_text'], str_embedding, show_id)
            )
    conn.commit()


def query_description(conn, query: np.ndarray, show: str = None):
    str_embedding = "[" + ",".join(map(str, query)) + "]"
    with conn.cursor() as cursor:
        if show:
            cursor.execute(
                """
                SELECT show_name, episode_id, plain_text, embedding FROM descriptions WHERE show_name = %s ORDER BY embedding <=> %s LIMIT 5
                """,
                (show, str_embedding)
            )
        else:
            cursor.execute(
                """
                SELECT show_name, episode_id, plain_text, embedding FROM descriptions ORDER BY embedding <=> %s LIMIT 5
                """,
                (str_embedding,)
            )
        return cursor.fetchall()


def query_subtitle(conn, query: np.ndarray, show: str = None):
    str_embedding = "[" + ",".join(map(str, query)) + "]"
    with conn.cursor() as cursor:
        if show:
            cursor.execute(
                """
                SELECT show_name, episode_id, timestamp, plain_text, embedding FROM subtitles WHERE show_name = %s ORDER BY embedding <=> %s LIMIT 5
                """,
                (show, str_embedding)
            )
        else:
            cursor.execute(
                """
                SELECT show_name, episode_id, timestamp, plain_text, embedding FROM subtitles ORDER BY embedding <=> %s LIMIT 5
                """,
                (str_embedding,)
            )
        return cursor.fetchall()


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
            DELETE FROM descriptions, subtitles WHERE show_name = %s
            """,
            (show_name,)
        )
    conn.commit()


def get_existing_media(table, conn):
    with conn.cursor() as cursor:
        cursor.execute(
            f"""
            SELECT DISTINCT Title FROM {table}s
            """
        )
        return cursor.fetchall()
