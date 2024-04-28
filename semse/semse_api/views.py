from django.http import JsonResponse, HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.csrf import ensure_csrf_cookie
import backend.database_functions as dbf
import backend.user_query as uq

# put in all api calls here


def get_all_media(request):
    print("Got request for all media")
    conn = dbf.get_conn()
    all_media = {}
    for table in ['Animes', 'Movies', 'TVShows']:
        media = dbf.get_existing_media(table, conn)
        all_media[table] = [show[0] for show in media]
    return JsonResponse(all_media)


def query_media(request):
    data = request.POST
    try:
        query = data['query']
    except KeyError:
        # return 400 bad request
        return JsonResponse({'error': 'No query provided'}, status=400)
    try:
        table = data['table']
    except KeyError:
        return JsonResponse({'error': 'No table provided'}, status=400)
    try:
        show = data['show']
    except KeyError:
        show = None
    try:
        type = data['type']
    except KeyError:
        type = "both"

    try:
        offset = data['offset']
    except KeyError:
        offset = 0

    print("Finding media with query: " + query, "show: " + str(show), "table: " + table, "type: " + type)
    query_result = uq.query_db(query, show, table=table, language=data['language'], type=type)
    return JsonResponse(query_result)


@ensure_csrf_cookie
def test_api(request):
    html = "<html><body>Test API</body></html>"
    return HttpResponse(html)


def get_media_size(request):
    print("Got request for media size")
    conn = dbf.get_conn()
    return JsonResponse(dbf.size_of_db(conn))
