from django.db import models
from django.conf import settings

# Create your models here.
class Conversation(models.Model):
    participants=models.ManyToManyField(settings.AUTH_USER_MODEL,related_name='conversations')
    created_at=models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"conversation {self.id}"

class Message(models.Model):
    conversation=models.ForeignKey(Conversation,on_delete=models.CASCADE,related_name="messages")
    user=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name="messages")
    message=models.TextField()
    created_at=models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"{self.user}:{self.message}"
