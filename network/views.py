from ast import Try
from enum import Flag
from inspect import Parameter
import json
import profile
from tkinter.tix import Tree
from turtle import pos
from wsgiref.util import request_uri
import django
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import redirect, render
from django.urls import reverse
from django.core.paginator import Paginator

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

        notname = ['following', 'all']
        if username in notname:
            return render(request, "network/register.html", {
                "message": f"Can't create user with name '{username}'"
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
    posts(request ,'all')

    return JsonResponse({"message": "Post has been created successfully."}, status=201)


def posts(request, name):

    if name == 'all':
        posts = Post.objects.order_by("-timestamp").all()
    elif name == 'following':
        posts = Post.objects.filter(user__followers=request.user).order_by("-timestamp")
    else:
        posts = Post.objects.filter(user__username = name).order_by("-timestamp")

    return JsonResponse([post.serialize() for post in posts], safe=False)


def postid(request, id):

    if request.method == "GET":
        post = Post.objects.get(id=id)

    elif request.method == "PUT":
        data = json.loads(request.body)
        post = Post.objects.get(id=id)
        if 'content' in data:
            post.content = data['content']

        elif 'userlike' in data:
            # Get user object from userid liked
            user = User.objects.get(id=data['userlike'])

            if user in post.likes.all():
                post.likes.remove(user)
            else:
                post.likes.add(user)
        post.save()

    return JsonResponse(post.serialize(), safe=False)


def profile(request, name):

    try:
        p = User.objects.get(username=name)
    except User.DoesNotExist:
        return JsonResponse({"Error: ": "User not found."}, status=404)

    if request.method == "GET":
        return JsonResponse(p.serialize(), safe=False)

    # Follow or Unfollow event
    elif request.method == "PUT":
        # Get data in json file from fetch PUT
        data = json.loads(request.body)
        
        # Get User object of that profile page
        pu = User.objects.get(username=name)

        # Get main User
        mu = User.objects.get(username=request.user)

        if data['action'] == 'follow':
           pu.followers.add(mu)
           mu.following.add(pu)
        elif data['action'] == 'unfollow':
           pu.followers.remove(mu)
           mu.following.remove(pu)
        return JsonResponse(pu.serialize(), safe=False)
        
    else:
        return JsonResponse({
            'Error: ': 'GET or PUT request required.'}, status=400)



