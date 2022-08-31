import datetime
import sys, os
import socket

from asgiref.sync import async_to_sync, sync_to_async
from channels.db import database_sync_to_async
from channels.layers import get_channel_layer

from .models import Task, Notebook, User

@database_sync_to_async
def command(group, notebook_code, command, data, username):
    """
    Executes command and sends response to group.
        :param group: channel layers group name
        :param notebook_code: code of the notebook being executed
        :param command: command to be executed 
        :param data: data of opened notebook
        :param username: author of the command
    """
    try:
        if command in commands:
            return commands[command](group, notebook_code, command, data, username), False
        else:
            return 'command not found', True
    except Exception as e:
        return str(e), True


class ServerError(Exception):
    def __init__(self, message):
        super().__init__(message)


#################################################################################
#COMMANDS

def help_command(group, notebook_code, command, data, username):
    """
    Returns the text of the help command
        :param group: user group
        :param notebook_code: opened notebook code
        :param command: posted command with parameteers
        :param data: notebook data
        :param username: user username
    """

    return "commands:\
            <hr>run - run a computation, adds task to the computation queue\
            <hr>stop - stop running task or remove it from task queue\
            <hr>help - show help"


def stop_command(group, notebook_code, command, data, username):
    """
    Sends the stop command to the computation backend
        :param group: user group
        :param notebook_code: opened notebook code
        :param command: posted command with parameteers
        :param data: notebook data
        :param username: user username
    """
    
    notebook = Notebook.objects.filter(code=notebook_code)
    if notebook.count() == 1:
        notebook = notebook[0]
    else:
        raise ServerError('The notbook you are working on has been deleted, sorry.')

    task = Task.objects.filter(notebook=notebook)

    if task.count() == 1:
        task = task[0]
    else:
        raise ServerError('No queued tasks found.')  

    if task.running:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        host = '0.0.0.0'
        port = 9001

        try:
            sock.connect((host, port))
            sent = sock.send(b'stop')
            if sent == 0:
                raise ServerError('Error sending notification to background server.')
        except:
            raise ServerError('Computational server down, repeat request later.')  
        return "Stop requested, please wait."
    else:
        task.delete()
        return "Task removed from queue."
    



def run_command(group, notebook_code, command, data, username):
    """
    Create new task for processing queue.

        :param group: user channels socket group
        :param notebook_code: code of source notebook code
        :param command: command with all parameters
        :param data: sent notebook data
        :param username: username of who sent the command
    """

    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    host = '0.0.0.0'
    port = 9001

    message = ''
    
    notebook = Notebook.objects.filter(code=notebook_code)
    if notebook.count() == 1:
        notebook = notebook[0]
    else:
        raise ServerError('The notbook you are working on has been deleted, sorry.')

    user = User.objects.filter(username=username)

    if user.count() == 1:
        user = user[0]
    else:
        raise ServerError('We couldn\'t identify you as a user, sorry, save your work and try logging out/in.')

    task = Task.objects.filter(notebook=notebook)
    new = False

    if task.count() == 1:
        task = task[0]
        message = 'Updating task in queue...<hr>'
    else:
        task = Task(notebook=notebook, user=user, group=notebook_code) #notebook_code is correct
        new = True

    if task.running:
        raise ServerError(message + 'Can\'t update running task, let it finish, or stop the execution.')

    task.data = data
    task.save()

    if message != "":
        message += 'Task has been updated<hr>'

    try:
        sock.connect((host, port))
        sent = sock.send(b'new')
        if sent == 0:
            raise ServerError(message + 'Error sending notification to background server.')
    except:
        return message + 'Computational server is down, the task has been saved into \
            queue and the computation will be performed as soon as the computational \
            server is back up.<hr>You can remove it from the queue with the "stop" \
            command or override current task with new "run" command.'

    if new:
        return message + 'Calculation succesfully added to task queue, please wait.'
    else:
        return message + 'Calculation alredy in queue, contents modified.'

    #notebook = Notebook.objects.filter(code=notebook_code)
    #task = Task()
    #send(group, 'Calculation succesfully added to task queue, please wait.', username=username, done=True)

    #graph = pipeline.load_graph(data)
    #order = pipeline.topological_sort(graph)
    #send(group, 'No cycles detected, computing...', username=username)
    #pipeline.compute(notebook_code, graph, order, lambda m:  send(group, m, username=username))
    #canvas_update(group, notebook_code, username=username)

commands = { 'help': help_command, 'run': run_command, 'stop': stop_command }
