// SAGE2 is available for use under the SAGE2 Software License
//
// University of Illinois at Chicago's Electronic Visualization Laboratory (EVL)
// and University of Hawai'i at Manoa's Laboratory for Advanced Visualization and
// Applications (LAVA)
//
// See full text, terms and conditions in the LICENSE.txt included file
//
// Copyright (c) 2014


var flowapp = SAGE2_App.extend({
	init: function(data) {
		this.SAGE2Init("canvas", data);	
		this.resizeEvents = "continuous";
		this.maxFPS = 60;
        this.loaded = false;
        
        this.initFlowApp();

		//init gl stuff
		//this.updateDescriptionBox();
		//this.fileLoad();

		/*var _this = this;
		this.element.addEventListener("webglcontextlost", function(event) {
				console.log("WebGL Context Lost");
				console.log(event);
				event.preventDefault();
				_this.loaded = false;
			}, false);

		this.element.addEventListener("webglcontextrestored", function(event) {
				console.log("WebGL Context Restored");
				console.log(event);
				_this.loaded = true;
			}, false);*/

		//this.controls.addButton({type: "default", position: 1, label: "reload", identifier: "reload"});
		//this.controls.addButton({type: "default", position: 2, label: "mode", identifier: "toggle"});
		//this.controls.addButton({type: "default", position: 3, label: "spl--", identifier: "up"});
		//this.controls.addButton({type: "default", position: 4, label: "spl++", identifier: "down"});
		

		this.controls.finishedAddingControls();
	},

	getContextEntries: function() {
		var entries = [];
		var entry   = {};

		entry = {};
		entry.description = "load data";
		entry.callback = "loadData";
		entry.parameters = {};
		entry.inputField = true;
		entry.inputFieldSize = 40;
		entries.push(entry);
 
		return entries;
	},

	loadData: function(data){
		console.log('requesting...');
		
		DataManager.request({
			filename: data.clientInput,
			success: (r) => { this.app.load(JSON.parse(r)); },
			fail: (r) => { console.log(r); },
		});
	},

	/**
	* Load file resources for webgl
	* @method initFlowApp
	*/
	initFlowApp: function() {
        let canvas = this.element;
        Shader.dir = this.resrcPath + '/shaders/';

        //getting files from local fs
        let getFile = function(filename) {
            return new Promise(function(resolve, reject) {
                readFile(filename, function(err, data){
                    if (err) 
                        reject(err); 
                    else 
                        resolve(data);
                });
            });
        };

        //adjust DataManager fiel loading
        DataManager.files = function(options){
            let requests = [];

            for (let file of options.files) {
                requests.push(getFile(file));
            }
    
            Promise.all(requests).then(
                options.success,
                options.fail,
            );
		};
		

		DataManager.request = function(options){
			readFile(options.filename, function(err, data){
                if (err) 
					options.fail(err);
                else 
					options.success(data);
            });
        };

        let path = this.resrcPath;
        DataManager.getIcon = function(url) {
        	return path + '/icons/' + url;
        };

        let app = new FlowApp(canvas);
        app.init();
        app.resize(this.element.width, this.element.height);
		this.app = app;
		this.lastRefresh = Date.now();
        this.loaded = true;
	},

	/**
	 * Load the app from a previous state
	 * @method load
	 * @param state object to initialize or restore the app
	 * @param date time from the server
	 */
	load: function(state, date) {
		/* TODO */
		//console.log(state, date);
		this.app.setState(state);
	},

	/**
	 * Perform on draw loop
	 *
	 * @method draw
	 * @param date time from the server
	 */
	draw: function(date) {
		if (this.loaded === false || this.loaded === undefined)
			return;

		if (Date.now() - this.lastRefresh > 3000){
			this.app.setState(this.state.appState);
			this.lastRefresh = Date.now();
		}
		
		this.app.render();
	},

	/**
	 * Resize viewport webgl context
	 *
	 * @method resize
	 * @param date time from the server
	 */
	resize: function(date) {
		this.loaded = false;
		this.app.resize(this.element.width, this.element.height);
		this.loaded = true;
	},

	/**
	 * Handles event processing for the app
	 *
	 * @method event
	 * @param eventType event type
	 * @param position x and y positions
	 * @param user_id data user data from who triggered the event
	 * @param data other event data
	 * @param date current time from the server
	 */

	event: function(eventType, position, user_id, data, date) {
		if (eventType === "specialKey" && data.state === "down") {
            this.app.interface.onKeyDown(data.code);
			this.state.appState = this.app.getState();
        }

		if (eventType === "specialKey" && data.state === "up") {
			this.app.interface.onKeyUp(data.code);
			this.state.appState = this.app.getState();
		}

		if (eventType === "pointerScroll") {
			this.app.interface.wheel(data.wheelDelta);
			this.state.appState = this.app.getState();	
		}

		if (eventType === "pointerPress" && data.button === "left") {    
			this.app.interface.onMouseDown(position.x, position.y);
			this.state.appState = this.app.getState();
		}

		if (eventType === "pointerRelease" && data.button === "left") {
			this.app.interface.onMouseUp(position.x, position.y);
			this.state.appState = this.app.getState();
		}

		if (eventType === "pointerMove") {
			this.app.interface.onMouseMove(position.x, position.y);
			this.state.appState = this.app.getState();
		}
	},

	quit: function(){
		console.log('app is closing...');
		this.app.quit();
	}
});