from django.conf.urls import url
from django.contrib.auth import views as auth_views

from . import views

urlpatterns = [
    # COMPONENTS
    url(r'^component/menu$', views.menu, name='menu'),
    url(r'^component/notebook/(?P<code>[^/]+)$',
        views.notebook, name='notebook'),

    # API FOR REST
    url(r'^dataset/upload$', views.upload_dataset, name='upload_dataset'),
    url(r'^dataset/delete$', views.delete_dataset, name='delete_dataset'),
    url(r'^dataset/rename$', views.rename_dataset, name='rename_dataset'),
    url(r'^notebook/create$', views.create_notebook, name='new_notebook'),
    url(r'^notebook/delete$', views.delete_notebook, name='delete_notebook'),
    url(r'^notebook/rename$', views.rename_notebook, name='rename_notebook'),

    # ADMINISTRATION
    url(r'^login/$', auth_views.LoginView.as_view(), name='login'),
    url(r'^logout/$', auth_views.LogoutView.as_view(), name='logout'),
    url(r'^register/$', views.register, name='register'),

    # PAGES
    url(r'^$', views.page_index, name='page_index'),
    url(r'^notebook/(?P<code>[^/]+)$', views.page_notebook, name='page_notebook'),
]
