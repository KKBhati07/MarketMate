from django.urls import path, include

# importing urls
from .users_urls import urlpatterns as users_urls
from .listings_urls import urlpatterns as listing_urls

urlpatterns = [
    # routing user related urls to users urls file
    path("users/", include(users_urls)),
    # routing listing related urls to listing urls file
    path("listings/", include(listing_urls)),
]
