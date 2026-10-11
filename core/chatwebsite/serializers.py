from rest_framework import serializers
from chatwebsite.models import Message

class MessageSerializer(serializers.ModelSerializer):
    username=serializers.CharField(source="user.username",read_only=True)
    class Meta:
        model=Message
        fields=["id","message","username","created_at"]
        read_only_fields=["id","username","created_at"]
