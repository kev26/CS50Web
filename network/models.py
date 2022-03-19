from itertools import count
from pyexpat import model
from sqlite3 import Timestamp
from statistics import mode
from tkinter import CASCADE
from typing import Tuple
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    followers = models.ManyToManyField('self', blank=True, null=True)
    following = models.ManyToManyField('self', blank=True, null=True)

    def serialize(self):
        return {
            'userid': self.id,
            'user': self.username,
            'followers': [self.username for user in self.followers.all()],
            'following': [self.username for user in self.following.all()],
        }

class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.CharField(max_length=1000)
    timestamp = models.DateTimeField(auto_now_add=True)

    def serialize(self):
        return {
            "postid": self.id,
            "user": self.user.username,
            "content": self.content,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
        }

