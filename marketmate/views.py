# importing important modules, classes and functions
from typing import Any
from django.http import HttpRequest,HttpResponse
from django.shortcuts import render
from django.views import View
from django.views.generic import TemplateView

# importing models
from listings.models import Listing,ListingImages

# for home view
class Home(View):
    def get(self,req:HttpRequest)->HttpResponse:
        category=req.GET.get("category",None)
        search=req.GET.get("search","")
        listings=Listing.objects.all()
        data={}
        for listing in listings:
            image=ListingImages.objects.filter(item_id=listing).first()
            data[listing]=image
        if not category:
            category="all"
        return render(req,"home.html",{"data":data,"category":category,"search":search})

class Cover(View):
    def get(self,req:HttpRequest)->HttpResponse:
        return render(req,"cover.html")


# to render the resource not found page
class ResourceNotFoundView(TemplateView):
    template_name="404.html"
    
