'use strict';


class FlowAppUI {
    constructor(canvas){
        this.canvas = canvas;
        let parent = canvas.parentNode;

        let status = FlowAppUI.createElement({
            type: 'div',
            id: 'flowappstatus',
            innerHTML: 'status',
        });
        parent.appendChild(status);

        let placeholder = FlowAppUI.createElement({
            type: 'div',
            id: 'placeholderui',
            innerHTML: 'press <span>M</span> for menu',
        });
        parent.appendChild(placeholder);
        
        let element = FlowAppUI.createElement({
            type: 'div',
            id: 'flowappui',
            style: {
                display: 'none',
            }
        });
        parent.appendChild(element);


        // ---------------------------- main help
        //elements nav description
        let mainNavCont = FlowAppUI.createElement({
            type: 'div',
            id: 'mainNavigationContainer',
        });

        let mainNav = FlowAppUI.getHelpElement([{
            action: 'translation',
            keys: 'shift + WASD'
        }, {
            action: 'rotation',
            keys: 'WASD'
        }, {
            action: 'change perspective',
            keys: 'P'
        }, {
            action: 'front view',
            keys: 'F'
        }, {
            action: 'top view',
            keys: 'T'
        }, {
            action: 'right-side view',
            keys: 'R'
        }, {
            action: 'capture image',
            keys: 'C'
        }, {
            action: 'capture image with depth',
            keys: 'V'
        }], false);
        mainNav.classList.add('mainNavigation');
        mainNavCont.appendChild(mainNav);
        parent.appendChild(mainNavCont);


        // --------------------------- scenes element
        let scenes = FlowAppUI.createElement({
            type: 'div',
            id: 'scenes',
            style: {
                display: 'none',
            },
        });
        element.appendChild(scenes);

        //scenes label
        let sceneLabel = FlowAppUI.createElement({
            type: 'div',
            id: 'sceneLabel',
            innerHTML: 'Scenes',
            class: ['menuLabel'],
        });
        scenes.appendChild(sceneLabel);

        let navigationScenes = FlowAppUI.getHelpElement([{
            action: 'change scene',
            keys: 'shift + right/left arrows'
        }, {
            action: 'enter scene',
            keys: 'enter'
        }], true);
        scenes.appendChild(navigationScenes);
        
        //list
        let sceneList = FlowAppUI.createElement({
            type: 'div',
            id: 'sceneList',
        });
        scenes.appendChild(sceneList);

        // ------------------------------ objects element
        //elements
        let elements = FlowAppUI.createElement({
            type: 'div',
            id: 'elements',
        });
        element.appendChild(elements);


        //elements nav description
        let navigationElements = FlowAppUI.getHelpElement([{
            action: 'select property',
            keys: 'up/down arrows'
        }, {
            action: 'skip to next/prev.',
            keys: 'shift + up/down arrows'
        }, {
            action: 'change property',
            keys: 'right/left arrows'
        }, {
            action: 'quick change property',
            keys: 'alt + right/left arrows'
        }], true);
        elements.appendChild(navigationElements);

        //elements label
        let elementsLabel = FlowAppUI.createElement({
            type: 'div',
            id: 'elementsLabel',
            innerHTML: 'Scene elements',
            class: ['menuLabel'],
        });
        elements.appendChild(elementsLabel);

        let sceneElement = FlowAppUI.createElement({
            type: 'div',
            id: 'sceneElement',
        });
        elements.appendChild(sceneElement);


        // ------------------------------ other widgets
        let helpWidget = FlowAppUI.createElement({
            type: 'div',
            id: 'helpWidget',
            innerHTML: 'Press <span>H</span> to toggle help, <span>M</span> to hide menu',
            class: ['menuNote'],
        });
        element.appendChild(helpWidget);
        


        // ------------------------------------
        
        /* general stuff */
        this.placeholder = placeholder;
        this.status = status;
        this.element = element;

        /* scene list stuff */
        this.sceneWidget = scenes;
        this.sceneList = sceneList;
        
        /* scene elements menu */
        this.sceneElement = sceneElement;
        
        /* other stuff */
        this.scenes = [];
        this.selectedScene = 0;
        this.active = 0;
        this.menuVisible = false;
        this.helpVisible = false;
    }

    addScene(scene){
        this.scenes.push(scene);

        let sceneCard = document.createElement('div');
        sceneCard.id = 'scene' + (this.scenes.length - 1);
        sceneCard.classList.add('scene');
        this.sceneList.appendChild(sceneCard);

        if (this.scenes.length > 1){
            this.sceneWidget.style.display = 'block';
        }
    }

    displayScene(index){
        while (this.sceneElement.firstChild) {
            this.sceneElement.removeChild(this.sceneElement.firstChild);
        }

        this.scenes[this.active].deselect();
        this.active = index;
        this.selectedScene = index;

        let ui = this.scenes[this.active].node;
        this.sceneElement.appendChild(ui);

        this.scenes[this.active].select(0, 0);
        
        let scene = document.getElementById('scene' + this.selectedScene);
        scene.classList.add('selected');
    }

    nextScene(){
        if (!this.menuVisible)
            return;

        let scene = document.getElementById('scene' + this.selectedScene);
        scene.classList.remove('selected');

        this.selectedScene = (this.selectedScene + 1) % this.scenes.length;

        scene = document.getElementById('scene' + this.selectedScene);
        scene.classList.add('selected');
    }

    previousScene(){
        if (!this.menuVisible)
            return;

        let scene = document.getElementById('scene' + this.selectedScene);
        scene.classList.remove('selected');

        this.selectedScene = (this.selectedScene - 1 + this.scenes.length) % this.scenes.length;

        scene = document.getElementById('scene' + this.selectedScene);
        scene.classList.add('selected');
    }

    nextWidget(){
        if (!this.menuVisible)
            return;

        this.scenes[this.active].nextWidget();
    }

    previousWidget(){
        if (!this.menuVisible)
            return;

        this.scenes[this.active].previousWidget();
    }

    nextField(){
        if (!this.menuVisible)
            return;

        if (this.scenes[this.active].lastFieldSelected){
            this.scenes[this.active].nextWidget();
            this.scenes[this.active].selectFirstField();
        } else {
            this.scenes[this.active].nextField();
        }
    }

    previousField(){
        if (!this.menuVisible)
            return;

        if (this.scenes[this.active].firstFieldSelected){
            this.scenes[this.active].previousWidget();
            this.scenes[this.active].selectLastField();
        } else {
            this.scenes[this.active].previousField();
        }
    }

    nextValue(alternative){
        if (!this.menuVisible)
            return;

        this.scenes[this.active].nextValue(alternative);
    }

    previousValue(alternative){
        if (!this.menuVisible)
            return;

        this.scenes[this.active].previousValue(alternative);
    }

    toggleMenu(){
        if (this.menuVisible){
            this.element.style.display = 'none';
            this.placeholder.style.display = 'block';
            this.menuVisible = false;

            if (this.helpVisible){
                this.toggleHelp();
            }
        } else {
            this.element.style.display = 'block';
            this.placeholder.style.display = 'none';
            this.menuVisible = true;
        }
    }

    toggleHelp(){
        if (!this.menuVisible)
            this.helpVisible = true;

        let all = document.getElementsByClassName('navigation');
        if (this.helpVisible){
            for (let i = 0; i < all.length; i++) {
                all[i].style.display = 'none';
            }
            this.helpVisible = false;
        } else {
            for (let i = 0; i < all.length; i++) {
                all[i].style.display = 'flex';
            }
            this.helpVisible = true;
        }
    }

    delete(){
        while (this.sceneElement.firstChild) {
            this.sceneElement.removeChild(this.sceneElement.firstChild);
        }

        while (this.sceneList.firstChild) {
            this.sceneList.removeChild(this.sceneList.firstChild);
        }

        this.scenes = [];
    }

    resize(x, y){
        this.element.style.fontSize = (((y / 1400) - 1) + 1) + 'em';
        this.element.style.width = (((y / 1400) - 1) * 400 + 400) + 'px';
        this.status.style.fontSize = (((y / 1400) - 1) + 1) + 'em';
        this.placeholder.style.fontSize = (((y / 1400) - 1) + 1) + 'em';
    }

    updateStatus(text){
        this.status.innerHTML = text;
    }

    getState(){
        let values = [];
        for (let scene of this.scenes){
            values.push(scene.getState());
        }

        return {
            active: {
                scene: this.active,
                widget: this.scenes[this.active].selected,
                field: this.scenes[this.active].widgets[this.scenes[this.active].selected].selected,
                visibility: this.menuVisible,
                help: this.helpVisible,
            },
            scenes: values
        }
    }

    setState(state){
        let i = 0;
        for (let scene of this.scenes){
            scene.setState(state.scenes[i++]);
        }

        if (this.active != state.active.scene){
            this.displayScene(state.active.scene);
        }

        if (this.scenes[this.active].selected != state.active.widget || 
            this.scenes[this.active].widgets[this.scenes[this.active].selected].selected != state.active.field){
            this.scenes[this.active].deselect();
            this.scenes[this.active].select(state.active.widget, state.active.field);
        }

        if (this.menuVisible !== state.active.visibility){
            this.toggleMenu();
        }

        if (this.helpVisible !== state.active.help){
            this.toggleHelp();
        }
    }

    static createElement(options){
        /* only type is mandatory */
        let elem = document.createElement(options.type);

        if (options.id)
            elem.id = options.id;

        if (options.src)
            elem.src = options.src;

        if (options.class){
            if (Array.isArray(options.class)){
                for (let cls of options.class){
                    elem.classList.add(cls);
                }
            } else {
                console.log('ui class must be an array')
            }
        }

        if (options.innerHTML)
            elem.innerHTML = options.innerHTML;


        if (options.style){
            for (let attr in options.style){
                elem.style[attr] = options.style[attr];
            }
        }

        return elem;
    }

    static getHelpElement(tasks, inline){
        let navigation = FlowAppUI.createElement({
            type: 'div',
            class: inline ? ['navigation', 'navigation-inline'] : ['navigation'],
        });

        for (let task of tasks){
            let container = FlowAppUI.createElement({
                type: 'div',
                class: ['task'],
            });

            let action = FlowAppUI.createElement({
                type: 'div',
                innerHTML: task.action,
                class: ['action'],
            });

            container.appendChild(action);

            let keysElem = FlowAppUI.createElement({
                type: 'div',
                class: ['keys'],
            });

            let keys = task.keys.split("+");
            let plus = FlowAppUI.createElement({
                type: 'div',
                innerHTML: '+',
                class: ['and'],
            });

            for (let keyid in keys){
                let keyElem = FlowAppUI.createElement({
                    type: 'div',
                    innerHTML: keys[keyid],
                    class: ['key'],
                });
                keysElem.appendChild(keyElem);
                
                if (keys.length - 1 != keyid){
                    keysElem.appendChild(plus);
                }
            }

            container.appendChild(keysElem);
            navigation.appendChild(container);
        }

        return navigation;
    }
}