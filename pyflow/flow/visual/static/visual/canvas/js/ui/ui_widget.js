'use strict';

class WidgetUI {
    constructor(data){
        this.activateCall = data.activate.call;
        this.deactivateCall = data.deactivate.call;
        
        this.data = data;
        this.fieldElements = [];
        
        this.selected = 0;
        this.active = false;
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

        widget.style.display = 'none';
        this.element = widget;
        return widget;
    }

    get nodenavpoint(){
        let navpoint = document.createElement('div');
        navpoint.classList.add('navpoint');
        this.navpoint = navpoint;
        return navpoint;
    }
    
    select(index){
        this.fieldElements[this.selected].deselect();
        index = (index + this.fieldElements.length) % this.fieldElements.length;  
        this.fieldElements[index].select();
        this.selected = index;
        
        if (!this.active){
            this.activateCall();
            this.element.style.display = 'block';
            this.navpoint.classList.add('selected');
            this.active = true;
        }
    }

    selectLastField(){
        this.select(this.fieldElements.length - 1);
    }

    selectFirstField(){
        this.select(0);
    }
    
    deselect(){
        if (this.fieldElements[this.selected])
            this.fieldElements[this.selected].deselect();
        
        if (this.active){
            this.element.style.display = 'none';
            this.navpoint.classList.remove('selected');
            this.deactivateCall();
            this.active = false;
        }
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

    nextValue(alternative){
        this.fieldElements[this.selected].next(alternative);
    }

    previousValue(alternative){
        this.fieldElements[this.selected].previous(alternative);
    }

    getState(){
        let state = {
            fields: [],
            active: this.active,
            selected: this.selected,
        };

        for(let field of this.fieldElements){
            state.fields.push(field.getState());
        }
        return state;
    }

    setState(state){
        let i = 0;
        for(let field of this.fieldElements){
            field.setState(state.fields[i++]);
        }

        this.selected = state.selected;

        if (state.active == true && this.active == false){
            this.select(state.selected);
        }

        if (state.active == false && this.active == true){
            this.deselect();
        }
    }
}