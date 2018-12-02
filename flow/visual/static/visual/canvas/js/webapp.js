'use strict';

window.onload = function(e) {

    let canvas = document.getElementById('canvas');
    let app = new Canvas(canvas);
    app.init('test-key');


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