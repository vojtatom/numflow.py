import json
import os
import uuid

from django.conf import settings
from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(max_length=500, blank=True)
    location = models.CharField(max_length=30, blank=True)
    birth_date = models.DateField(null=True, blank=True)

    objects = models.Manager()


@receiver(post_save, sender=User)
def update_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
    instance.profile.save()

###########################################################################

def directory_path(instance, filename):
    """
    Create path for Dataset file
    """

    extension = filename.split('.')[1]
    return 'data/{}/raw/raw.{}'.format(str(instance.code), extension)

class Dataset(models.Model):
    title = models.CharField(max_length=255)
    code = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False)
    time_created = models.DateTimeField(auto_now_add=True)
    data = models.FileField(upload_to=directory_path, blank=False)
    status = models.IntegerField(default=0)
    owners = models.ManyToManyField(User, related_name="owners")

    objects = models.Manager()


    def __str__(self):
        return "{} / {}".format(str(self.title), self.time_created)


@receiver(models.signals.post_delete, sender=Dataset)
def auto_delete_file_on_delete(sender, instance, **kwargs):
    """
    Deletes file from filesystem
    when corresponding `Dataset` object is deleted.
    """

    if instance.data and os.path.isfile(instance.data.path):
        os.remove(instance.data.path)


###########################################################################

class Notebook(models.Model):
    title = models.CharField(max_length=255, default="New Notebook")
    code = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False)
    time_created = models.DateTimeField(auto_now_add=True)
    time_modified = models.DateTimeField(auto_now=True)
    data = models.TextField()

    authors = models.ManyToManyField(User, related_name="authors")

    objects = models.Manager()
