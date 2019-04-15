'use strict';

class NodeBaseUI {
    static createTitle(text) {
        let title = document.createElement('div');
        title.classList.add('title');

        // abjust lower indices:
        let name = text.split('_');
        title.innerHTML = name[0];
        for (let i = 1; i < name.length; ++i) {
            let subs = document.createElement('sub');
            subs.innerHTML = name[i];
            title.appendChild(subs);
        }

        return title;
    }

    static get nothing() {
        return (e) => {
            e.stopPropagation();
        };
    }

    static createBase(key) {
        let field = document.createElement('div');
        field.classList.add('field');

        let title = NodeBaseUI.createTitle(key);
        field.appendChild(title);

        return field;
    }

    static createDynamic(key, node) {
        let field = document.createElement('div');
        field.classList.add('field');
        field.id = key + node.id;
        field.classList.add('dynamic');
        field.innerHTML = 'Waiting for input above.';
        return field;
    }
}


class NodeDisplayUI extends NodeBaseUI {
    static create(key, structure, node) {
        let field = NodeDisplayUI.createBase(key);

        let contents = document.createElement('div');
        contents.innerHTML = structure.value;
        contents.classList.add('content');
        field.appendChild(contents);

        return field;
    }
}


class NodeInputUI extends NodeBaseUI {
    static create(key, structure, node) {
        let field = NodeInputUI.createBase(key);

        let contents = document.createElement('input');
        contents.value = structure.value;
        contents.placeholder = 'value';
        contents.onmousedown = NodeInputUI.nothing;

        let dynamicNodeId = key + node.id;

        let update = (e) => {
            node.data.structure[key].value = e.target.value;
            if ('dynamic' in structure) {
                DataManager.requestFrequent({
                    'url': structure.dynamic,
                    'data': { 'code': contents.value },
                    'decode': true,
                    'success': (r) => {
                        let dynamic = document.getElementById(dynamicNodeId);
                        dynamic.innerHTML = r.description;
                    },
                    'fail': (r) => console.error(r),
                })
            }
            e.stopPropagation();
        };

        contents.onkeypress = update;
        contents.oninput = update;
        contents.onpaste = update;


        contents.classList.add('content');
        field.appendChild(contents);

        return field;
    }
}


class NodeSelectUI extends NodeBaseUI {
    static create(key, structure, node) {
        let field = NodeSelectUI.createBase(key);
        let contents = document.createElement('select');

        //Create and append the options
        for (let i = 0; i < structure.choices.length; i++) {
            let option = document.createElement('option');
            option.value = structure.choices[i];
            option.text = structure.choices[i];
            contents.appendChild(option);
        }

        contents.value = structure.value;
        contents.onchange = (e) => {
            node.data.structure[key].value = e.target.value;
            e.stopPropagation();
        };
        contents.onmousedown = NodeSelectUI.nothing;
        contents.onmouseup = NodeSelectUI.nothing;

        contents.classList.add('content');
        field.appendChild(contents);
        return field;
    }
}

class NodeColorUI extends NodeBaseUI {

    static createSlider(value, title, id) {
        let s = document.createElement('input');
        s.id = id
        let label = document.createElement('label');
        let label_title = document.createElement('div');
        label.htmlFor = id;
        label_title.innerText = title;
        s.type = 'range';
        s.min = 0;
        s.max = 1;
        s.value = value;
        s.step = 1 / 255;
        s.classList.add('slider');
        s.onmousedown = NodeColorUI.nothing;
        s.onmouseup = NodeColorUI.nothing;
        s.onclick = NodeColorUI.nothing;
        label.appendChild(label_title);
        label.appendChild(s);
        return { slider: s, label: label };
    }

    static updateFieldColor(field, color) {
        let colorstr = 'rgba(' + Math.floor(color[0] * 255) + ',' + Math.floor(color[1] * 255) + ',' + Math.floor(color[2] * 255) + ',' + (color[3]) + ')';
        field.style.backgroundColor = colorstr;
    }

    static create(key, structure, node) {
        let field = NodeColorUI.createBase(key);

        let contents = document.createElement('div');
        let cp = document.createElement('div');
        cp.classList.add('colorpicker');

        //red
        let r = NodeColorUI.createSlider(structure.value[0], 'r', key + node.id + 'r');
        r.slider.onchange = (e) => {
            node.data.structure[key].value[0] = parseFloat(e.target.value);
            NodeColorUI.updateFieldColor(contents, node.data.structure[key].value);
            e.stopPropagation();
        };
        cp.appendChild(r.label);

        //green
        let g = NodeColorUI.createSlider(structure.value[1], 'g', key + node.id + 'g');
        g.slider.onchange = (e) => {
            node.data.structure[key].value[1] = parseFloat(e.target.value);
            NodeColorUI.updateFieldColor(contents, node.data.structure[key].value);
            e.stopPropagation();
        };
        cp.appendChild(g.label);

        //blue
        let b = NodeColorUI.createSlider(structure.value[2], 'b', key + node.id + 'b');
        b.slider.onchange = (e) => {
            node.data.structure[key].value[2] = parseFloat(e.target.value);
            NodeColorUI.updateFieldColor(contents, node.data.structure[key].value);
            e.stopPropagation();
        };
        cp.appendChild(b.label);

        //alpha
        let a = NodeColorUI.createSlider(structure.value[3], 'a', key + node.id + 'a');
        a.slider.onchange = (e) => {
            node.data.structure[key].value[3] = parseFloat(e.target.value);
            NodeColorUI.updateFieldColor(contents, node.data.structure[key].value);
            e.stopPropagation();
        };
        cp.appendChild(a.label);

        let toggleCp = (e) => {
            let past = cp.style.display;

            let cps = [...document.getElementsByClassName('colorpicker')];
            cps.forEach(element => {
                element.style.display = 'none';
            });

            if (past == 'block') {
                cp.style.display = 'none';
            } else {
                cp.style.display = 'block';
            }
            e.stopPropagation();
        }

        //disable cp
        cp.style.display = 'none';

        //toggles
        cp.onclick = toggleCp;
        contents.onclick = toggleCp;

        //disable everything else
        contents.onmousedown = NodeColorUI.nothing;
        contents.onmouseup = NodeColorUI.nothing;
        cp.onmousedown = NodeColorUI.nothing;
        cp.onmouseup = NodeColorUI.nothing;

        //update color once
        NodeColorUI.updateFieldColor(contents, structure.value);

        //append the rest
        contents.appendChild(cp);
        contents.classList.add('content');
        field.appendChild(contents);

        return field;
    }
}




/**
 * Class for static construction of Node UI
 *
 * It is possible to specify NodeUI contents with JSON:
 * {
 *    nameOfFiled: {
 *          type: 'input'|'display',
 *          value: initial value of input fields or content of display field,
 *    },
 *    ...
 * }
 * 
 * @class NodeUI
 */
class NodeUI {
    static create(node) {
        let base = document.createElement('div');
        base.classList.add('node');

        if (Object.keys(node.data.in).length > 0) {
            let dotIn = document.createElement('div');
            dotIn.classList.add('in');
            base.appendChild(dotIn);

            dotIn.onmousedown = (e) => {
                if (node.editor.mode != Modes.connect)
                    node.editor.setMode(Modes.connect);
                node.mouseDown(e);
            };
        }

        if (Object.keys(node.data.out).length > 0) {
            let dotOut = document.createElement('div');
            dotOut.classList.add('out');
            base.appendChild(dotOut);

            dotOut.onmousedown = (e) => {
                if (node.editor.mode != Modes.connect)
                    node.editor.setMode(Modes.connect);
                node.mouseDown(e);
            };
        }

        let body = document.createElement('div');
        body.classList.add('body');
        base.appendChild(body);

        node.baseElement = base;
        body.onmousedown = (e) => {
            node.mouseDown(e);
        };

        NodeUI.buildStructure(node, body);
    }

    static buildStructure(node, nodeElement) {
        let structure = node.data.structure;

        for (let key in structure) {
            let nodeStructure = structure[key];

            let field;
            if (structure[key].type == 'display') {
                //DISPLAY lines
                field = NodeDisplayUI.create(key, nodeStructure, node);
            } else if (structure[key].type == 'input') {
                //INPUT lines
                field = NodeInputUI.create(key, nodeStructure, node);
            } else if (structure[key].type == 'select') {
                //SELECT lines
                field = NodeSelectUI.create(key, nodeStructure, node);
            } else if (structure[key].type == 'color') {
                //COLOR lines
                field = NodeColorUI.create(key, nodeStructure, node);
            }
            nodeElement.appendChild(field);

            if ('dynamic' in structure[key]) {
                field = NodeBaseUI.createDynamic(key, node);
                nodeElement.appendChild(field);
            }
        }

        let meta;

        // IN TYPES
        if (Object.keys(node.data.in).length > 0) {
            meta = []
            for (let intype in node.data.in) {
                let text = intype;
                if (node.data.in[intype].multipart) {
                    text = '[' + text + ']';
                }

                if (!node.data.in[intype].required) {
                    text = '(' + text + ')';
                }
                meta.push(text);
            }
            meta = meta.join(', ');
        } else {
            meta = 'None';
        }

        nodeElement.appendChild(NodeUI.buildMeta('in', meta));

        //OUT TYPES
        if (Object.keys(node.data.out).length > 0) {
            meta = []
            for (let outtype in node.data.out) {
                let text = outtype;
                if (node.data.out[outtype].multipart) {
                    text = '[' + text + ']';
                }

                if (!node.data.out[outtype].required) {
                    text = '(' + text + ')';
                }
                meta.push(text);
            }
            meta = meta.join(', ');
        } else {
            meta = 'None';
        }

        nodeElement.appendChild(NodeUI.buildMeta('out', meta));
    }

    static buildMeta(name, content) {
        let field, contents, title, tmp;

        field = document.createElement('div');
        field.classList.add('field');
        field.classList.add('meta');

        title = document.createElement('div');
        title.classList.add('title');
        title.innerHTML = name;
        field.appendChild(title);

        contents = document.createElement('div');
        contents.innerHTML = content;
        contents.classList.add('content');
        field.appendChild(contents);

        return field;
    }


}