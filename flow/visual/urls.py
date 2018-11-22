from django.conf.urls import url
from django.contrib.auth import views as auth_views

from . import views

urlpatterns = [
    url(r'^component/menu$', views.menu, name='menu'),
    url(r'^upload$', views.upload, name='upload'),
    url(r'^delete/dataset/(?P<id>[^/]+)$', views.deleteDataset, name='deleteDataset'),
    url(r'^rename/dataset$', views.renameDataset, name='deleteDataset'),

    url(r'^login/$', auth_views.LoginView.as_view(), name='login'),
    url(r'^logout/$', auth_views.LogoutView.as_view(), name='logout'),
    url(r'^register/$', views.register,name='register'),
	url(r'^$', views.index, name='index'),
]
