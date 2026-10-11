from channels.generic.websocket import AsyncWebSocketConsumer
import json
class MessageConsumer(AsyncWebSocketConsumer):
    async def connect(self):
        await self.accept()
        await self.send(text_data=json.dumps({
            "message":"connected successfully",
        }))
    async def disconnect(self):
        pass
    async def recieve(self,text_data):
        data=json.loads(text_data)
        message=data.get('message','')
        await self.send(text_data=json.dumps({
            "message":f"you sent:{message}",
        }))
