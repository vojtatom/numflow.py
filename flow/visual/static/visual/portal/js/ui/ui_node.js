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
class NodeUI{
    static create(node) {
        let base = document.createElement('div');
        base.classList.add('node');
        
        if (node.data.ins.length > 0){
            let dotIn = document.createElement('div');
            dotIn.classList.add('in');
            base.appendChild(dotIn);
            
            dotIn.onmousedown = (e) => {
                if (node.editor.mode != Modes.connect)
                node.editor.setMode(Modes.connect);
                node.mouseDown(e);    
            };
        }
        
        if (node.data.out.length > 0){
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
        let field, contents, title, meta, subs;
        let structure = node.data.structure;

        for (let key in structure) {
            field = document.createElement('div');
            field.classList.add('field');
            nodeElement.appendChild(field);

            title = document.createElement('div');
            title.classList.add('title');

            // abjust lower indices:
            let name = key.split('_');
            console.log(name);
            title.innerHTML = name[0];
            for (let i = 1; i < name.length; ++i){
                let subs = document.createElement('sub');
                subs.innerHTML = name[i];
                title.appendChild(subs);
            }

            field.appendChild(title);

            //DISPLAY lines
            if (structure[key].type == 'display'){
                contents = document.createElement('div');
                contents.innerHTML = structure[key].value;

            //INPUT lines
            } else if (structure[key].type == 'input'){
                contents = document.createElement('input');
                contents.value = structure[key].value;
                contents.placeholder = 'value';
                contents.onmousedown = (e) => {
                    e.stopPropagation();
                };

                let update = (e) => {
                    node.data.structure[key].value = e.target.value;
                    e.stopPropagation();
                };

                contents.onkeypress = update;
                contents.oninput = update;
                contents.onpaste = update;
            }
            
            contents.classList.add('content');
            field.appendChild(contents);
        }

        // IN TYPES
        if (node.data.ins.length > 0){
            meta = node.data.ins.join(', ');
        } else {
            meta = 'None';
        } 

        nodeElement.appendChild(NodeUI.buildMeta('in', meta));

        //OUT TYPES
        if (node.data.out.length > 0){
            meta = node.data.out.join(', ');
        } else {
            meta = 'None';
        } 

        nodeElement.appendChild(NodeUI.buildMeta('out', meta));
    }

    static buildMeta(name, content){
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