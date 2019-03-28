'use strict';


class AnimationUI extends BaseUI {
    constructor(time){
        super();
        this.time = time;
        this.current = null;
    }

    get node() {
        let container = AnimationUI.createElement({
            type: 'div',
            id: 'animation',
            class: ['widget']
        });

        /* bounds */
        let boundsField = AnimationUI.createElement({
            type: 'div',
            class: ['field'],
        });

        let boundsTitle = AnimationUI.createElement({
            type: 'div',
            innerHTML: 'time bounds',
            class: ['title'],
        });
        boundsField.appendChild(boundsTitle);

        let bounds = AnimationUI.createElement({
            type: 'div',
            id: 'animationBounds',
            innerHTML: this.time.bounds.low + ' - ' + this.time.bounds.high,
            class: ['value'],
        });

        boundsField.appendChild(bounds);
        container.appendChild(boundsField);

        /* delta */
        let deltaField = AnimationUI.createElement({
            type: 'div',
            class: ['field'],
        });

        let deltaTitle = AnimationUI.createElement({
            type: 'div',
            innerHTML: 'delta',
            class: ['title'],
        });
        deltaField.appendChild(deltaTitle);

        let delta = AnimationUI.createElement({
            type: 'div',
            id: 'animationDelta',
            innerHTML: this.time.delta,
            class: ['value'],
        });
        deltaField.appendChild(delta);
        container.appendChild(deltaField);
        
        /* step */
        let stepField = AnimationUI.createElement({
            type: 'div',
            class: ['field'],
        });

        let stepTitle = AnimationUI.createElement({
            type: 'div',
            innerHTML: 'step',
            class: ['title'],
        });
        stepField.appendChild(stepTitle);

        let step = AnimationUI.createElement({
            type: 'div',
            id: 'animationStep',
            innerHTML: this.time.step,
            class: ['value'],
        });
        stepField.appendChild(step);
        container.appendChild(stepField);

        /* current */
        let current = AnimationUI.createElement({
            type: 'div',
            id: 'animationCurrent',
            innerHTML: this.time.current,
            class: ['value'],
        });
        container.appendChild(current);

        this.current = current;

        return container;
    }

    updateTime(time){
        if(time.current)
            this.current.innerHTML = time.current;
    }
}