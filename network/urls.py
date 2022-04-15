
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API Routes
    path("newpost", views.newpost, name="newpost"),
    path("posts/<str:name>/<int:numpage>", views.posts, name="posts"),
    path("post/<int:id>", views.postid, name="postid"),
    path("profile/<str:name>", views.profile, name="profile"),
]
