from django.http import JsonResponse, HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.csrf import ensure_csrf_cookie
from wsgiref.util import FileWrapper
from PIL import Image as PILImage
import io
import backend.database_functions as dbf
import backend.user_query as uq
import os

# put in all api calls here


def get_all_media(request):
    print("Got request for all media")
    conn = dbf.get_conn()
    try:
        all_media = {table: get_media_dict(dbf.get_existing_media(table, conn))
                     for table in ['Animes', 'Movies', 'TVShows']}
    except Exception as e:
        print(e)
        all_media = {'error': 'there was an error fetching the results from the database'}
        return JsonResponse(all_media, status=501)
    return JsonResponse(all_media)


def get_media_dict(media):
    # split episode_id from s01e01 to just 1
    unique_season = set()
    for show in media:
        name = show[0]
        try:
            season = int(show[1].upper().split("E")[0][1:])
        except ValueError:
            season = None
        unique_season.add((name, season))

    return {season[0]: [s[1] for s in unique_season if s[0] == season[0]] for season in unique_season}


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
        f"type: {params['type']}, offset: {params['offset']}", end=" ")

    try:
        query_result = uq.query_db(**params)
    except Exception as e:
        print(e)
        query_result = {'error': 'there was an error fetching the results from the database'}
        return JsonResponse(query_result, status=501)
    print(f"... found {len(query_result)} entries")
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


def serve_image(request, uuid):
    conn = dbf.get_conn()
    if not uuid:
        return HttpResponse("No uuid provided", status=400)
    image_path = dbf.query_images(conn, uuid=uuid)[0]
    width = 300

    if os.path.exists(image_path):
        with open(image_path, 'rb') as image_file:
            try:
                image = PILImage.open(image_file)

                # scale image to 300 px width
                w_percent = (float(width) / float(image.size[0]))
                h_size = int((float(image.size[1]) * float(w_percent)))
                image = image.resize((int(width), h_size))

                # Convert the image to bytes in memory
                image_buffer = io.BytesIO()
                image.save(image_buffer, format='JPEG')
                image_buffer.seek(0)

                # Set the content type
                content_type = 'image/jpeg'
                response = HttpResponse(image_buffer.read(), content_type=content_type)
                response['Content-Length'] = image_buffer.tell()
                return response
            except Exception as e:
                print(e)
                return HttpResponse("Image could not be converted", status=500)
    else:
        print("Could not find file")
        return HttpResponse("Image not found", status=404)
