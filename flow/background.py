import gc
import json
import os
import socket
import sys
from threading import Condition, Event, Thread
from time import sleep

import django
import websocket


sys.path.append(".") 
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "flow.settings")
django.setup()

from visual.models import Notebook, Task
from visual.modules.editor import pipeline


HOST = '0.0.0.0'
PORT_RECIEVE = 9001
PORT_SEND = 9000
ADDRESS = '/ws/terminal/'
END = '/'

FORMATED_STR_CONTACT = 'ws://' + HOST + ':' + str(PORT_SEND) + ADDRESS + '{}' + END


class bcolors:
    OKBLUE = '\033[94m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m' 
    BOLD = '\033[1m'


def printImport(text):
    print(bcolors.OKBLUE +  bcolors.BOLD + str(text) + bcolors.ENDC)

def printOK(text):
    print(bcolors.OKGREEN +  bcolors.BOLD + str(text) + bcolors.ENDC)

def printWarning(text):
    print(bcolors.WARNING + bcolors.BOLD + str(text) + bcolors.ENDC)

def printFail(text):
    print(bcolors.FAIL + bcolors.BOLD + str(text) + bcolors.ENDC)
        


def task_manager(update, abort):
    """
    Task manager managing incoming calls.
        :param update: Conditional being notified on aqisition of new tasks
        :param abort: Abort flag (Event) for checking wether user has requested abort
    """

    # create socket managing incoming calls
    serversocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    serversocket.bind((HOST, PORT_RECIEVE))
    serversocket.listen(5)
    printOK('>> server started and listening')

    #loop forever
    while True:    
        conn, addr = serversocket.accept()
        data = conn.recv(1024)   
        printImport('>> received data: {}'.format(data))
        printImport('>> connection address: {}'.format(addr))
        conn.close()

        with update:
            if data == b'new':
                printWarning('>> making resource available, notify')
                update.notifyAll()
            if data == b'stop':
                printWarning('>> setting stop event')
                abort.set()


def get_task():
    try:
        task = Task.objects.earliest('time_created')
        task.running = True
        task.save()
        return task
    except:
        return None

def checkAbort(abort, sock, group):
    if abort.is_set():
        printFail('<< abborting task {}'.format(group))
        sock.send(json.dumps({'message': 'Task aborted', 'error': False}))
        return True
    return False


def trySend(message, sock):
    try:
        sock.send(json.dumps({'message': message, 'error': False}))
    except:
        printFail("<< communication failed, message: {}".format(message))


def task_pipeline(update, abort):
    """
    Processing pipeline, second thread.
        :param update: Conditional being notified on aqisition of new tasks
        :param abort: Abort flag (Event) for checking wether user has requested abort
    """

    printOK('<< starting pipeline')
    
    # infinite looping to check for new tasks
    while True:
        print('<< getting new task')
        with update:
            task = get_task()

        while task is not None:
            group = task.group
            printOK('<< started processing of new task {}, {}'.format(group, task.user.username))
            # connect to user group
            print('<< connecting to client via server...')
            sock = websocket.create_connection(FORMATED_STR_CONTACT.format(task.group))
            sock.send(json.dumps({'message': 'Running task...', 'error': False}))
            print('<< task socket connected')

            #actuall processing     
            if checkAbort(abort, sock, group):
                break

            try:
                # load graph
                graph = pipeline.load_graph(task.data)
                if checkAbort(abort, sock, group):
                    break

                # order graph
                order = pipeline.topological_sort(graph)
                sock.send(json.dumps({'message': 'No cycles detected, computing...', 'error': False}))
                if checkAbort(abort, sock, group):
                    break

                # evaluate/compute
                sender = lambda m: trySend(m, sock)
                pipeline.compute(task.notebook.code, graph, order, sender, abort)
            
                #check for abort during compute
                if checkAbort(abort, sock, group):
                    break
                
                #update canvas
                sock.send(json.dumps({'canvas': group, 'error': False}))

                del graph, order
            except Exception as e:
                sock.send(json.dumps({'message': str(e), 'error': True}))

            # end of actual processing
            sock.send(json.dumps({'message': 'Processing finished', 'error': False}))
            sock.close()
            printOK('<< pipeline finished')
            del sock
            
            #update and check for new
            with update:
                printWarning('<< deleting finished task {}'.format(group))
                task.delete()
                del task
                abort.clear()
                print('<< getting new task')
                task = get_task()
            gc.collect()

        with update:
            print('<< pipeline waiting')
            update.wait()


def main():
    updating = Condition()
    abort = Event()

    socket_thread = Thread(target=task_manager, args=(updating, abort))
    socket_thread.start()

    pipeline_thread = Thread(target=task_pipeline, args=(updating, abort))
    pipeline_thread.start()
    
    pipeline_thread.join()
    socket_thread.join()


if __name__ == '__main__':
    main()
