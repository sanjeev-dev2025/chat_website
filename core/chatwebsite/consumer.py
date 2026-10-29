
import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from chatwebsite.models import Message,Conversation


class MessageConsumer(AsyncWebsocketConsumer):

    async def connect(self):
       

        user = self.scope["user"]
        if not user.is_authenticated:
           
            await self.close(code=4401)
            return



        self.conversation_id=self.scope['url_route']["kwargs"]["conversation_id"]
        is_participant=await self.check_participant(user.id,
        self.conversation_id)
        if not is_participant:
            await self.close(code=4403)
            return

        self.room_group_name=(
            f"conversation_{self.conversation_id}"
        )

       
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
      

        await self.accept()
     

        messages = await self.get_messages(
            self.conversation_id
        )
    

        await self.send(text_data=json.dumps({
            "type": "history",
            "messages": messages
        }))
       

    async def disconnect(self, close_code):
        if hasattr(self, "room_group_name"):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            return

        message_text = data.get("message", "").strip()

        if not message_text:
            return

        user = self.scope["user"]

        # Save message with the authenticated user
        saved_message = await self.save_message(
            user,self.conversation_id, message_text
        )

        # Broadcast to everyone in the room
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": saved_message,
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "type": "message",
            "message": event["message"],
        }))
    @database_sync_to_async
    def check_participant(self,user_id,conversation_id):
        return Conversation.objects.filter(id=conversation_id,
        participants__id=user_id).exists()

    @database_sync_to_async
    def save_message(self, user,conversation_id, message_text):
        conversation=Conversation.objects.get(id=conversation_id)
        message = Message.objects.create(
            conversation=conversation,
            user=user,
            message=message_text,
        )

        return {
            "id": message.id,
            "username": message.user.username,
            "message": message.message,
            "created_at": message.created_at.isoformat(),
        }

    @database_sync_to_async
    def get_messages(self,conversation_id):
        messages = Message.objects.filter(
            conversation_id=conversation_id
        ).select_related("user").order_by("-created_at")[:50]

        return [
            {
                "id": message.id,
                "username": message.user.username,
                "message": message.message,
                "created_at": message.created_at.isoformat(),
            }
            for message in reversed(list(messages))
        ]
