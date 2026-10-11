
from django.urls import path
from chatwebsite.consumer import MessageConsumer

websocket_urlpatterns = [
    path("ws/chat/", MessageConsumer.as_asgi()),
]
