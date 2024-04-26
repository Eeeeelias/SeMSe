from django.http import JsonResponse
import backend.database_functions as dbf
import backend.user_query as uq
from asgiref.sync import sync_to_async

# put in all api calls here


def get_all_media(request):
    print("Got request for all media")
    table = request.GET.get('table')
    conn = dbf.get_conn()
    tv_shows = dbf.get_existing_media(table, conn)
    tv_shows = [show[0] for show in tv_shows]
    movies = []
    anime = []
    return JsonResponse({'tv_shows': tv_shows, 'movies': movies, 'anime': anime})


def query_media(request):
    data = request.POST
    try:
        query = data['query']
    except KeyError:
        # return 400 bad request
        return JsonResponse({'error': 'No query provided'}, status=400)
    try:
        show = data['show']
    except KeyError:
        show = None
    print("Finding media with query: " + query, "show: " + str(show))
    media = uq.query_db(query, show)
    return JsonResponse({'media': media})


def create(request):
    dbf.fill_database()
    return JsonResponse({'status': 'success'})
