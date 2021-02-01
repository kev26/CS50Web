from logging import setLoggerClass
from django.conf.urls import url
from django.http import request
from django.shortcuts import render, redirect
from django.urls import reverse
from django import forms
from django.contrib import messages
import markdown2
import random
from . import util


class NewPageForm(forms.Form):
    title = forms.CharField(label="Title")
    content = forms.CharField(label='Content' , widget=forms.Textarea)

class EditPageForm(forms.Form):
    content = forms.CharField(label='Content', widget=forms.Textarea)


def index(request):
    return render(request, "encyclopedia/index.html", {
        "entries": util.list_entries()
    })

def wiki(request, title):
    # if an entry is requested that does not exist --> display "requested page was not found!"
    if util.get_entry(title) == None:
        return render(request, "encyclopedia/wiki.html", {
            "none": util.get_entry(title) == None
        })

    # if the entry does exist --> display the page include the name of the entry
    return render(request, "encyclopedia/wiki.html", {
        "content": markdown2.markdown(util.get_entry(title)),
        "title": title
    })

def search(request):
    # Create variable for search, list entries and content
    search_entry = request.GET['q']
    results = []
    index = 0

    if request.method == "GET":
        # If the query matches the name of an entry
        for entry in util.list_entries():
            if entry.upper() == search_entry.upper():
                return redirect(reverse("wiki", args=(entry,)))
            # If the query doesn't matches the name of an encyclopedia --> Check substring
            elif len(search_entry) <= len(entry) and search_entry != "":
                for i in entry[index:]:
                    # If substring matches --> add that entry into the results list
                    if search_entry.upper() == entry[index:index + len(search_entry)].upper():
                        results.append(entry)
                        break
                    # Check next character
                    else:
                        index += 1
                # Return index = 0 for check next word
                index = 0
        if results != []:
            return render(request, "encyclopedia/search.html", {
                "results": results
            })
        else:
            return render(request, "encyclopedia/search.html", {
                "none": True
            })

def create(request):
    # Check if method is POST
    if request.method == "POST":
        # Take in the data the user submitted and save it as form
        form = NewPageForm(request.POST)
        # Check if form data is valid
        if form.is_valid():
            entry = form.cleaned_data["title"]
            content = form.cleaned_data["content"]
            for i in util.list_entries():
                if entry.upper() == i.upper():
                    util.save_entry(entry, content)
                    messages.error(request, 'Entry already exists. The content has been updated!')
                    return redirect('create')
            util.save_entry(entry, content)
            return redirect(f"wiki/{entry}", {
                "content": util.get_entry(entry)
            })
    return render(request, 'encyclopedia/create.html', {
        "form": NewPageForm()
    })

def edit(request, title):
    if request.method == "POST":
        form = EditPageForm(request.POST)
        if form.is_valid():
            content = form.cleaned_data["content"]
            util.save_entry(title, content)
            return redirect(reverse('wiki', args=(title,)))

    content = util.get_entry(title)
    return render(request, "encyclopedia/edit.html", {
        'title': title,
        'form': EditPageForm(initial={'content': content})
    })
    
def randompage(request):
    # Get list entries
    entries = util.list_entries()
    # Get random result
    result = random.choice(entries)
    return redirect(reverse('wiki', args=(result,)))