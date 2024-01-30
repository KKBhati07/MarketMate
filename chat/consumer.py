import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from users.models import User
from .models import Room, Message
from django.db import transaction
from marketmate.gcs_config import generate_signed_url

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # if the user is not authenticated
        if not self.scope["user"].is_authenticated:
            self.receiver_group_name = None
            return

        self.room_name=self.receiver_id = self.scope['url_route']['kwargs']['receiver_id']
        self.sender_name = self.scope["user"].name
        self.room_exists=False
        if self.scope["user"].id==self.receiver_id:

            self.room_name=self.receiver_id
        else:
            self.room_name=self.get_room_name(sender_id=self.scope["user"].id,receiver_id=self.receiver_id)
            self.room_exists,self.room = await self.create_or_get_room()

        # Checking if the room already exists, if not, creating it
        self.receiver_group_name = f"chat_{self.room_name}"

        # Join room group
        await self.channel_layer.group_add(
            self.receiver_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # to leave room group
        if self.receiver_group_name:
            await self.channel_layer.group_discard(
                self.receiver_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        # message from socket
        data = json.loads(text_data)
        message = data['message']

        # Save the chat message to the database
        await self.save_chat_message(message)

        receiver_group_name = f"chat_{self.receiver_id}"
        username=self.scope["user"].name
        if not self.room_exists:
            if self.scope["user"].profile_picture:
                profile_picture=self.scope["user"].profile_picture
            else:
                profile_picture=""
                
            if profile_picture:
                profile_picture=generate_signed_url(profile_picture,True)
            await self.channel_layer.group_send(
                receiver_group_name,
                {
                    'type': 'chat.message',
                    'message': {
                        "senderId":self.scope["user"].id,
                        "message":message,
                        "profilePic":profile_picture,
                        "username":username,
                        "roomExists":False,
                    },
                }
            )

            self.room_exists=True

        else:
        # Sending message to the receiver's group
            await self.channel_layer.group_send(
                receiver_group_name,
                {
                    'type': 'chat.message',
                    'message': {
                        "senderId":self.scope["user"].id,
                        "message":message,
                        "username":username,
                        "roomExists":True,
                    },

                }
            )

    async def chat_message(self, event=None,message=None):
        # Send message to WebSocket
        if not message:
            message = event['message']
        await self.send(text_data=json.dumps({
            'message': message
        }))

    # to get the room name or create one
    @database_sync_to_async
    def create_or_get_room(self):
        room_exists=False
        # Check if the room already exists
        with transaction.atomic():
            try:
                room = Room.objects.get(room_name=self.room_name)
                room_exists=True
            except Room.DoesNotExist:
                sender = User.objects.get(id=self.scope["user"].id)
                receiver = User.objects.get(id=self.receiver_id)
                room = Room.objects.create(sender=sender,receiver=receiver, room_name=self.room_name)
            except Exception as e:
                return room_exists
        return room_exists,room
    
    # to save new chat message to the database
    @database_sync_to_async
    def save_chat_message(self, message):
        with transaction.atomic():
            try:
                sender = User.objects.get(id=self.scope["user"].id)
                receiver = User.objects.get(id=str(self.receiver_id))
                message = Message.objects.create(room=self.room, from_user=sender, to_user=receiver, text=message)
            except User.DoesNotExist:
                self.chat_message(message="User Does not exist!")

    # getting unique room name by combining receiver and senders id       
    def get_room_name(self,sender_id,receiver_id):
        user_ids=sorted([sender_id,receiver_id])
        return f"{user_ids[0]}_{user_ids[1]}"


