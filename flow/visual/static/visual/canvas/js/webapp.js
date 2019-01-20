'use strict';

window.onload = function(e) {

    //On load init new app
    let canvas = document.getElementById('canvas');
    let uploadForm = document.getElementById('upload-flow');
    
    let app = new FlowApp(canvas);
    app.init('test-key');
    app.graphics.resize(window.innerWidth, window.innerHeight);


    // File reader and uploader...
    let handleFiles = function (file) {
        file = file[0];
        let reader = new FileReader();
    
        reader.onloadend = function(e) {
            if (e.target.readyState == FileReader.DONE) { // DONE == 2
                let data = JSON.parse(e.target.result);
                app.load(data);
                uploadForm.style.display = 'none';
            }
        };
      
        reader.readAsBinaryString(file);
    }

    let input = document.getElementById('file');
    input.onchange = (e) => {
        handleFiles(e.target.files);
    }

    /*canvas.addEventListener('dragenter', handlerFunction, false)
    canvas.addEventListener('dragleave', handlerFunction, false)
    canvas.addEventListener('dragover', handlerFunction, false)
    canvas.addEventListener('drop', handlerFunction, false) */

    document.onkeydown = function (event) {
        app.interface.onKeyDown(event.keyCode);
    };

    document.onkeyup = function (event) {
        app.interface.onKeyUp(event.keyCode);
    };

    document.onmousedown = function(event) {
		app.interface.onMouseDown(event.clientX, event.clientY);
	};

	document.onmouseup = function(event) {
		app.interface.onMouseUp(event.clientX, event.clientY);
	};

	document.onmousemove = function(event) {
		app.interface.onMouseMove(event.clientX, event.clientY);
    };

    window.onresize = function(event) {
		app.graphics.resize(window.innerWidth, window.innerHeight);
    };
    
    canvas.onwheel = function(event){
        app.interface.wheel(event.deltaY);
        event.preventDefault();
    };

    
    var loop = function(){
		app.render();
		requestAnimationFrame(loop);
	}

    requestAnimationFrame(loop);
    return false;
} 