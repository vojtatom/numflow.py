'use strict';

/**
 * Helper class, containing only static variables.
 * JavaScript variant of a smart enum.
 */
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
/**
 * Class representing the pipeline editor.
 */
class Editor{
    /**
     * Create a new editor.
     */
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

        this.help = true;
        this.toggleHelp();

        
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
            fail: (r) => console.error(r),
        });
    }

    /**
     * Toggle the visibility of the contents of the help widget.
     */
    toggleHelp(){
        let help = document.querySelectorAll('.hide-help');

        for (let elem of help) {
            elem.style.display = this.help ? 'none' : 'inline-block';
        }

        this.help = !this.help;
    }

    /**
     * Callback frou mouse press.
     * 
     * @param {Event} e event object
     */
    mouseDown(e) {
        this.mouse.down = true;
        this.setMode(Modes.move);
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
    }

    /**
     * Callback for mouse release.
     * 
     * @param {Event} e event object 
     */
    mouseUp(e) {
        this.mouse.down = false;
        this.mouse.dragged = false;
    }

    /**
     * Callback for mouse move.
     * 
     * @param {Event} e event object 
     */
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

    /**
     * Callback for wheel rotation.
     * 
     * @param {Event} e event object 
     */
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

    /**
     * Callback for window resize.
     * 
     * @param {Event} e event object 
     */
    resize(e){
        const rect = this.area.getBoundingClientRect();
        this.center = { x: this.area.offsetWidth / 2, y: this.area.offsetHeight / 2 };
        this.start = { x: rect.left, y: rect.top };
    }

    /**
     * Callback for key press inside the editor.
     * 
     * @param {Event} e event object 
     */
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
        } else if (e.keyCode == 104) {
            //HELP
            console.log("help");
            this.toggleHelp();
        }
    }

    /**
     * Method to get the mouse position during the event.
     * 
     * @param {Event} e event object
     */
    mouseCoord(e) {
        let offsetX = (e.x - this.start.x - this.center.x - this.transform.x) / this.transform.zoom;
        let offsetY = (e.y - this.start.y - this.center.y - this.transform.y) / this.transform.zoom;
        let x = this.center.x + offsetX;
        let y = this.center.y + offsetY;
        return {x: x, y: y};
    }

    /**
     * Set the editor mode. Uses Modes class.
     * @param {Modes.*} mode 
     */
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
        this.modeLabel.innerHTML = "mode: " + Modes.title(mode);
        this.area.className = '';
        this.area.classList.add(Modes.class(mode));
        this.clearStagedConnection();
    }

    /**
     * Set the editor status.
     * 
     * @param {string} message 
     */
    status(message){
        this.messageLabel.innerHTML = message;
    }

    /**
     * Add node to the editor.
     * 
     * @param {Node} node 
     */
    addNode(node){
        this.scaledArea.appendChild(node.baseElement);
        this.nodes[node.id] = node;
    }

    /**
     * Delete node form the editor.
     * 
     * @param {Node} node 
     */
    deleteNode(node){
        delete this.nodes[node.id];
    }

    /**
     * Try to stage a connection of a node.
     * Requires calling this method twice to
     * create a complete connection.
     * 
     * @param {Node} node 
     */
    connect(node) {
        if (this.connection.outNode == undefined) {
            this.connection.outNode = node;
            this.status("Connect second node");
            return;
        }

        if (this.connection.inNode == undefined) {
            this.connection.inNode = node;
        }

        if (this.connection.inNode != this.connection.outNode){
            if (!this.connection.inNode.isConnectedTo(this.connection.outNode)){
                if(this.connection.inNode.isCompatible(this.connection.outNode)){
                    Connection.create(this.connection.inNode, this.connection.outNode, this);
                    this.status("Nodes connected.");
                } else {
                    this.status("Selected nodes are not compatible");
                }
            } else {
                this.status("Selected nodes are already connected");
            }
        } else {
            this.status("Cannot connect the same node.");
        }

        this.clearStagedConnection();
        this.setMode(Modes.move);
    }

    /**
     * Cleares staged connection.
     */
    clearStagedConnection() {
        this.connection.inNode = undefined;
        this.connection.outNode = undefined;
    }

    /**
     * Applies editor space transformation. 
     */
    applyTransform() {
        this.scaledArea.style.transform = 'translate(' + this.transform.x + 'px, ' 
                                        + this.transform.y + 'px) scale(' 
                                        + this.transform.zoom + ')';

        this.status("");
    }

    /**
     * Produce serialized description of the computation pipeline.
     */
    serialize() {
        let nodes = [];
        Object.entries(this.nodes).forEach(
            ([id, node]) => { 
                nodes.push(node.serialize());
            }
        );

        return JSON.stringify(nodes, null, 4);
    }

    /**
     * Reconstruct the contents of the editor from JSON encoded
     * pipeline representation.
     * 
     * @param {string} text 
     */
    deserialize(text) {
        let nodes;

        try{
            nodes = JSON.parse(text);
        } catch {
            console.error('notebook format corrupted');
            this.status("Notebook cannot be loaded.");
            UITerminal.addLine('Notebook format corrupted, editor is unable to create a graph.', 'error');
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

        this.status("Notebook loaded.");
    }
}

/**
 * Represents a single node from the Editor.
 */
class Node{
    /**
     * Get new node id.
     */
    static get newId() {
        if (Node.id == undefined) {
            Node.id = 0;
        }
        return Node.id++;
    }

    /**
     * Set base node HTML element.
     */
    set baseElement(value){
        this.element = value;
    }

    /**
     * Get base node HTML element.
     */
    get baseElement() {
        return this.element;
    }

    /**
     * Construct a new node.
     * 
     * @param {int} x x position of the node
     * @param {int} y y position of the node
     * @param {Editor} editor editor class where the node is conatined
     * @param {object} data object containing parameters, input and output types of the node
     * @param {string} title node title
     */
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

    /**
     * Callback frou mouse press.
     * 
     * @param {Event} e event object
     */
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

    /**
     * Callback frou mouse release.
     * 
     * @param {Event} e event object
     */
    mouseUp(e) {
        if (this.active){
            this.active = false;
            if (this.editor.mode == Modes.moveNodes){
                this.editor.setMode(Modes.select);
            }
            e.stopPropagation();
        }
    }
 
    /**
     * Move the node to the specified position. 
     * 
     * @param {int} dx x delta from the current position of the node
     * @param {int} dy y delta from the current position of the node
     */
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

    /**
     * Add incoming connection.
     * 
     * @param {Connection} connection incoming connection
     */
    addInConnection(connection) {
        this.inConnections[connection.outNode.id] = connection;
    }

    /**
     * Add outcoming connection.
     * 
     * @param {Connection} connection outcomming conneciton
     */
    addOutConnection(connection) {
        this.outConnections[connection.inNode.id] = connection;
    }

    /**
     * Delete incoming connection.
     * 
     * @param {Connection} connection incoming connection
     */  
    deleteInConnection(connection) {
        delete this.inConnections[connection.outNode.id];
    }

    /**
     * Delete outcoming connection.
     * 
     * @param {Connection} connection outcoming connection
     */  
    deleteOutConnection(connection) {
        delete this.outConnections[connection.inNode.id];
    }

    /**
     * Delete node and all of its connecitons.
     */
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

    /**
     * Test if the node is connected to the node passed as the parameter.
     * 
     * @param {Node} node 
     */
    isConnectedTo(node) {
        if (this.inConnections[node.id] === undefined && 
            this.outConnections[node.id] === undefined) {
                return false;
            }

        return true;
    }

    /**
     * Test if the node is compatible as a successor of the parameter node.
     * 
     * @param {Node} incomingNode incoming node
     */
    isCompatible(incomingNode){
        let intersect = function (a, b) {
            var t;
            if (b.length > a.length) t = b, b = a, a = t; // indexOf to loop over shorter
            return a.filter(function (e) {
                return b.indexOf(e) > -1;
            });
        };

        if (intersect(Object.keys(this.data.in), Object.keys(incomingNode.data.out)).length > 0)
            return true;
        return false;
    }

    /**
     * Apply the tranlation of the node to the HTML element.
     */
    applyTransform() {
        this.element.style.transform = 'translate(' + this.transform.x + 'px, ' + this.transform.y + 'px)';
    }

    /**
     * Serialize the contents of the node.
     */
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

    /**
     * Deserialize the node according to the JSON deserialized object data.
     * 
     * @param {string} data 
     * @param {Editor} editor 
     */
    static deserialize(data, editor) {
        let node = new Node(data.position.x, data.position.y, editor, data.data, data.title);
        node.id = data.id;
        Node.id = Math.max(data.id + 1, Node.id);
        return node;
    }
}

/**
 * Class representing a connection between two nodes.
 */
class Connection{

    /**
     * Create a new connection between input and output nodes.
     * Automatically inserts the connection into the editor and the connected nodes.
     * @param {Node} inNode 
     * @param {Node} outNode 
     * @param {Editor} editor 
     */
    static create(inNode, outNode, editor) {
        let connection = new Connection(inNode, outNode, editor);
        inNode.addInConnection(connection);
        outNode.addOutConnection(connection);
    }

    set baseElement(value) {
        this.element = value;
    }

    /**
     * Create a new connection between input and output nodes.
     * 
     * @param {Node} inNode 
     * @param {Node} outNode 
     * @param {Editor} editor 
     */
    constructor(inNode, outNode, editor){
        this.outNode = outNode;
        this.inNode = inNode;
        this.editor = editor;
        this.id = this.outNode.id + '-' + this.inNode.id;

        UIConnection.create(this);
        this.redraw();
    }

    /**
     * Redraw the html element.
     */
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

    /**
     * Callback for the mouse click.
     * 
     * @param {Event} e event object
     */
    mouseDown(e) {
        if (this.editor.mode == Modes.delete) {
            this.delete();
        }
        e.stopPropagation();
    }

    /**
     * Delete the connection.
     */
    delete() {
        this.inNode.deleteInConnection(this);
        this.outNode.deleteOutConnection(this);
        this.element.parentNode.removeChild(this.element);
        this.editor.area.focus();
        this.editor.setMode(Modes.move);
    }
}