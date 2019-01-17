class Modes{
    static get add() {
        return 0;
    }
    
    static get move() {
        return 1;
    }

    static get moveNodes() {
        return 2;
    }

    static get select() {
        return 3;
    }

    static get connect() {
        return 4;
    }

    static get delete() {
        return 5;
    }

    static title(mode) {
        switch(mode){
            case Modes.add:
                return "add";
            case Modes.move:
                return "move";
            case Modes.moveNodes:
                return "move nodes";
            case Modes.select:
                return "select";
            case Modes.connect:
                return "connect";
            case Modes.delete:
                return "delete";
            default:
                return "unknown";
        }
    }

    static class(mode) {
        switch(mode){
            case Modes.add:
            case Modes.move:
            case Modes.select:
            case Modes.connect:
            case Modes.delete:
                return Modes.title(mode);
            case Modes.moveNodes:
                return "move_nodes";
            default:
                return "unknown";
        }
    }
}

class Editor{

    constructor() {
        this.nodes = {};
        this.transform = {
            zoom: 1,
            x: 0,
            y: 0,
        };

        this.mouse = {
            down: false,
            x: 0,
            y: 0,
            dx: 0,
            dy: 0,
            dragged: false,
        };

        this.connection = {
            inNode: undefined,
            outNode: undefined,
        }

        
        EditorUI.create(this);

        this.applyTransform();
        this.resize();
        this.setMode(Modes.move);

        DataManager.request({
            url: '/notebook/editor',
            decode: true,
            data: {},
            success: (r) => {
                EditorMenuUI.create(this, r);
            },
            fail: (r) => console.log(r),
        });
    }

    mouseDown(e) {
        this.mouse.down = true;
        this.setMode(Modes.move);
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
    }

    mouseUp(e) {
        this.mouse.down = false;
        this.mouse.dragged = false;
    }

    mouseMove(e) {
        this.mouse.dx = e.clientX - this.mouse.x;
        this.mouse.dy = e.clientY - this.mouse.y;
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;

        if (this.mode == Modes.move && this.mouse.down) {
            this.transform.x += this.mouse.dx;
            this.transform.y += this.mouse.dy;
            this.mouse.dragged = true;
            this.applyTransform();

        } else if (this.mode == Modes.moveNodes) {
            let dx = this.mouse.dx / this.transform.zoom;
            let dy = this.mouse.dy / this.transform.zoom;

            Object.entries(this.nodes).forEach(
                ([id, node]) => { 
                    if (node.active) {
                        node.move(dx, dy);
                    }
                }
            );
        }
    }

    wheel(e){
        let delta = e.wheelDelta / 10000;
        delta = this.transform.zoom + delta > 0.1 ? delta : 0;
        let old_zoom = this.transform.zoom;
        this.transform.zoom = this.transform.zoom + delta;
        this.transform.x = this.transform.x * (this.transform.zoom / old_zoom);
        this.transform.y = this.transform.y * (this.transform.zoom / old_zoom);
        this.applyTransform();
        e.preventDefault();
    }

    resize(e){
        const rect = this.area.getBoundingClientRect();
        this.center = { x: this.area.offsetWidth / 2, y: this.area.offsetHeight / 2 };
        this.start = { x: rect.left, y: rect.top };
    }

    keyPress(e){
        console.log(e.keyCode);

        if (e.keyCode == 97){
            if (this.mode == Modes.add)
                this.setMode(Modes.move);
            else 
                this.setMode(Modes.add);
            EditorMenuUI.toggleMenu(this);
        } else if (e.keyCode == 109) {
            this.setMode(Modes.move);
        } else if (e.keyCode == 115) {
            this.setMode(Modes.select);
        } else if (e.keyCode == 99) {
            this.setMode(Modes.connect);
        } else if (e.keyCode == 100) {
            this.setMode(Modes.delete);
        } else if (e.keyCode == 116) {
            this.serialize();
        }
    }

    mouseCoord(e) {
        let offsetX = (e.x - this.start.x - this.center.x - this.transform.x) / this.transform.zoom;
        let offsetY = (e.y - this.start.y - this.center.y - this.transform.y) / this.transform.zoom;
        let x = this.center.x + offsetX;
        let y = this.center.y + offsetY;
        return {x: x, y: y};
    }

    setMode(mode){

        // turn off moving nodes when leaving moveNodes mode
        if (this.mode == Modes.moveNodes){
            Object.entries(this.nodes).forEach(
                ([id, node]) => { 
                    if (node.active) {
                        node.active = false;
                    }
                }
            );
        }


        this.mode = mode;
        this.modeLabel.innerHTML = Modes.title(mode);
        this.area.className = '';
        this.area.classList.add(Modes.class(mode));
        this.clearStagedConnection();
    }

    addNode(node){
        this.scaledArea.appendChild(node.baseElement);
        this.nodes[node.id] = node;
    }

    deleteNode(node){
        delete this.nodes[node.id];
    }

    connect(node) {
        if (this.connection.outNode == undefined) {
            this.connection.outNode = node;
            return;
        }

        if (this.connection.inNode == undefined) {
            this.connection.inNode = node;
        }

        if (this.connection.inNode != this.connection.outNode && 
            !this.connection.inNode.isConnectedTo(this.connection.outNode) &&
            this.connection.inNode.isCompatible(this.connection.outNode)){

            Connection.create(this.connection.inNode, this.connection.outNode, this);
        }

        this.clearStagedConnection();
        this.setMode(Modes.move);
    }

    clearStagedConnection() {
        this.connection.inNode = undefined;
        this.connection.outNode = undefined;
    }

    applyTransform() {
        this.scaledArea.style.transform = 'translate(' + this.transform.x + 'px, ' 
                                        + this.transform.y + 'px) scale(' 
                                        + this.transform.zoom + ')';
    }

    serialize() {
        let nodes = [];
        Object.entries(this.nodes).forEach(
            ([id, node]) => { 
                nodes.push(node.serialize());
            }
        );

        return JSON.stringify(nodes);
    }

    deserialize(text) {
        let nodes;

        try{
            nodes = JSON.parse(text);
        } catch {
            return;
        }

        for (let node of nodes) {
            this.addNode(Node.deserialize(node, this));
        }

        for (let node of nodes) {
            for (let inNode of node.out) {
                this.connect(this.nodes[node.id]);
                this.connect(this.nodes[inNode]);
            }
        }
    }
}

class Node{
    static get newId() {
        if (Node.id == undefined) {
            Node.id = 0;
        }
        return Node.id++;
    }

    set baseElement(value){
        this.element = value;
    }

    get baseElement() {
        return this.element;
    }

    constructor(x, y, editor, data, title){
        this.editor = editor;
        this.active = false; 
        this.data = data;
        this.title = title;

        this.id = Node.newId;

        this.transform = {
            x: x,
            y: y,
        };

        this.inConnections = {};
        this.outConnections = {}; 

        NodeUI.create(this);  
        this.applyTransform();
    }

    mouseDown(e){
        if (this.editor.mode == Modes.select) {
            this.active = true;
            this.editor.setMode(Modes.moveNodes);
        } else if (this.editor.mode == Modes.moveNodes){
            this.editor.setMode(Modes.select);
        } else if (this.editor.mode == Modes.move) {
            this.active = true;
            this.editor.setMode(Modes.moveNodes);
        } else if (this.editor.mode == Modes.connect) {
            this.editor.connect(this);
        } else if (this.editor.mode == Modes.delete) {
            this.delete();
        }

        e.stopPropagation();
    }
 
    move(dx, dy) {
        this.transform.x += dx;
        this.transform.y += dy;
        this.applyTransform();

        Object.entries(this.inConnections).forEach(
            ([id, connection]) => { connection.redraw(); }
        );

        Object.entries(this.outConnections).forEach(
            ([id, connection]) => { connection.redraw(); }
        );
    }

    addInConnection(connection) {
        this.inConnections[connection.outNode.id] = connection;
    }

    addOutConnection(connection) {
        this.outConnections[connection.inNode.id] = connection;
    }

    deleteInConnection(connection) {
        delete this.inConnections[connection.outNode.id];
    }

    deleteOutConnection(connection) {
        delete this.outConnections[connection.inNode.id];
    }

    delete() {
        this.editor.deleteNode(this);

        Object.entries(this.inConnections).forEach(
            ([id, connection]) => { connection.delete(); }
        );

        Object.entries(this.outConnections).forEach(
            ([id, connection]) => { connection.delete(); }
        );

        this.element.parentNode.removeChild(this.element);
        this.editor.clearStagedConnection();
        this.editor.area.focus();
        this.editor.setMode(Modes.move);
    }

    isConnectedTo(node) {
        if (this.inConnections[node.id] === undefined && 
            this.outConnections[node.id] === undefined) {
                return false;
            }

        return true;
    }

    isCompatible(incomingNode){
        let intersect = function (a, b) {
            var t;
            if (b.length > a.length) t = b, b = a, a = t; // indexOf to loop over shorter
            return a.filter(function (e) {
                return b.indexOf(e) > -1;
            });
        };

        if (intersect(Object.keys(this.data.in), incomingNode.data.out).length > 0)
            return true;
        return false;
    }

    applyTransform() {
        this.element.style.transform = 'translate(' + this.transform.x + 'px, ' + this.transform.y + 'px)';
    }

    serialize(){
        return {
            id: this.id,
            in: Object.keys(this.inConnections).map(x => parseInt(x)),
            out: Object.keys(this.outConnections).map(x => parseInt(x)),
            position: this.transform,
            title: this.title,
            data: this.data,
        }
    }

    static deserialize(data, editor) {
        let node = new Node(data.position.x, data.position.y, editor, data.data, data.title);
        node.id = data.id;
        return node;
    }
}

class Connection{

    static create(inNode, outNode, editor) {
        let connection = new Connection(inNode, outNode, editor);
        inNode.addInConnection(connection);
        outNode.addOutConnection(connection);
    }

    set baseElement(value) {
        this.element = value;
    }

    constructor(inNode, outNode, editor){
        this.outNode = outNode;
        this.inNode = inNode;
        this.editor = editor;
        this.id = this.outNode.id + '-' + this.inNode.id;

        UIConnection.create(this);
        this.redraw();
    }

    redraw() {
        let handle = Math.max((this.inNode.transform.x - this.outNode.transform.x) / 2 - 100, 0); 
        let startx = this.outNode.transform.x + 320;
        let starty = this.outNode.transform.y + 20;

        let endx = this.inNode.transform.x;
        let endy = this.inNode.transform.y + 20;

        let d = 'M' + startx + ' ' + starty;
        d += ' C ' + (startx + handle) + ' ' + starty + ', ' + (endx - handle) + ' ' + endy;
        d += ', ' + endx + ' ' + endy;

        this.element.setAttribute('d', d);
    }

    mouseDown(e) {
        if (this.editor.mode == Modes.delete) {
            this.delete();
        }
        e.stopPropagation();
    }

    delete() {
        this.inNode.deleteInConnection(this);
        this.outNode.deleteOutConnection(this);
        this.element.parentNode.removeChild(this.element);
        this.editor.area.focus();
        this.editor.setMode(Modes.move);
    }
}