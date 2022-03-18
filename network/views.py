from enum import Flag
from inspect import Parameter
import json
import profile
from wsgiref.util import request_uri
import django
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import redirect, render
from django.urls import reverse

from .models import Post, User


def index(request):
    if request.user.is_authenticated:
        return render(request, "network/index.html")
    else:
        return redirect(reverse('login'))



def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


def newpost(request):

    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    # Load json file from js fetch
    data = json.loads(request.body)
    content = data['content']

    # Create Post model
    post = Post.objects.create(user=request.user, content=content)
    post.save()
    posts(request)

    return JsonResponse({"message": "Post has been created successfully."}, status=201)
    

def posts(request):
    
    posts = Post.objects.order_by("-timestamp").all()
    return JsonResponse([post.serialize() for post in posts], safe=False)
    

def profile(request, username):

    if request.method == "GET":
        profile = User.objects.get(username=username)
        return JsonResponse(profile.serialize(), safe=False)

    elif request.method == "PUT":
        data = json.loads(request.body)
        print(data)
