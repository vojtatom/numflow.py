'use strict';

class SceneUI {
    constructor(){
        this.widgets = [];
        this.selected = 0;
    }


    addWidget(widget){
        this.widgets.push(widget);
    }

    get node() {
        let scene = document.createElement('div');
        scene.id = 'scene';

        for (let w of this.widgets){
            scene.appendChild(w.node);
        }

        return scene;
    }

    select(indexW, indexF){

        if (this.widgets.length <= indexW)
            return;

        this.selected = indexW;
        this.widgets[this.selected].select(indexF);
    }

    selectFirstField(){
        this.widgets[this.selected].selectFirstField();
    }

    selectLastField(){
        this.widgets[this.selected].selectLastField();
    }

    nextWidget(){
        this.widgets[this.selected].deselect();
        this.selected = (this.selected + 1) % this.widgets.length;
        this.widgets[this.selected].select(0);
    }

    previousWidget(){
        this.widgets[this.selected].deselect();
        this.selected = (this.selected - 1 + this.widgets.length) % this.widgets.length;
        this.widgets[this.selected].select(0);
    }

    get lastFieldSelected() {
        return this.widgets[this.selected].lastFieldSelected;
    }

    get firstFieldSelected() {
        return this.widgets[this.selected].firstFieldSelected;
    }

    nextField(){
        this.widgets[this.selected].nextField();
    }

    previousField(){
        this.widgets[this.selected].previousField();
    }

    nextValue(){
        this.widgets[this.selected].nextValue();
    }

    previousValue(){
        this.widgets[this.selected].previousValue();
    }
}