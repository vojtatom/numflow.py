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

        //widgets
        let scenew = document.createElement('div');
        scenew.id = 'scenewidgets';

        //scenew.appendChild(up);
        for (let w of this.widgets){
            scenew.appendChild(w.node);
        }
        //scenew.appendChild(down);
        scene.appendChild(scenew);

        //navpoints
        let scenen = document.createElement('div');
        scenen.id = 'scenenavpoints';
        
        for (let w of this.widgets){
            scenen.appendChild(w.nodenavpoint);
        }
        scene.appendChild(scenen);

        return scene;
    }

    select(indexW, indexF){
        if (this.widgets.length <= indexW)
            return;

        this.selected = indexW;
        this.widgets[this.selected].select(indexF);
    }

    deselect(){
        if (this.widgets[this.selected])
            this.widgets[this.selected].deselect();
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

    nextValue(alternative){
        this.widgets[this.selected].nextValue(alternative);
    }

    previousValue(alternative){
        this.widgets[this.selected].previousValue(alternative);
    }

    getState(){
        let state = [];
        for(let widget of this.widgets){
            state.push(widget.getState());
        }
        return state;
    }

    setState(state){
        let i = 0;
        for(let widget of this.widgets){
            widget.setState(state[i++]);
        }
    }
}