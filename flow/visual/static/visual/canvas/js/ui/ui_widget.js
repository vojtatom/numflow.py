'use strict';

class WidgetUI {
    constructor(data){
        this.data = data;
        this.fieldElements = [];
        this.selected = 0;
    }

    get node() {
        this.fieldElements = [];

        let widget = document.createElement('div');
        widget.classList.add('widget');

        for (let field in this.data){
            ///display field
            if (this.data[field].type === 'display'){
                let f = new DisplayFieldUI(field, this.data[field]);
                widget.appendChild(f.node);
                this.fieldElements.push(f);
            }
            ///select field
            else if (this.data[field].type === 'select'){
                let f = new SelectFieldUI(field, this.data[field]);
                widget.appendChild(f.node);
                this.fieldElements.push(f);
            }
            ///slider field
            else if (this.data[field].type === 'slider'){
                let f = new SliderFieldUI(field, this.data[field]);
                widget.appendChild(f.node);
                this.fieldElements.push(f);
            }
        }

        return widget;
    }
    
    select(index){
        this.fieldElements[this.selected].deselect();
        index = (index + this.fieldElements.length) % this.fieldElements.length;  
        this.fieldElements[index].select();
        this.selected = index;
    }

    selectLastField(){
        this.select(this.fieldElements.length - 1);
    }

    selectFirstField(){
        this.select(0);
    }
    
    deselect(){
        this.fieldElements[this.selected].deselect();
    }

    nextField(){
        this.select(this.selected + 1);
    }

    previousField(){
        this.select(this.selected - 1);
    }

    get firstFieldSelected(){
        return this.selected === 0;
    }

    get lastFieldSelected(){
        return this.selected === this.fieldElements.length - 1;
    }

    nextValue(){
        this.fieldElements[this.selected].next();
    }

    previousValue(){
        this.fieldElements[this.selected].previous();
    }
}