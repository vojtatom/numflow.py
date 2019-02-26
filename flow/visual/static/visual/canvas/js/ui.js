'use strict';


class FlowAppUI {
    constructor(canvas){
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

        //scenes label
        let sceneLabel = document.createElement('div');
        sceneLabel.id = 'sceneLabel';
        sceneLabel.innerHTML = 'scenes';
        sceneLabel.classList.add('menuLabel');
        element.appendChild(sceneLabel);

        // scenes nav description
        let sceneDesc = document.createElement('div');
        sceneDesc.id = 'sceneNavDesc';
        sceneDesc.innerHTML = 'shift + arrows to move, enter to select';
        sceneDesc.classList.add('menuLabel');
        sceneDesc.classList.add('menuDescription');
        element.appendChild(sceneDesc);

        let sceneListContainer = document.createElement('div');
        sceneListContainer.id = 'sceneListContainer';
        element.appendChild(sceneListContainer);

        //nav
        let sceneListLeft = document.createElement('img');
        sceneListLeft.id = 'sceneListLeft';
        sceneListLeft.src = DataManager.getIcon('left.svg');
        sceneListLeft.classList.add('canvasIcon');
        sceneListLeft.classList.add('side');
        sceneListContainer.appendChild(sceneListLeft);
        
        //list
        let sceneList = document.createElement('div');
        sceneList.id = 'sceneList';
        sceneListContainer.appendChild(sceneList);

        //nav
        let sceneListRight = document.createElement('img');
        sceneListRight.id = 'sceneListRight';
        sceneListRight.src = DataManager.getIcon('right.svg');
        sceneListRight.classList.add('canvasIcon');
        sceneListRight.classList.add('side');
        sceneListContainer.appendChild(sceneListRight);

        //elements label
        let elementsLabel = document.createElement('div');
        elementsLabel.id = 'sceneLabel';
        elementsLabel.innerHTML = 'scene elements';
        elementsLabel.classList.add('menuLabel');
        element.appendChild(elementsLabel);

        //elements nav description
        let elementsDesc = document.createElement('div');
        elementsDesc.id = 'sceneNavDesc';
        elementsDesc.innerHTML = 'up/down arrows to move, left/right to change';
        elementsDesc.classList.add('menuLabel');
        elementsDesc.classList.add('menuDescription');
        element.appendChild(elementsDesc);

        let sceneElement = document.createElement('div');
        sceneElement.id = 'sceneElement';
        element.appendChild(sceneElement);
        
        this.placeholder = placeholder;
        this.element = element;
        this.sceneList = sceneList;
        this.sceneElement = sceneElement;
        
        this.scenes = [];
        this.selectedScene = 0;
        this.active = 0;

        this.menuVisible = false;
    }

    addScene(scene){
        this.scenes.push(scene);

        let sceneCard = document.createElement('div');
        sceneCard.id = 'scene' + (this.scenes.length - 1);
        sceneCard.classList.add('scene');
        this.sceneList.appendChild(sceneCard);
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

        this.scenes = [];
    }

    resize(x, y){
        this.element.style.fontSize = (((y / 1400) - 1) + 1) + 'em';
        this.element.style.width = (((y / 1400) - 1) * 400 + 400) + 'px';
    }
}