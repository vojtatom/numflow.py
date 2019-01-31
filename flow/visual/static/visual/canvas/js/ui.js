'use strict';


class FlowAppUI {
    constructor(canvas){
        if (!FlowAppUI.instance){
            this.canvas = canvas;
            let parent = canvas.parentNode;

            let placeholder = document.createElement('div');
            placeholder.id = 'placeholderui';
            placeholder.innerHTML = 'M';
            parent.appendChild(placeholder);

            
            let element = document.createElement('div');
            element.id = 'flowappui';
            parent.appendChild(element);
            element.style.display = 'none';
            
            let sceneList = document.createElement('div');
            sceneList.id = 'sceneList';
            element.appendChild(sceneList);

            let sceneElement = document.createElement('div');
            sceneElement.id = 'sceneElement';
            element.appendChild(sceneElement);
            
            this.placeholder = placeholder;
            this.element = element;
            this.sceneList = sceneList;
            this.sceneElement = sceneElement;
            console.log(this.element);
            
            this.scenes = [];
            this.selectedScene = 0;
            this.active = 0;

            this.menuVisible = false;
            FlowAppUI.instance = this;
        }

        return FlowAppUI.instance;
    }

    static addScene(scene){
        FlowAppUI.instance.addScene(scene);
    }

    addScene(scene){
        this.scenes.push(scene);

        let sceneCard = document.createElement('div');
        sceneCard.id = 'scene' + (this.scenes.length - 1);
        sceneCard.classList.add('scene');
        sceneCard.innerHTML = (this.scenes.length - 1);
        this.sceneList.appendChild(sceneCard);
    }

    static displayScene(index){
        FlowAppUI.instance.displayScene(index);
    }

    displayScene(index){
        while (this.sceneElement.firstChild) {
            this.sceneElement.removeChild(this.sceneElement.firstChild);
        }

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

    nextValue(){
        if (!this.menuVisible)
            return;

        this.scenes[this.active].nextValue();
    }

    previousValue(){
        if (!this.menuVisible)
            return;

        this.scenes[this.active].previousValue();
    }

    toggleMenu(){
        if (this.menuVisible){
            this.element.style.display = 'none';
            this.placeholder.style.display = 'block';
            this.menuVisible = false;
        } else {
            this.element.style.display = 'block';
            this.placeholder.style.display = 'none';
            this.menuVisible = true;
        }

    }

    delete(){
        while (this.sceneElement.firstChild) {
            this.sceneElement.removeChild(this.sceneElement.firstChild);
        }

        while (this.sceneList.firstChild) {
            this.sceneList.removeChild(this.sceneList.firstChild);
        }
    }
}