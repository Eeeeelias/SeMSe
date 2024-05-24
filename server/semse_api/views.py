import json

from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from backend.retrieve_images import convert_image
import backend.database_functions as dbf
import backend.user_query as uq
import os
from datetime import datetime

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


def combine_show_with_season(tuple_list):
    available_seasons = {}
    for show in tuple_list:
        name = show[0]
        try:
            # split episode_id from s01e01 to just 1
            season = int(show[1].upper().split("E")[0][1:])
        except ValueError:
            season = None
        available_seasons[name] = available_seasons.get(name, []) + [season]
    return available_seasons


def get_media_dict(media):
    descriptions = media[0]
    subtitles = media[1]

    desc_seasons = combine_show_with_season(descriptions)
    sub_seasons = combine_show_with_season(subtitles)

    all_info = [{'name': key,
                 'descriptions': sorted(set(desc_seasons.get(key, []))),
                 'conversations': sorted(set(sub_seasons.get(key, [])))}
                for key in set(desc_seasons.keys()).union(sub_seasons.keys())]
    return all_info


@csrf_exempt
def query_media(request, fts=False):
    keys_defaults = {
        'query': None,
        'table': None,
        'show': None,
        'type': "both",
        'offset': 0,
        'season': None,
        'language': None
    }
    if request.content_type == 'application/json':
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON provided'}, status=400)
    else:
        data = request.POST

    # Get values from data or use default
    params = {key: data.get(key, default) for key, default in keys_defaults.items()}
    if params['table'] == 'TV Shows':
        params['table'] = 'TVShows'
    params['type'] = params['type'].lower()

    # Check for required parameters
    if not params['query'] or not params['table']:
        print("Missing params:", params['query'], params['table'])
        return JsonResponse({'error': 'No query or table provided'}, status=400)

    if params['table'] not in ['Animes', 'Movies', 'TVShows']:
        return JsonResponse({'error': 'Invalid table provided'}, status=403)

    time_format = "%Y-%m-%d %H:%M:%S"

    print(
        f"[{datetime.now().strftime(time_format)}] Finding media with query: {params['query']}, "
        f"show: {params['show']}, table: {params['table']}, type: {params['type']}, offset: {params['offset']}", end=" ")

    try:
        if fts:
            query_result = uq.query_db(**params, fts=True)
        else:
            query_result = uq.query_db(**params)
    except Exception as e:
        print(e)
        query_result = {'error': 'there was an error fetching the results from the database'}
        return JsonResponse(query_result, status=501)
    print(f"... found {len(query_result)} entries")
    return JsonResponse(query_result, safe=False)


@csrf_exempt
def query_media_fts(request):
    return query_media(request, fts=True)


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
    width = request.GET.get('width', 300)

    if os.path.exists(image_path):
        try:
            image_buffer = convert_image(image_path, width)
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
