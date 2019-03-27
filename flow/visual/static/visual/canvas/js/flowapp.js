'use strict';

class FlowApp {
    constructor(canvas) {
        this.canvas = canvas;
        this.interface = new Interface(this);
        this.graphics = new Graphics(canvas);
        this.ui = new FlowAppUI(canvas);

        this.screenshotsEnabled = false;
        this.stateToBeLoaded = null;
    }

    init(code = null) {
        this.code = code;
        this.graphics.init();

        if (code !== null){
            let getData = (url) => {
                this.ui.updateStatus('loading model from server...');
                DataManager.request({
                    method: 'GET',
                    url: url ? url : '/media/notebook/' + this.code + '/output.imgflow',
                    decode: true,
                    success: (contents) => { 
                        this.load(contents);
                        this.ui.updateStatus('model loaded');
                    },
                    fail: (r) => { 
                        console.error(r); 
                        this.ui.updateStatus('there is no model to be loaded');
                    }
                })
            }

            //console.log('notebook', code);

            let url = window.location.host.split(':');
            let socket = new ReconnectingWebSocket(
                'ws://' + url[0] +
                ':9000/ws/terminal/' + this.code + '/');

            socket.onmessage = (e) => {
                let data = JSON.parse(e.data);
                if (data.type === 'update'){
                    getData(data.url);
                }
            };

            socket.onerror = (e) => {
                console.error(e);
            };

            getData();
        } else {
            this.ui.updateStatus('waiting for model file from user');
        }

    }

    load(contents){
        //delete all previously allocated buffers and data etc.
        this.ui.updateStatus('deleting old graphics');
        this.graphics.delete();
        this.ui.delete();

        //allocate new scenes
        this.ui.updateStatus('loading new models');
        for (let scene_id in contents) {
            //console.log('loading scene', scene_id);
            this.graphics.addScene(contents[scene_id], this.ui);
        }

        //none was allocated so has to be first scene
        this.ui.displayScene(0); //zero as first scene
        this.ui.updateStatus('model loaded');
    }

    render() {
        this.graphics.render();

        if (this.interface.keys[67] && this.screenshotsEnabled){
            //setup canvas
            this.ui.updateStatus('rendering and saving image...');
            this.canvas.width = 3840;
            this.canvas.height = 2160;
            this.graphics.resize(3840, 2160);
            this.graphics.render();
            
            //67 = c 
            this.interface.keys[67] = false;
            this.saveCanvas('flowimage.png');
        }

        if (this.interface.keys[86] && this.screenshotsEnabled){
            //setup canvas
            this.ui.updateStatus('rendering and saving images...');
            this.canvas.width = 3840;
            this.canvas.height = 1080;
           
            this.graphics.resize(3840, 1080, 0, true);
            this.graphics.renderColor();
            this.graphics.resize(3840, 1080, 1920, true);
            this.graphics.renderDepth();
            
            //86 = v
            this.interface.keys[86] = false;           
            this.saveCanvas('3dvision.png');
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
    }

    saveCanvas(name){
        this.canvas.toBlob((blob) => {
            // Function to download data to a file
            let file = blob;
            if (window.navigator.msSaveOrOpenBlob) // IE10+
                window.navigator.msSaveOrOpenBlob(file, filename);
            else { // Others
                console.log(file);
                let a = document.createElement("a"),
                        url = URL.createObjectURL(file);
                a.href = url;
                a.download = name;
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);  

                    this.canvas.width = '100%';
                    this.canvas.height = '100%';
                    this.graphics.resize(this.dim.x, this.dim.y);
                    this.ui.updateStatus('image saved');
                }, 0); 
            }
        });
    }

    resize(x, y){
        this.dim = {
            x: x,
            y: y,
        };

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

        //help
        if (key === 72){
            this.ui.toggleHelp();
            //this.graphics.scene.camera.setPosition(CameraPosition.origin);
        }

        this.graphics.scene.camera.sceneChanged = true;
    }

    getState(){
        if (this.graphics.loaded && this.stateToBeLoaded === null){
            let state = [this.graphics.getState(), this.ui.getState()];
            return state;
        } else {
            return this.stateToBeLoaded;
        }
    }

    setState(state){
        if (this.graphics.loaded){
            this.graphics.setState(state[0]);
            this.ui.setState(state[1]);
            this.stateToBeLoaded = null;
        } else {
            this.stateToBeLoaded = state;
        }
    }

    quit(){
        this.graphics.delete(true);
    }

    
}