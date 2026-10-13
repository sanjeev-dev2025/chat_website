
from django.urls import path
from chatwebsite.views import chat_page
from chatwebsite.views import MessageListCreateAPIView,MessageRetrieveUpdateDestroyAPIView
urlpatterns=[
    path('messages/',MessageListCreateAPIView.as_view(),name="messages"),
    path('messages/<int:pk>/',MessageRetrieveUpdateDestroyAPIView.as_view(),name="message"),
    path('chat/', chat_page, name="chat"),
]   