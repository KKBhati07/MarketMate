
from django.urls import path

from .views import RoomView

urlpatterns = [
    path('fetch/', RoomView.as_view(),name="rooms"),
]
