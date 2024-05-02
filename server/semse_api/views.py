from django.http import JsonResponse, HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.csrf import ensure_csrf_cookie
from wsgiref.util import FileWrapper
import backend.database_functions as dbf
import backend.user_query as uq
import os

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
    keys_defaults = {
        'query': None,
        'table': None,
        'show': None,
        'type': "both",
        'offset': 0,
        'season': None,
        'language': None
    }

    # Get values from data or use default
    params = {key: data.get(key, default) for key, default in keys_defaults.items()}

    # Check for required parameters
    if not params['query'] or not params['table']:
        return JsonResponse({'error': 'No query or table provided'}, status=400)

    if params['table'] not in ['Animes', 'Movies', 'TVShows']:
        return JsonResponse({'error': 'Invalid table provided'}, status=403)

    print(
        f"Finding media with query: {params['query']}, show: {params['show']}, table: {params['table']}, "
        f"type: {params['type']}, offset: {params['offset']}")

    try:
        query_result = uq.query_db(**params)
    except Exception as e:
        print(e)
        query_result = {'error': 'there was an error fetching the results from the database'}
        return JsonResponse(query_result, status=501)
    return JsonResponse(query_result)


@ensure_csrf_cookie
def test_api(request):
    # fuck django templates
    with open('semse_api/template.html', 'r') as f:
        html = f.read()
    return HttpResponse(html)


def get_media_size(request):
    print("Got request for media size")
    conn = dbf.get_conn()
    return JsonResponse(dbf.size_of_db(conn))


def serve_image(request):
    image_path = '/media/Anime/Yuru Camp/folder.jpg'

    if os.path.exists(image_path):
        with open(image_path, 'rb') as image_file:
            # Set the content type
            content_type = 'image/jpeg'
            response = HttpResponse(FileWrapper(image_file), content_type=content_type)
            response['Content-Length'] = os.path.getsize(image_path)
            return response
    else:
        print("Could not find file")
        return HttpResponse("Image not found", status=404)
