from django.db import models
from users.models import User

# creating model for rooms
class Room(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sender')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='receiver')
    room_name=models.CharField(max_length=50,null=False,default=None)


# creating model to store messages
class Message(models.Model):
    room=models.ForeignKey(Room,on_delete=models.CASCADE)
    from_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='from_user')
    to_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='to_user')
    text=models.TextField(null=True,default=None)
    created_at = models.DateTimeField(auto_now_add=True)

    # adding index
    class Meta:
        indexes = [
            models.Index(fields=['created_at']),
        ]

