'use strict';

window.onload = function(e) {

    //On load init new app
    let canvas = document.getElementById('canvas');
    let uploadForm = document.getElementById('upload-flow');
    
    let app = new FlowApp(canvas);
    app.screenshotsEnabled = true;
    
    ///IMPORTANT STATIC SETUP!!!!!
    Shader.dir = '/static/visual/canvas/js/graphics/shaders/src/';
    
    let path = window.location.href.split('/');
    let code = path[path.length - 1];
    
    if (code !== 'canvas' && code !== ''){
        app.init(code);
        uploadForm.style.display = 'none';
    } else {
        app.init();
    }
    app.resize(window.innerWidth, window.innerHeight);

    let input = document.getElementById('file');

    input.onchange = (e) => {
        DataManager.readFile({
            file: e.target.files,
            success: (content) => {
                let data = JSON.parse(content);
                app.load(data);
                uploadForm.style.display = 'none';
            },
            fail: (err) => { console.error(err);},
        });
    };

    /*canvas.addEventListener('dragenter', handlerFunction, false)
    canvas.addEventListener('dragleave', handlerFunction, false)
    canvas.addEventListener('dragover', handlerFunction, false)
    canvas.addEventListener('drop', handlerFunction, false) */

    document.onkeydown = function (event) {
        app.interface.onKeyDown(event.keyCode);
        event.stopPropagation();
    };

    document.onkeyup = function (event) {
        app.interface.onKeyUp(event.keyCode);
        event.stopPropagation();
    };

    canvas.onmousedown = function(event) {
        app.interface.onMouseDown(event.clientX, event.clientY);
        event.stopPropagation();
	};

	canvas.onmouseup = function(event) {
        app.interface.onMouseUp(event.clientX, event.clientY);
        event.stopPropagation();
	};

	canvas.onmousemove = function(event) {
        app.interface.onMouseMove(event.clientX, event.clientY);
        event.stopPropagation();
    };

    window.onresize = function(event) {
        app.resize(window.innerWidth, window.innerHeight);
        event.stopPropagation();
    };
    
    canvas.onwheel = function(event){
        app.interface.wheel(event.deltaY);
        event.preventDefault();
        event.stopPropagation();
    };

    let last = 0;
    
    var loop = function(time){
		app.render();
        //console.log(time, time - last);
        last = time;

		requestAnimationFrame(loop);
	}

    requestAnimationFrame(loop);
    return false;
} 