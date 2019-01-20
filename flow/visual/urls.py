from django.conf.urls import url
from django.contrib.auth import views as auth_views

from . import views

urlpatterns = [
    ## API FOR REST
    url(r'^dataset/delete$', views.delete_dataset, name='delete_dataset'),
    url(r'^dataset/rename$', views.rename_dataset, name='rename_dataset'),
    url(r'^notebook/delete$', views.delete_notebook, name='delete_notebook'),
    url(r'^notebook/rename$', views.rename_notebook, name='rename_notebook'),
    url(r'^notebook/data$', views.get_notebook, name='get_notebook'),
    url(r'^notebook/editor$', views.editor_nodes, name='editor_nodes'),
    url(r'^node/dataset$', views.node_dataset, name='node_dataset'),

    ## ADMINISTRATION
    url(r'^login/$', auth_views.LoginView.as_view(), name='login'),
    url(r'^logout/$', auth_views.LogoutView.as_view(), name='logout'),
    url(r'^register/$', views.register, name='register'),

    # PAGES
    url(r'^$', views.index, name='page_index'),
    url(r'^notebook/$', views.notebook, name='page_notebook'),
    url(r'^notebook/(?P<code>[^/]+)$', views.notebook, name='page_notebook'),
    url(r'^canvas/$', views.canvas, name='page_canvas'),
    url(r'^docs/$', views.docs, name='page_docs'),
]
