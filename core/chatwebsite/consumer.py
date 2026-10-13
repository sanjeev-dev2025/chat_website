
import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from chatwebsite.models import Message


class MessageConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        print("STEP 1: WebSocket connect started")

        user = self.scope["user"]
        if not user.is_authenticated:
            print("STEP 2: User is not authenticated")
            await self.close(code=4401)
            return

        print("STEP 2: User authenticated")

        self.room_group_name = "chat_room"

        print("STEP 3: Adding to Redis group")
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        print("STEP 4: Added to Redis group")

        await self.accept()
        print("STEP 5: WebSocket accepted")

        messages = await self.get_messages()
        print("STEP 6: Message history loaded")

        await self.send(text_data=json.dumps({
            "type": "history",
            "messages": messages
        }))
        print("STEP 7: History sent")

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
            user, message_text
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
    def save_message(self, user, message_text):
        message = Message.objects.create(
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
    def get_messages(self):
        messages = Message.objects.select_related(
            "user"
        ).order_by("-created_at")[:50]

        return [
            {
                "id": message.id,
                "username": message.user.username,
                "message": message.message,
                "created_at": message.created_at.isoformat(),
            }
            for message in reversed(list(messages))
        ]
