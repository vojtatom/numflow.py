import os
import threading

from visual.models import Dataset
from . import io

def process(dataset: Dataset):
	# launch processing in background
	t = threading.Thread(target=process_data, args=(dataset,))
	t.setDaemon(True)
	t.start()


def process_data(dataset: Dataset):
    """
    Processes uploaded data and prepares
    data for visualization.
    """

    try:
        io.check_file(dataset)
        dataset.status = 1
    except:
        dataset.status = -1
    
    dataset.save()
