'use strict';

class UIDataset {
    static create(dataset) {
        UIDatasetDelete.create(dataset);
        UIDatasetCopy.create(dataset);
        UIDatasetEdit.create(dataset);

        let triggers = [...dataset.parentElement.parentElement.getElementsByClassName('detail_trigger')];
        triggers.forEach(element => {
            element.onclick = UIDataset.detail;
        });

    }

    static detail(e) {
        let detail = this.parentElement.parentElement.getElementsByClassName('dataset_detail')[0];
        if (detail.style.display == 'block'){
            detail.style.display = 'none';
            this.parentElement.classList.remove('active');
        } else {
            detail.style.display = 'block';           
            this.parentElement.classList.add('active');
        }
    }

}