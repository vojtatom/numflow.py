'use strict';

class ComponentUI extends BaseUI{
    constructor(structure){
        super();
        this.structure = structure;
        
        this.elements = {};
        this.actions = structure.actions;
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
    }
    
    deactivate(){
        this.placeholder.style.display = 'block';
        this.component.style.display = 'none';

        if (this.actions.deactivate)
            this.actions.deactivate();
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
        
        if ('id' in structure)
            this.elements[structure.id] = value;

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
        }

        /* go down */
        this.actions[binds[0]] = (bigStep) => {
            if (bigStep)
            delta *= 10;
            let v = Math.max(structure.min, structure.value - delta);
            update(v);
        }
        
        /* go up */
        this.actions[binds[1]] = (bigStep) => {
            if (bigStep)
                delta *= 10;
            let v = Math.min(structure.max, structure.value + delta);
            update(v);
        }
        
        /* constrols help */
        let keys = ComponentUI.createElement({
            type: 'div',
            innerHTML: String.fromCharCode(binds[0]) + '/' + String.fromCharCode(binds[1]),
            class: ['componentFieldKeys'],
        });
        
        container.appendChild(keys);

        return container;
    }

    update(id, value){
        this.elements[id].innerHTML = value;
    }
}