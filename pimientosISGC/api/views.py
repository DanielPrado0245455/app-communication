from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action

class UsuarioViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['get', 'post'])
    def handle_request(self, request):
        # Print the request details
        print("Request Method:", request.method)
        print("Request Headers:", request.headers)
        print("Request Body:", request.body.decode('utf-8'))

        if request.method == 'GET':
            return Response({"message": "GET request received"})
        elif request.method == 'POST':
            return Response({"message": "POST request received"})
