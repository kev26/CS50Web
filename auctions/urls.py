from collections import namedtuple
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("create", views.create, name="create"),
    path("listings/<int:listing_id>", views.listing, name="listing"),
    path("categories", views.categories, name='categories'),
    path("categories/<str:name>", views.category, name='category'),
    path("watchlist", views.watchlist, name='watchlist'),
    path("<int:item_id>/add", views.addwatchlist, name="addwatchlist"),
    path("<int:item_id>/remove", views.removewatchlist, name="removewatchlist"),
    path("listings/<int:id>/placebid", views.placebid, name="placebid"),
    path("mylist", views.mylist, name="mylist"),
    path("<int:item_id>/close", views.closeauction, name="closeauction"),
    path("listings/<int:item_id>/comment", views.comment, name="comment")
]
