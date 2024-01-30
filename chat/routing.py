from django.urls import path

from .consumer import ChatConsumer

ws_urlpatterns=[
    path("ws/chat/<str:receiver_id>/",ChatConsumer.as_asgi()),
]