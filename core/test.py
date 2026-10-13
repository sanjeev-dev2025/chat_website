
import asyncio
import json
import websockets


async def main():
    uri = "ws://127.0.0.1:8000/ws/chat/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzkxODcwMDcxLCJpYXQiOjE3OTE4Njk3NzEsImp0aSI6IjRhMTc0MjUzYTc3ZDQ2YTQ5Y2UwZGVjZDM5NWY5MjIwIiwidXNlcl9pZCI6IjIifQ.COqZBvFuPqhCJbvsyz2BMGatN4VJUt2u5nxNXsbFOVw"
    async with websockets.connect(uri) as websocket:
        print("Connected to chat room!")

        async def receive_messages():
            async for response in websocket:
                data = json.loads(response)
                if data["type"] == "history":
                    print("\n--- Chat History ---")
                    for msg in data.get("messages", []):
                        print(f"  [{msg['created_at']}] {msg['username']}: {msg['message']}")
                    print("--- End of History ---\n")
                elif data["type"] == "message":
                    msg = data["message"]
                    print(f"\n{msg['username']}: {msg['message']}")

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
