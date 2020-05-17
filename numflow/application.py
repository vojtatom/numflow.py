import sys
from .write import printOK

##### COMMUNICATION ###
# On error: backend sends json with status "error" and message explaining the error
# On success: backend sends json with status "okay", explanatory message and action identification
# describing the succesful action
#
#
#
#
#
#
#
#


from .load import load, sample_rectilinear_dataset
from .exception import NumflowException

class Application:
    def __init__(self):
        self.datasets = {}
        self.commands = {
            'open': self.open
        }


    def process(self, data):
        printOK("app got {}".format(data))
        
        try:
            #there has to be a command in the data dictionary
            if 'command' not in data:
                return {'status': 'error', 'message': ''}

            if data['command'] in self.commands:
                return self.commands[data['command']](data)

        except NumflowException as e:
            return {'status': 'error',
                    'message': e.title }
        except e:
            return {'status': 'error',
                    'message': str(e) } 


    def open(self, data):
        #try opening the new dataset
        filename = data['filename']


        def response(dataset, filename):
            return {'status': 'okay',
                    'action': 'dataset_loaded',
                    'message': 'Dataset loaded',
                    'file': filename,
                    'res': dataset.res,
                    'mode': dataset.type }


        if filename in self.datasets:
            return response(self.datasets[filename], filename)

        self.datasets[filename] = load(filename, mode='c')

        printOK('loaded')
        #data = sample_rectilinear_dataset(self.dataset, 16, 16, 16)
        
        return response(self.datasets[filename], filename)
    