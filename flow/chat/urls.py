from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^users/$', views.get_usernames, name='get_usernames'),
    url(r'^messages/$', views.get_messages, name='get_messages'),
    url(r'^(?P<chatroom>[^/]+)/$', views.room, name='room'),
]
