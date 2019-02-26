'use strict';

class FlowApp {
    constructor(canvas) {
        this.canvas = canvas;
        this.interface = new Interface(this);
        this.graphics = new Graphics(canvas);
        this.ui = new FlowAppUI(canvas);
    }

    init(key) {
        this.key = key;
        this.graphics.init();
    }

    load(contents){
        //delete all previously allocated buffers and data etc.
        this.graphics.delete();
        this.ui.delete();

        //allocate new scenes
        for (let scene_id in contents) {
            console.log('loading scene', scene_id);
            this.graphics.addScene(contents[scene_id], this.ui);
        }

        //none was allocated so has to be first scene
		this.ui.displayScene(0); //zero as first scene
    }

    render() {
        this.graphics.render();

        if (this.interface.keys[67]){
            this.interface.keys[67] = false;
            //67 = c 
            console.log('image saved!!');
            //let img = this.canvas.toDataURL("image/png");

            //document.write('<img src="'+img+'"/>');
            //let data = this.canvas.toDataURL('image/png');
            //let win = window.open();

            //let img = document.createElement('img');
            //img.src = data;
            //var url = data.replace(/^data:image\/[^;]+/, 'data:application/octet-stream');
            //window.open(url);
            
            this.canvas.toBlob(function(blob) {
                // Function to download data to a file
                let file = blob;
                if (window.navigator.msSaveOrOpenBlob) // IE10+
                    window.navigator.msSaveOrOpenBlob(file, filename);
                else { // Others
                    let a = document.createElement("a"),
                            url = URL.createObjectURL(file);
                    a.href = url;
                    a.download = 'floaw.png';
                    document.body.appendChild(a);
                    a.click();
                    setTimeout(function() {
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url);  
                    }, 0); 
                }
            });

            //win.document.write('<img src="'+ data +'"/>');
        }

        if (this.interface.keys[84]){
            this.graphics.scene.camera.setPosition(CameraPosition.top);
        }
        if (this.interface.keys[70]){
            this.graphics.scene.camera.setPosition(CameraPosition.front);
        }
        if (this.interface.keys[82]){
            this.graphics.scene.camera.setPosition(CameraPosition.side);
        }

        if (this.interface.keys[87]){
            if (this.interface.keys[16]){
                this.graphics.scene.camera.setPosition(CameraPosition.moveUp);
            } else {
                this.graphics.scene.camera.setPosition(CameraPosition.rotateUp);
            }
        }
        if (this.interface.keys[83]){
            if (this.interface.keys[16]){
                this.graphics.scene.camera.setPosition(CameraPosition.moveDown);
            } else {
                this.graphics.scene.camera.setPosition(CameraPosition.rotateDown);
            }
        }

        if (this.interface.keys[68]){
            if (this.interface.keys[16]){
                this.graphics.scene.camera.moveRight();
            } else {
                this.graphics.scene.camera.setPosition(CameraPosition.rotateRight);
            }
        }
        if (this.interface.keys[65]){
            if (this.interface.keys[16]){
                this.graphics.scene.camera.moveLeft();
            } else {
                this.graphics.scene.camera.setPosition(CameraPosition.rotateLeft);
            }
        }

        if (this.interface.keys[72]){
            this.graphics.scene.camera.setPosition(CameraPosition.origin);
        }
    }

    resize(x, y){
        this.graphics.resize(x, y);
        this.ui.resize(x, y);
    }

    pressed(key){
        if (key === 40){
            //16 = shift 
            if (this.interface.keys[16]){
                this.ui.nextWidget();
            } else {
                this.ui.nextField();
            }
        }

        if (key === 38){
            //16 = shift 
            if (this.interface.keys[16]){
                this.ui.previousWidget();
            } else {
                this.ui.previousField();
            }
        }

        if (key === 39){
            //16 = shift 
            if (this.interface.keys[16]){
                this.ui.nextScene();
            } else {
                //parameter if alt is pressed
                this.ui.nextValue(this.interface.keys[225] || this.interface.keys[18]);
            }
        }

        if (key === 37){
            //16 = shift 
            if (this.interface.keys[16]){
                this.ui.previousScene();
            } else {
                this.ui.previousValue(this.interface.keys[225] || this.interface.keys[18]);
            }
        }

        if (key === 13){
            let sceneId = this.ui.selectedScene;
            this.graphics.displayScene(sceneId);
            this.ui.displayScene(sceneId);
        }

        if (key === 77){
            this.ui.toggleMenu();
        }

        if (key === 80){
            this.graphics.scene.camera.toggleMode();
        }
    }

    
}