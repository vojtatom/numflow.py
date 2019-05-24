import os
import threading

from visual.models import Dataset
from . import io

def process(dataset: Dataset):
    """
    Launch a dataset processing in separate thread.
        :param dataset: dataset model 
    """

    # launch processing in background
    t = threading.Thread(target=process_data, args=(dataset,))
    t.setDaemon(True)
    t.start()


def process_data(dataset: Dataset):
    """
    Processes uploaded data and prepares
    data for visualization.
        :param dataset: dataset model 
    """

    try:
        io.check_file(dataset)
        dataset.status = 1
    except:
        dataset.status = -1
    
    dataset.save()
