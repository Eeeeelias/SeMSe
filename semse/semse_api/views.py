from django.http import JsonResponse, HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_exempt, csrf_protect
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
        show = data['show']
    except KeyError:
        show = None
    print("Finding media with query: " + query, "show: " + str(show))
    query_result = uq.query_db(query, show, table=data['table'], language=data['language'])
    return JsonResponse(query_result)


def test_api(request):
    # write html with form to test api
    html = """
    <html>
    <body>
    <form id="queryForm" action="/query/" method="post">
        Query: <input type="text" name="query"><br>
        Show: <input type="text" name="show"><br>
        Table: <input type="text" name="table"><br>
        Language: <input type="text" name="language"><br>
        <input type="submit" value="Submit">
    </form>
    <br>
    <ul id="queryResult"></ul>
    </body>
    <script>
        function getCookie(name) {
            let cookieValue = null;
            if (document.cookie && document.cookie !== '') {
                const cookies = document.cookie.split(';');
                for (let i = 0; i < cookies.length; i++) {
                    const cookie = cookies[i].trim();
                    // Does this cookie string begin with the name we want?
                    if (cookie.substring(0, name.length + 1) === (name + '=')) {
                        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                        break;
                    }
                }
            }
            return cookieValue;
        }
        
        const csrftoken = getCookie('csrftoken');
        
        const query_result = "";
        
        document.getElementById('queryForm').addEventListener('submit', function(e) {
            e.preventDefault();
            fetch('/query/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-CSRFToken': csrftoken
                },
                body: new URLSearchParams(new FormData(e.target)) // e.target is the form
            }).then(response => {
                if (!response.ok) throw new Error(response.status);
                return response.json();
            }).then(data => {
            // Display the resulting json
            let queryResult = document.getElementById('queryResult');
            queryResult.innerHTML = '';
            for (let key in data) {
                let li = document.createElement('li');
                li.appendChild(document.createTextNode(key + ': ' + JSON.stringify(data[key])));
                queryResult.appendChild(li);
            }
            }).catch(error => {
                console.error('Error:', error);
            });
        });
    </script>
    </html>
    """
    return HttpResponse(html)
