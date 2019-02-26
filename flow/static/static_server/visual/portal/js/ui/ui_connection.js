class UIConnection {
    static create(connection) {   
        let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        connection.editor.svg.appendChild(path);
        connection.baseElement = path
        path.onmousedown = (e) => {
            connection.mouseDown(e);
        }
    }
}
