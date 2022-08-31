'use strict';

/**
 * Class representing renderer UI.
 */
class FlowAppUI extends BaseUI {
    /**
     * Create new renderer UI.
     * @param {HTML element} canvas canvas element
     */
    constructor(canvas){
        super();

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
            keys: 'shift + WSAD'
        }, {
            action: 'rotation',
            keys: 'WSAD'
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
        //elements
        let components = FlowAppUI.createElement({
            type: 'div',
            id: 'components',
        });
        element.appendChild(components);

        let componentElement = FlowAppUI.createElement({
            type: 'div',
            id: 'componentElement',
        });
        components.appendChild(componentElement);

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
        this.mainNav = mainNav;
        this.mainNavCont = mainNavCont;

        /* scene list stuff */
        this.sceneWidget = scenes;
        this.sceneList = sceneList;
        
        /* scene elements menu */
        this.sceneElement = sceneElement;
        this.componentElement = componentElement;
        
        /* elements classes */
        this.scenes = [];
        this.components = [];
        
        /* other stuff */
        this.selectedScene = 0;
        this.active = 0;
        this.activeComponent = null;
        this.menuVisible = false;
        this.helpVisible = false;
    }

    /**
     * Adds a scene controls to the menu.
     * 
     * @param {SceneUI} scene instance of scene UI class
     * @param {ComponentUI} components instance of component UI class
     */
    addScene(scene, components){
        this.scenes.push(scene);

        let comObj = {};
        for (let comp of components){
            comObj[comp.activationKey] = comp;
        }

        this.components.push(comObj);

        let sceneCard = document.createElement('div');
        sceneCard.id = 'scene' + (this.scenes.length - 1);
        sceneCard.classList.add('scene');
        this.sceneList.appendChild(sceneCard);

        if (this.scenes.length > 1){
            this.sceneWidget.style.display = 'block';
        } else {
            this.sceneWidget.style.display = 'none';
        }
    }

    /**
     * Switches the menu to the scene of specified index.
     * 
     * @param {int} index index of the scene 
     */
    displayScene(index){
        /* scene settings */
        while (this.sceneElement.firstChild) {
            this.sceneElement.removeChild(this.sceneElement.firstChild);
        }

        /* animation settings */
        while (this.componentElement.firstChild) {
            this.componentElement.removeChild(this.componentElement.firstChild);
        }

        this.scenes[this.active].deselect();
        
        this.active = index;
        this.selectedScene = index;

        let uiElements = this.scenes[this.active].node;
        this.sceneElement.appendChild(uiElements);

        for (let comp in this.components[this.active]){
            let uiComp = this.components[this.active][comp].node;
            this.componentElement.appendChild(uiComp);
        }

        this.scenes[this.active].select(0, 0);
        let scene = document.getElementById('scene' + this.selectedScene);
        scene.classList.add('selected');
    }

    /**
     * Switches menu to the next scene.
     */
    nextScene(){
        if (!this.menuVisible)
            return;

        let scene = document.getElementById('scene' + this.selectedScene);
        scene.classList.remove('selected');

        this.selectedScene = (this.selectedScene + 1) % this.scenes.length;

        scene = document.getElementById('scene' + this.selectedScene);
        scene.classList.add('selected');
    }

    /**
     * Switches menu to the previous scene.
     */
    previousScene(){
        if (!this.menuVisible)
            return;

        let scene = document.getElementById('scene' + this.selectedScene);
        scene.classList.remove('selected');

        this.selectedScene = (this.selectedScene - 1 + this.scenes.length) % this.scenes.length;

        scene = document.getElementById('scene' + this.selectedScene);
        scene.classList.add('selected');
    }

    /**
     * Performs the action for specified key.
     * 
     * @param {string} key key code 
     */
    componentKey(key){
        /* check component activation */
        if (key in this.components[this.active]){
            this.toggleComponent(key)
            return;
        }

        if (this.activeComponent !== null){
            this.components[this.active][this.activeComponent].key(key);
            return;
        }

    }


    /**
     * Display or hide a component widget.
     * 
     * @param {string} key key code
     */
    toggleComponent(key){
        if (!this.menuVisible)
            return;

        //deactivate
        if (this.activeComponent !== null){
            this.components[this.active][this.activeComponent].deactivate();
        }
        
        //toggle
        if (this.activeComponent == key){
            this.activeComponent = null;
        } else {
            this.activeComponent = key;
            this.components[this.active][this.activeComponent].activate();
        }
        
    }

    /**
     * Switches menu to the next widget.
     */
    nextWidget(){
        if (!this.menuVisible)
            return;

        this.scenes[this.active].nextWidget();
    }

    /**
     * Switches menu to the previous widget.
     */
    previousWidget(){
        if (!this.menuVisible)
            return;

        this.scenes[this.active].previousWidget();
    }

    /**
     * Switches menu to the next field.
     */
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

    /**
     * Switches menu to the previous field.
     */
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

    /**
     * Changes the value of the currently selected field to the next one.
     */
    nextValue(alternative){
        if (!this.menuVisible)
            return;

        this.scenes[this.active].nextValue(alternative);
    }

    /**
     * Changes the value of the currently selected field to the previous one.
     */
    previousValue(alternative){
        if (!this.menuVisible)
            return;

        this.scenes[this.active].previousValue(alternative);
    }

    /**
     * Display or hide menu.
     */
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

    /**
     * Display or hide help.
     */
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

    /**
     * Delete the UI and remove the HTML elements.
     */
    delete(){
        while (this.sceneElement.firstChild) {
            this.sceneElement.removeChild(this.sceneElement.firstChild);
        }

        while (this.sceneList.firstChild) {
            this.sceneList.removeChild(this.sceneList.firstChild);
        }

        this.scenes = [];
        this.components = [];
        this.selectedScene = 0;
        this.active = 0;
        this.activeComponent = null;
        this.menuVisible = false;
        this.helpVisible = false;
    }

    /**
     * Resize the UI. 
     * @param {int} x x dimension of the screen
     * @param {int} y y dimension of the screen
     */
    resize(x, y){
        let fontSize = (((y / 1400) - 1) + 1) + 'em';
        let width = (((y / 1400) - 1) * 400 + 400) + 'px';
        this.element.style.fontSize = fontSize;
        this.element.style.width = width;
        this.status.style.fontSize = fontSize;
        this.placeholder.style.fontSize = fontSize;
        this.mainNavCont.style.fontSize = fontSize;
    }

    /**
     * Update the text of the status widget.
     * @param {string} text status text
     */
    updateStatus(text){
        this.status.innerHTML = text;
    }

    /**
     * Get current state of the menu.
     */
    getState(){
        let values = [];
        for (let scene of this.scenes){
            values.push(scene.getState());
        }

        let components = [];
        for (let componentObjs of this.components){
            let sceneComps = {};
            for (let componentKey in componentObjs){
                sceneComps[componentKey] = componentObjs[componentKey].getState();
            }
            components.push(sceneComps);
        }


        return {
            active: {
                scene: this.active,
                widget: this.scenes[this.active].selected,
                field: this.scenes[this.active].widgets[this.scenes[this.active].selected].selected,
                visibility: this.menuVisible,
                help: this.helpVisible,
                component: this.activeComponent,
            },
            scenes: values,
            components: components,
        }
    }

    /**
     * Set object's state.
     * @param {object} state state object
     */
    setState(state){
        if (this.active != state.active.scene){
            this.displayScene(state.active.scene);
        }
        
        let i = 0;
        for (let scene of this.scenes){
            scene.setState(state.scenes[i++]);
        }

        i = 0;
        for (let componentStates of state.components){
            for (let componentKey in componentStates){
                this.components[i][componentKey].setState(state.components[i][componentKey]);
            }
            i++;
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

        if (this.activeComponent !== state.active.component){
            this.componentKey(state.active.component);
        }
    }
}