from django.shortcuts import render
from rest_framework import generics
from chatwebsite.serializers import MessageSerializer
from chatwebsite.models import Message
from rest_framework.permissions import IsAuthenticated
# Create your views here.

class MessageListCreateAPIView(generics.ListCreateAPIView):
    queryset=Message.objects.all()
    serializer_class=MessageSerializer
    permission_classes=[IsAuthenticated]

    def get_queryset(self):
        return Message.objects.filter(user=self.request.user)
    def perform_create(self,serializer):
        serializer.save(user=self.request.user)


class MessageRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
     queryset=Message.objects.all().order_by('created_at')
     serializer_class=MessageSerializer
     permission_classes=[IsAuthenticated]

     def get_queryset(self):
        return Message.objects.filter(user=self.request.user)

def chat_page(request):
    return render(request, "chatwebsite/chat.html")