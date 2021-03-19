from django import forms
from django.core.exceptions import EmptyResultSet
from django.core.validators import EMPTY_VALUES
from django.db.models import fields
from django.forms import widgets, Textarea
from django.forms.fields import ChoiceField
from django.forms.models import ModelChoiceField

from .models import Bid, Category, Comment, Listing


class NewListingForm(forms.ModelForm):
    class Meta:
        model = Listing
        exclude = ['listed_by', 'current_price', 'status']

        widgets = {
            'title': forms.TextInput(attrs={'id':'fm-title', 'class':'input-form-control'}),
            'description': forms.Textarea(attrs={'id': 'discription', 'class': 'input-form-control'}),
            'price': forms.TextInput(attrs={'id': 'price', 'class': 'input-form-control'}),
            'image_url': forms.TextInput(attrs={'id': 'image_url', 'class': 'input-form-control'}),
            'category': forms.Select(attrs={'id': 'category', 'class': 'input-form-control'}),
        }

        

class NewCommentForm(forms.ModelForm):
    class Meta:
        model = Comment
        exclude = ['user', 'item', 'datetime']

        widgets = {
            'comment': forms.Textarea(attrs={'class':'ip-area'}),
        }
