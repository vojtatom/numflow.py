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
        
        if (Object.keys(node.data.in).length > 0){
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
        let structure = node.data.structure;

        for (let key in structure) {
            let field = document.createElement('div');
            field.classList.add('field');
            nodeElement.appendChild(field);

            let title = document.createElement('div');
            title.classList.add('title');

            // abjust lower indices:
            let name = key.split('_');
            title.innerHTML = name[0];
            for (let i = 1; i < name.length; ++i){
                let subs = document.createElement('sub');
                subs.innerHTML = name[i];
                title.appendChild(subs);
            }

            field.appendChild(title);

            //DISPLAY lines
            if (structure[key].type == 'display'){
                let contents = document.createElement('div');
                contents.innerHTML = structure[key].value;

                contents.classList.add('content');
                field.appendChild(contents);

            //INPUT lines
            } else if (structure[key].type == 'input'){
                let contents = document.createElement('input');
                contents.value = structure[key].value;
                contents.placeholder = 'value';
                contents.onmousedown = (e) => {
                    e.stopPropagation();
                };

                let dynamicNodeId = key + node.id;
                let update = (e) => {
                    node.data.structure[key].value = e.target.value;
                    
                    if ('dynamic' in structure[key]){
                        DataManager.requestFrequent({
                            'url' : structure[key].dynamic,
                            'data' : {'code': contents.value},
                            'decode': true,
                            'success' : (r) => {
                                let dynamic = document.getElementById(dynamicNodeId);
                                console.log(dynamic, r);
                                dynamic.innerHTML = r.description;
                            },
                            'fail':  (r) => console.log(r),
                        })
                    };

                    e.stopPropagation();
                };

                contents.onkeypress = update;
                contents.oninput = update;
                contents.onpaste = update;

                contents.classList.add('content');
                field.appendChild(contents);

            //SELECT lines
            } else if (structure[key].type == 'select'){
                let contents = document.createElement('select');
                
                //Create and append the options
                for (let i = 0; i < structure[key].choices.length; i++) {
                    let option = document.createElement('option');
                    option.value = structure[key].choices[i];
                    option.text = structure[key].choices[i];
                    contents.appendChild(option);
                }
                
                contents.value = structure[key].value;
                contents.onchange = (e) => {
                    node.data.structure[key].value = e.target.value;
                    e.stopPropagation();
                };

                let nothing = (e) => {
                    e.stopPropagation();
                };

                contents.onmousedown = nothing;
                contents.onmouseup = nothing;

                contents.classList.add('content');
                field.appendChild(contents);
            }
            

            if ('dynamic' in structure[key]){
                field = document.createElement('div');
                field.classList.add('field');
                field.id = key + node.id;
                field.classList.add('dynamic');
                field.innerHTML = 'Waiting for input above.';
                nodeElement.appendChild(field);
            }
        }

        let meta;

        // IN TYPES
        console.log(node.data.in, Object.keys(node.data.in).length);
        if (Object.keys(node.data.in).length > 0){
            meta = []
            for(let intype in node.data.in){
                let text = intype;
                if(node.data.in[intype].multipart){
                    text = '[' + text + ']';
                }

                if(!node.data.in[intype].required){
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