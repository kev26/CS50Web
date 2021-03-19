from typing import ContextManager
from django import urls
from django.contrib.auth import authenticate, get_user, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.forms import fields
from django.forms.widgets import Textarea
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import redirect, render
from django.urls import reverse
from django import forms
from django.contrib import messages

from .models import Category, User, Listing, Bid, Comment, Watchlist
from .forms import NewListingForm, NewCommentForm

def index(request):
    return render(request, "auctions/index.html", {
        "lists": Listing.objects.exclude(status=False).all()
    })

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
            return render(request, "auctions/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "auctions/login.html")

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
            return render(request, "auctions/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "auctions/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "auctions/register.html")


@login_required(login_url='login')
def create(request):
    if request.method == "POST":
        form = NewListingForm(request.POST)
        if form.is_valid():
            form.instance.listed_by = request.user
            form.save()
            #print(Listing.objects.all())
            messages.success(request,'Created Success')
        else:
            return render(request, "auctions/create.html", {
                "form":form
            })
    return render(request, "auctions/create.html", {
        "form": NewListingForm()
    })

def listing(request, listing_id):
    Bid.objects.get_or_create(item_id=listing_id)
    # Check if item had closed --> notification user won !
    item = Listing.objects.get(pk=listing_id) 
    if item.status == False:
        # If user win == user logging
        if request.user == Bid.objects.get(item_id=listing_id).user_bid:
            return render(request, "auctions/notification.html", {
                "notifi": True
            })
        return render(request, "auctions/notification.html", {
            "name":Bid.objects.get(item_id=listing_id).user_bid
        })
    return render(request, "auctions/listings.html", {
        "item": Listing.objects.get(pk=listing_id),
        "bidobj": Bid.objects.get(item_id=listing_id),
        "commentform":NewCommentForm(),
        # Display comment with sorting 
        "commentlists": Comment.objects.filter(item_id=listing_id).order_by('-datetime')
    })

def categories(request):
    return render(request, "auctions/Categories.html", {
        "lists":Category.objects.all()
    })

def category(request, name):
    return render(request, "auctions/category.html",{
        'category': Listing.objects.filter(category__name=name).exclude(status=False),
        'name': name
    })


@login_required(login_url='login')
def watchlist(request):
    # Create object if object doesn't exist
    Watchlist.objects.get_or_create(user=request.user)
    # Accessing that Object
    user = Watchlist.objects.get(user=request.user)
    lists = user.items.all()
    return render(request, 'auctions/watchlist.html', {
        "lists":lists
    })


@login_required(login_url='login')
def addwatchlist(request,item_id):
    # Create new user in the Watch list if the user doesn't exist
    Watchlist.objects.get_or_create(user=request.user)
    # Accessing the user
    user = Watchlist.objects.get(user=request.user)
    # Get item
    item = Listing.objects.get(pk=item_id)
    # Add item in Watchlist
    user.items.add(item)
    return redirect(watchlist)


@login_required(login_url='login')
def removewatchlist(request,item_id):
    # Accessing the user
    user = Watchlist.objects.get(user=request.user)
    # Get item
    item = Listing.objects.get(pk=item_id)
    # Add item in Watchlist
    user.items.remove(item)
    return redirect(watchlist)


@login_required(login_url='login')
def placebid(request, id):
    if request.method == "POST":
        # Get start price item
        startpr = Listing.objects.get(pk=id).price
        # Get or Create Bid object
        Bid.objects.get_or_create(item_id=id)
        # Get new bid
        newbid = float(request.POST['bid'])
        # Get old bid
        oldbid = Bid.objects.get(item_id=id).bid
        # Get Bid.count
        count = Bid.objects.get(item_id=id).count
        if newbid >= startpr and count == 0:
            Bid.objects.filter(item_id=id).update(bid=newbid, user_bid=request.user, count=count+1)
            # Update new Price for Listing
            Listing.objects.filter(pk=id).update(current_price=newbid)
            messages.success(request, "You're the first bidder. Good Luck!")
            return redirect("listing", id)
        elif startpr < newbid > oldbid:
            # Create new Bid object or update if it does existed
            Bid.objects.filter(item_id=id).update(bid=newbid, user_bid=request.user, count=count+1)
            # Update new Price for Listing
            Listing.objects.filter(pk=id).update(current_price=newbid)
            messages.success(request, "You're the highest bidder!")
            return redirect("listing", id) 
        messages.error(request, "Your bid is not valid")
        return redirect("listing", id)


@login_required(login_url='login')
def mylist(request):
    return render(request, "auctions/mylist.html",{
        "lists": Listing.objects.filter(listed_by=request.user).exclude(status=False)
    })

@login_required(login_url='login')
def closeauction(request, item_id):
    if request.user == Listing.objects.get(pk=item_id).listed_by:
        Listing.objects.filter(pk=item_id).update(status=False)
        return redirect(mylist)
    return redirect(mylist)


@login_required(login_url='login')
def comment(request, item_id):
    if request.method =="POST":
        form = NewCommentForm(request.POST)
        if form.is_valid():
            form.instance.user = User.objects.get(username=request.user)
            form.instance.item = Listing.objects.get(pk=item_id)
            form.save()
            return redirect(listing, item_id)
