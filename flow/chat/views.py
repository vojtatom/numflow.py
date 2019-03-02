import json

from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.db.models import Count
from django.http import JsonResponse
from django.shortcuts import render
from django.utils.safestring import mark_safe
from django.shortcuts import redirect

from .forms import CreateChatForm
from .models import Chatroom, Message

@login_required
def index(request):
    if request.method == 'POST':
        form = CreateChatForm(request.POST)
        if form.is_valid():
            data = form.cleaned_data
            names = data['users'].split(", ")
            names.append(request.user.username)
            users = User.objects.filter(username__in=names)

            if users.count() < 2:
                #there is noone to send it to...
                return render(request, 'chat/index.html', {'form': form})
            
            rooms = Chatroom.objects.filter(users__in=users)
            rooms = rooms.annotate(num_users=Count('users')).filter(num_users=users.count())
            #print(rooms, Count(rooms))

            if not rooms.exists():
                rooms = Chatroom()
                rooms.save()
                rooms.users.set(users)
            else:
                rooms = rooms.get()
            message = Message(text=data['message'], sender=request.user, chatroom=rooms)
            message.save()
            
            #print("message saved", rooms)
            return redirect('chat:room', chatroom=str(rooms.name))

    form = CreateChatForm()

    chats = Chatroom.objects.filter(users=request.user)
    return render(request, 'chat/index.html', {'form': form, 'chats': chats})


@login_required
def room(request, chatroom):
    return render(request, 'chat/room.html', {
        'room_name_json': mark_safe(json.dumps(chatroom))
    })

@login_required
def get_usernames(request):
    if request.method == 'POST':
        data = json.loads(request.body)

        if len(data['query']) < 1:
            return JsonResponse({ "users" : [] })

        users = User.objects.filter(username__regex=r'^{}'.format(data['query']))
        users = users.exclude(username=request.user)
        users = [ {'name' : x.username } for x in users ]
        return JsonResponse({ "users" : users })

@login_required
def get_messages(request):
    if request.method == 'POST':
        r_data = json.loads(request.body)

        data = Message.objects.filter(chatroom=r_data['chatroom'])
        pagination = 50
        length = data.count()
        start = min(r_data['page'] * pagination, length)
        end = min(r_data['page'] * pagination + pagination, length + pagination)
        data = data.order_by('-time')[start:end]
        return JsonResponse({ "messages" : [d.get_json() for d in data], "more": length > end })

@login_required
def leave_room(request):
    pass
