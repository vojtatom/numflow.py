'use strict';

class FieldUI{
    constructor(key, data){
        this.key = key;
        this.data = data;
        this.selected = false;
    }

    select(){
        this.element.classList.add('selected');
        this.selected = true;
    }

    deselect(){
        this.element.classList.remove('selected');
        this.selected = false;
    }

    next(){

    }

    previous(){

    }

    getState(){
        return {
            data: this.data,
            key: this.key,
        };
    }
}

class DisplayFieldUI extends FieldUI{
    get node() {
        let fdom = document.createElement('div');
        fdom.classList.add('field');
        this.element = fdom;

        let title = document.createElement('div');
        title.classList.add('title');
        title.innerHTML = this.key;
        this.element.appendChild(title);

        let display = document.createElement('div');
        display.classList.add('value');
        display.innerHTML = this.data.value;
        this.display = display;
        this.element.appendChild(display);
        return this.element;
    }

    setState(state){
        this.data.value = state.data.value;
        this.display.innerHTML = state.data.value;
    }
}


class SelectFieldUI extends FieldUI{
    get node() {
        let fdom = document.createElement('div');
        fdom.classList.add('field');
        this.element = fdom;

        let title = document.createElement('div');
        title.classList.add('title');
        title.innerHTML = this.key;
        this.element.appendChild(title);

        let display = document.createElement('div');
        display.classList.add('value');
        display.innerHTML = this.data.value;
        this.display = display;
        this.element.appendChild(display);

        let active = this.data.options.indexOf(this.data.value);
        this.activeOption = active;

        return this.element;
    }

    next(){
        this.activeOption = (this.activeOption + 1) % this.data.options.length;
        this.display.innerHTML = this.data.options[this.activeOption];
        this.data.value = this.data.options[this.activeOption];
        this.data.callbacks[this.activeOption]();
    }

    previous(){
        this.activeOption = (this.activeOption - 1 + this.data.options.length) % this.data.options.length;
        this.display.innerHTML = this.data.options[this.activeOption];
        this.data.value = this.data.options[this.activeOption];
        this.data.callbacks[this.activeOption]();
    }

    setState(state){
        this.data.options = state.data.options;
        this.data.value = state.data.value;
        this.activeOption = this.data.options.indexOf(this.data.value);
        this.display.innerHTML = state.data.value;
    }
}

class SliderFieldUI extends FieldUI{
    get node() {
        let fdom = document.createElement('div');
        fdom.classList.add('field');
        this.element = fdom;

        let title = document.createElement('div');
        title.classList.add('title');
        title.innerHTML = this.key;
        this.element.appendChild(title);

        let display = document.createElement('div');
        display.classList.add('value');
        display.innerHTML = this.data.value;
        this.display = display;
        this.element.appendChild(display);

        this.value = this.data.value;
        return this.element;
    }

    next(alternative){
        let delta = alternative ? this.data.delta * 10 : this.data.delta;
        this.value = Math.min(this.value + delta, this.data.max);
        this.display.innerHTML = this.value.toFixed(3);
        this.data.callback(this.value);
        this.data.value = this.value;
    }

    previous(alternative){
        let delta = alternative ? this.data.delta * 10 : this.data.delta;
        this.value = Math.max(this.value - delta, this.data.min);
        this.display.innerHTML = this.value.toFixed(3);
        this.data.callback(this.value);
        this.data.value = this.value;
    }

    setState(state){
        this.data.options = state.data.options;
        this.data.value = state.data.value;
        this.value = state.data.value;
        this.data.delta = state.data.delta;
        this.display.innerHTML = this.value.toFixed(3);
    }
}