from numflow.dataset import Dataset
from numflow.compute import RectilinearField3D


def test_dataset_kernel(rectilinear_csv_data: str):
    dataset = Dataset(rectilinear_csv_data)
    assert dataset.file_name == rectilinear_csv_data
    assert type(dataset.data) == RectilinearField3D
