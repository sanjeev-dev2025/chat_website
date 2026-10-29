from rest_framework import serializers
from chatwebsite.models import Message,Conversation
class MessageSerializer(serializers.ModelSerializer):
    username=serializers.CharField(source="user.username",read_only=True)
    class Meta:
        model=Message
        fields=["id","message","username","created_at"]
        read_only_fields=["id","username","created_at"]

class ConversationSerializer(serializers.ModelSerializer):
    participants=serializers.PrimaryKeyRelatedField(many=True,read_only=True)
    username=serializers.SerializerMethodField()
    class Meta:
        model=Conversation
        fields=["id","participants","created_at","username"]
        read_only_fields=["username","created_at","participants"]
    def get_username(self,obj):
        return[
            user.username
            for user in obj.participants.all()
        ]

    