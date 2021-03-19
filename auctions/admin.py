from django.contrib import admin
from django.contrib.admin.options import ModelAdmin
from django.contrib.auth import models
from django.contrib.auth.admin import UserAdmin
from django.db.models.base import Model
from django.urls.base import clear_script_prefix
from .models import Listing, Bid, Comment, Category, User, Watchlist
from .forms import NewListingForm


class CommentInline(admin.TabularInline):
    model = Comment

class ItemAdmin(admin.ModelAdmin):
    inlines = [
        CommentInline,
    ]

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('item','user','comment','datetime',)
    list_filter = ('item',)




@admin.register(Listing)
class ListingsAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'description', 'price',
                    'image_url', 'category', 'listed_by', 'status')


@admin.register(Watchlist)
class WatchlistAdmin(admin.ModelAdmin):
    list_display =('user',)
    filter_horizontal = ('items',)


@admin.register(Bid)
class BidlistAdmin(admin.ModelAdmin):
    list_display = ('id','item','bid', 'count','user_bid',)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    pass


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    pass
