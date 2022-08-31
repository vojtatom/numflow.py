'use strict';

class BaseUI{
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