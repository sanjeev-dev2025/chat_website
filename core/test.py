
import asyncio
import json
import websockets


async def main():
    uri = "ws://127.0.0.1:8000/ws/chat/"

    async with websockets.connect(uri) as websocket:
        print("Connected to chat room!")

        async def receive_messages():
            async for response in websocket:
                data = json.loads(response)
                print("\nReceived:", data["message"])

        receiver = asyncio.create_task(receive_messages())

        try:
            while True:
                message = await asyncio.to_thread(
                    input, "Message: "
                )
                await websocket.send(json.dumps({
                    "message": message
                }))
        except (EOFError, KeyboardInterrupt):
            pass
        finally:
            receiver.cancel()


asyncio.run(main())
