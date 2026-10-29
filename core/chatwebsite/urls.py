
from django.urls import path
from chatwebsite.views import chat_page
from chatwebsite.views import( MessageListCreateAPIView,MessageRetrieveUpdateDestroyAPIView,StartConversationAPIView,
UserListAPIView,ConversationListAPIView)
urlpatterns=[
    path('messages/',MessageListCreateAPIView.as_view(),name="messages"),
    path('messages/<int:pk>/',MessageRetrieveUpdateDestroyAPIView.as_view(),name="message"),
    path('chat/', chat_page, name="chat"),
    path('startconversation/',StartConversationAPIView.as_view(),name="startconversation"),
    path('userslist/',UserListAPIView.as_view(),name="userslist"),
    path('conversation/',ConversationListAPIView.as_view(),name="conversation")
]   