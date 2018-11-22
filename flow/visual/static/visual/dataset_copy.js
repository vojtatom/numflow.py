'use strict';

class UIDatasetCopy {
    static create(dataset) {
        let copy_element = dataset.getElementsByClassName('dataset_copy')[0];
        
        copy_element.onclick = function(e) {
            let code = this.parentElement.id
            let dummy = document.createElement("input");
            let tooltip = dataset.getElementsByClassName('tooltiptext')[0];

            document.body.appendChild(dummy);
            dummy.setAttribute("id", "dummy_id");
            document.getElementById("dummy_id").value=code;
            dummy.select();
            document.execCommand("copy");
            document.body.removeChild(dummy);

            tooltip.innerHTML = "copied!";
        
            setTimeout(function() {
                tooltip.innerHTML = "copy code";
            }, 1000)
        };
    }


}