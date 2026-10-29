
from django.contrib.auth.decorators import permission_required
from django.shortcuts import render
from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from chatwebsite.serializers import (
    MessageSerializer,
    ConversationSerializer,
)
from chatwebsite.models import Message, Conversation


User = get_user_model()


class MessageListCreateAPIView(generics.ListCreateAPIView):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Message.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class MessageRetrieveUpdateDestroyAPIView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = Message.objects.all().order_by("created_at")
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Message.objects.filter(user=self.request.user)


class StartConversationAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        other_user_id = request.data.get("user_id")

        if not other_user_id:
            return Response(
                {"error": "user_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            other_user = User.objects.get(pk=other_user_id)
        except (User.DoesNotExist, ValueError, TypeError):
            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if other_user == request.user:
            return Response(
                {"error": "You cannot chat with yourself"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        for conversation in request.user.conversations.all():
            if (
                conversation.participants.count() == 2
                and conversation.participants.filter(
                    pk=other_user.pk
                ).exists()
            ):
                return Response(
                    ConversationSerializer(conversation).data,
                    status=status.HTTP_200_OK,
                )

        conversation = Conversation.objects.create()
        conversation.participants.add(request.user, other_user)

        return Response(
            ConversationSerializer(conversation).data,
            status=status.HTTP_201_CREATED,
        )


def chat_page(request):
    return render(request, "chatwebsite/chat.html")
class UserListAPIView(generics.ListAPIView):
    permission_classes=[IsAuthenticated]
    
    def get_queryset(self):
        return User.objects.exclude(id=self.request.user.id).order_by("username")
    def list(self,request,*args,**kwargs):
        users=self.get_queryset()
        data=[
            {
                "id":user.id,
                "username":user.username
            }
            for user in users
        ]
        return Response(data)
class ConversationListAPIView(generics.ListAPIView):
    serializer_class=ConversationSerializer
    permission_classes=[IsAuthenticated]

    def get_queryset(self):
        return(
            Conversation.objects.filter(participants=self.request.user).prefetch_related("participants").order_by("created_at")
        )
