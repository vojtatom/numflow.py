class EditorUI{
    static create(editor) {
        let area = document.getElementById('editor');
        area.tabIndex = -1;

        let scaledArea = document.createElement('div');
        scaledArea.id = 'editor_scaled';
        area.appendChild(scaledArea);

        let mode = document.createElement('div');
        mode.id = 'editor_mode';
        area.appendChild(mode);

        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute("width",  "100%");
        svg.setAttribute("height", "100%");
        scaledArea.appendChild(svg);

        editor.area = area;
        editor.scaledArea = scaledArea;
        editor.modeLabel = mode;
        editor.svg = svg;

        area.oncontextmenu = (e) => {
            e.preventDefault();
        };

        area.onmousedown = (e) => {
            editor.mouseDown(e);
        };

        area.onmouseup = (e) => {
            editor.mouseUp(e);
        };

        area.onmousemove = (e) => {
            editor.mouseMove(e);
        }

        area.onwheel = (e) => {
            editor.wheel(e);
        }

        window.onresize = (e) => {
            editor.resize(e);
        }

        area.onkeypress = (e) => {
            editor.keyPress(e);
        }
    }
}

class EditorMenuUI {
    static create(editor, nodesMenu){
        let menu = document.createElement('div');
        menu.id = 'editor_menu';
        menu.style.display = "none";

        editor.area.appendChild(menu);
        editor.menu = menu;


        for (let category in nodesMenu) {
            let catMenu = document.createElement('div');
            catMenu.classList.add('category');

            let catTitle = document.createElement('div');
            catTitle.classList.add('title');
            catTitle.innerHTML = category;
            catMenu.appendChild(catTitle);

            for(let node in nodesMenu[category]){
                let nodeMenu = document.createElement('div');
                nodeMenu.classList.add('template');
                nodeMenu.innerHTML = node;
                catMenu.appendChild(nodeMenu);

                nodeMenu.onclick = (e) => {
                    let pos = editor.mouseCoord(e);
                    let newNode = new Node(pos.x - 10, pos.y - 10, editor, nodesMenu[category][node], node);

                    EditorMenuUI.toggleMenu(editor);

                    editor.addNode(newNode);
                    newNode.active = true;
                    editor.setMode(Modes.moveNodes);
                    e.stopPropagation();
                }
            }

            menu.appendChild(catMenu);
        }
    }

    static toggleMenu(editor){
        if (!('menu' in editor))
            return;

        if (editor.menu.style.display === 'none') {
            editor.menu.style.display = 'block';
        } else {
            editor.menu.style.display = 'none';
        }
    }
}
