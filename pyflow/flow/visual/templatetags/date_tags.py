import datetime
from django.utils import timezone 

from django import template

register = template.Library()

@register.filter
def is_today(time):
    return time.date() == datetime.datetime.today().date() # or timezone.now()