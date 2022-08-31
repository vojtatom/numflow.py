'use strict';

class ComponentUI extends BaseUI{
    constructor(structure){
        super();
        this.structure = structure;
        
        this.elements = {};

        if (!('actions' in structure)){
            structure.actions = {};
        }

        //setup default updates
        for (let widget of this.structure.main){
            widget.componentUpdate = (i) => {};
        }

        for (let widget of this.structure.side){
            widget.componentUpdate = (i) => {};
        }

        this.actions = structure.actions;
        this.active = false;
    }
    
    get activationKey() {
        return this.structure.key;
    }
    
    get node() {
        this.sliderKeys = [[74, 75], [85, 73]];
        let container = ComponentUI.createElement({
            type: 'div',
            id: 'animation',
            class: ['component']
        });

        /* placeholder */
        let placeholder = ComponentUI.createElement({
            type: 'div',
            class: ['componentPlaceholder'],
        });

        let title = ComponentUI.createElement({
            type: 'div',
            innerHTML: this.structure.title,
            class: ['componentTitle'],
        });

        placeholder.appendChild(title);

        let keyToggle = ComponentUI.createElement({
            type: 'div',
            innerHTML: 'Press <span>' + String.fromCharCode(this.structure.key) + '</span> to open',
            class: ['componentDescription'],
        });
        
        placeholder.appendChild(keyToggle);
        container.appendChild(placeholder);
        this.placeholder = placeholder;
        
        /* component UI */
        let component = ComponentUI.createElement({
            type: 'div',
            class: ['componentWidget'],
            style: {
                display: 'none',
            }
        });

        let main = ComponentUI.createElement({
            type: 'div',
            class: ['componentMainWidget'],
        });

        main.appendChild(ComponentUI.createElement({
            type: 'div',
            innerHTML: '<span>' + this.structure.title + '</span>',
            class: ['componentDescription'],
        }));

        main.appendChild(ComponentUI.createElement({
            type: 'div',
            innerHTML: 'press <span>' + String.fromCharCode(this.structure.key) + '</span> to exit',
            class: ['componentDescription'],
        }));

        
        for (let widget of this.structure.main){
            let elem;
            if (widget.type === 'display'){
                elem = this.displayWidget(widget);
            } else if (widget.type === 'slider') {
                elem = this.sliderWidget(widget);
            }
            main.appendChild(elem);
        }

        let side = ComponentUI.createElement({
            type: 'div',
            class: ['componentSideWidget'],
        });

        for (let widget of this.structure.side){
            let elem;
            if (widget.type === 'display'){
                elem = this.displayWidget(widget);
            } else if (widget.type === 'slider') {
                elem = this.sliderWidget(widget);
            } else if (widget.type === 'select') {
                elem = this.selectWidget(widget);
            }
            side.appendChild(elem);
        }
        
        component.appendChild(main);
        component.appendChild(side);
        container.appendChild(component);

        if ('help' in this.structure){
            component.appendChild(this.structure.help);
        }

        this.component = component;
        return container;
    }

    activate(){
        this.placeholder.style.display = 'none';
        this.component.style.display = 'flex';

        if (this.actions.activate)
            this.actions.activate();

        this.active = true;
    }
    
    deactivate(){
        this.placeholder.style.display = 'block';
        this.component.style.display = 'none';

        if (this.actions.deactivate)
            this.actions.deactivate();
        
        this.active = false;
    }

    key(key){
        if (key in this.actions){
            this.actions[key](false);
        }
    }

    displayWidget(structure){
        let container = ComponentUI.createElement({
            type: 'div',
            class: ['componentField'],
        });

        let title = ComponentUI.createElement({
            type: 'div',
            innerHTML: structure.title,
            class: ['componentFieldTitle'],
        });

        container.appendChild(title);

        let value = ComponentUI.createElement({
            type: 'div',
            innerHTML: "" + structure.value,
            class: ['componentFieldValue'],
        });
        
        container.appendChild(value);
        
        if ('id' in structure){
            this.elements[structure.id] = (v) => {
                value.innerHTML = v;
            }
        }

        return container;
    }
    
    sliderWidget(structure){
        let container = ComponentUI.createElement({
            type: 'div',
            class: ['componentField'],
        });

        let title = ComponentUI.createElement({
            type: 'div',
            innerHTML: structure.title,
            class: ['componentFieldTitle'],
        });

        container.appendChild(title);

        let value = ComponentUI.createElement({
            type: 'div',
            innerHTML: structure.value.toFixed(3),
            class: ['componentFieldValue'],
        });
        
        container.appendChild(value);

        
        /* setting up bindings */

        let binds = this.sliderKeys.pop();
        let delta = (structure.max - structure.min) / 200;
        
        let update = (v) => {
            structure.update(v);
            value.innerHTML = v.toFixed(3);
            structure.value = v;
        };

        /* go down */
        this.actions[binds[0]] = (bigStep) => {
            if (bigStep)
            delta *= 10;
            let v = Math.max(structure.min, structure.value - delta);
            update(v);
        };
        
        /* go up */
        this.actions[binds[1]] = (bigStep) => {
            if (bigStep)
                delta *= 10;
            let v = Math.min(structure.max, structure.value + delta);
            update(v);
        };
        
        /* constrols help */
        let keys = ComponentUI.createElement({
            type: 'div',
            innerHTML: String.fromCharCode(binds[0]) + '/' + String.fromCharCode(binds[1]),
            class: ['componentFieldKeys'],
        });

        if ('id' in structure)
            this.elements[structure.id] = update;
        structure.componentUpdate = update;

        container.appendChild(keys);
        return container;
    }

    selectWidget(structure){
        structure.iterator = structure.iterator;

        let container = ComponentUI.createElement({
            type: 'div',
            class: ['componentField'],
        });

        let title = ComponentUI.createElement({
            type: 'div',
            innerHTML: structure.title,
            class: ['componentFieldTitle'],
        });

        container.appendChild(title);

        let value = ComponentUI.createElement({
            type: 'div',
            innerHTML: structure.options[structure.iterator],
            class: ['componentFieldValue'],
        });
        
        container.appendChild(value);

        
        /* setting up bindings */

        let binds = this.sliderKeys.pop();
        
        let update = (i) => {
            structure.iterator = i;
            structure.calls[i]();
            value.innerHTML = structure.options[i];
            structure.value = structure.options[i];
        }

        /* go down */
        this.actions[binds[0]] = () => {
            let iterator = (structure.iterator - 1 + structure.options.length) % structure.options.length;
            update(iterator);
        }
        
        /* go up */
        this.actions[binds[1]] = () => {
            let iterator = (structure.iterator + 1) % structure.options.length;
            update(iterator);
        }
        
        /* constrols help */
        let keys = ComponentUI.createElement({
            type: 'div',
            innerHTML: String.fromCharCode(binds[0]) + '/' + String.fromCharCode(binds[1]),
            class: ['componentFieldKeys'],
        });

        if ('id' in structure)
            this.elements[structure.id] = update;
        structure.componentUpdate = update;

        container.appendChild(keys);
        return container;
    }

    update(id, value){
        if (id in this.elements){
            this.elements[id](value);
        } else {
            console.warn('Trying to update nonexisting element "' + id +'"');
        }
    }

    getState(){
        let state = {
            main: [],
            side: [],
        };

        for (let widget of this.structure.main){
            if (widget.type === 'display'){
                state.main.push({});
            } else if (widget.type === 'slider') {
                state.main.push({
                    value: widget.value,
                });
            }
        }

        for (let widget of this.structure.side){
            if (widget.type === 'display'){
                state.side.push(null);
            } else if (widget.type === 'slider') {
                state.side.push(widget.value);
            } else if (widget.type === 'select') {
                state.side.push(widget.iterator);
            }
        }

        return {
            structure: state,
            active: this.active,
        }
    }

    setState(state){
        let i = 0;
        for (let widget of this.structure.main){
            if (widget.type === 'display'){
                i++;
            } else if (widget.type === 'slider') {
                widget.componentUpdate(state.structure.main[i])
                i++;
            }
        }

        i = 0;
        for (let widget of this.structure.side){
            if (widget.type === 'display'){
                i++;
            } else if (widget.type === 'slider') {
                widget.componentUpdate(state.structure.side[i])
                i++;
            } else if (widget.type === 'select') {
                widget.componentUpdate(state.structure.side[i])
                i++;
            }
        }

        if (state.active && !this.active)
            this.activate();

        if (!state.active && this.active)
            this.deactivate();
    }
}