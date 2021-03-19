from typing import List
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.deletion import CASCADE
from django.db.models.fields import EmailField, NOT_PROVIDED
from django.db.models.signals import pre_save
from django.dispatch import receiver
from itertools import groupby

class User(AbstractUser):
    pass

class Category(models.Model):
    name = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.name}"

class Listing(models.Model):
    title = models.CharField(max_length=64)
    description = models.TextField(max_length=250)
    price = models.FloatField()
    current_price = models.FloatField(default=0)
    image_url = models.CharField(max_length=150)
    category = models.ForeignKey(Category, on_delete=models.CASCADE,default='NONE')
    listed_by = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.BooleanField(default=True)

    # Set default current_pice = price
    def save(self, *args, **kwargs):
        if self.current_price == 0:
            self.current_price = self.price
        super(Listing, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.title}" #{self.description} {self.price} {self.image_url} {self.category}"

class Watchlist(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    items = models.ManyToManyField(Listing, blank=True)
    
    def __str__(self):
        return f"{self.user}"

class Bid(models.Model):
    item = models.OneToOneField(Listing, on_delete=models.CASCADE)
    bid = models.FloatField(default=0)
    user_bid = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True)
    count = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.item} {self.bid} {self.user_bid}"
    
class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    item = models.ForeignKey(Listing, on_delete=models.CASCADE)
    comment = models.TextField(max_length=250)
    datetime = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.item} {self.comment} {self.datetime}"
