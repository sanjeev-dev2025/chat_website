
from django.urls import path
from chatwebsite.consumer import MessageConsumer

websocket_urlpatterns = [
    path("ws/chat/<int:conversation_id>/", MessageConsumer.as_asgi()),
]
