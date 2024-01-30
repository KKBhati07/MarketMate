from django.db.models import Q
from django.http import JsonResponse
from .models import Room
from users.models import User
from django.views import View

from marketmate.gcs_config import generate_signed_url

# creating room View
class RoomView(View):
    def get(self,req):
        try:
            room_list=[]
            # getting rooms
            rooms = Room.objects.filter(Q(sender=req.user.id) | Q(receiver=req.user.id))
            for room in rooms:
                sender=User.objects.get(id=room.sender_id)
                receiver=User.objects.get(id=room.receiver_id)
                participant = sender if receiver.id == req.user.id else receiver
                profile=""
                if participant.profile_picture:
                    profile=generate_signed_url(participant.profile_picture,userProfile=True)
                room_info = {
                    'userId': participant.id,
                    'username': participant.name,
                    'profilePic':profile
                }
                room_list.append(room_info)
            return JsonResponse({"rooms": room_list})
        except Exception as e:
            return JsonResponse({"message":"Internal server error!"})

