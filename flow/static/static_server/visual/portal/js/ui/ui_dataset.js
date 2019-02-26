'use strict';

class UIDataset {
    static create(dataset) {
        UIFileDelete.create(dataset, '/dataset/delete', UIDataset.create);
        UIDatasetCopy.create(dataset);
        UIFileEdit.create(dataset, '/dataset/rename', UIDataset.create);
        UIFile.create(dataset);
    }
}