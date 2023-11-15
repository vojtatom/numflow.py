import os
import pytest


def data_dir():
    package_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'testdata')
    return package_dir


@pytest.fixture(scope='function')
def rectilinear_csv_data():
    dataset_path = os.path.join(data_dir(), 'rectilinear.csv')
    yield dataset_path
    
    
@pytest.fixture(scope='function')
def sun_csv_data():
    dataset_path = os.path.join(data_dir(), 'sun.csv')
    yield dataset_path
