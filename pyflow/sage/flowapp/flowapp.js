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

		this.controls.finishedAddingControls();
		console.log('loading app', this.state);

		if (this.state.model !== null){
			this.app.setState(this.state.appstate);
			this.loadData(this.state.model);
		}
	},

	getContextEntries: function() {
		var entries = [];
		var entry   = {};

		entry = {};
		entry.description = "load data";
		entry.callback = "loadDataWidgetCallback";
		entry.parameters = {};
		entry.inputField = true;
		entry.inputFieldSize = 40;
		entries.push(entry);
 
		return entries;
	},

	loadDataWidgetCallback: function(data){
		this.loadData(data.clientInput);
	},

	loadData: function(filepath){
		this.app.ui.updateStatus('reading file...');
		DataManager.request({
			filename: filepath,
			success: (r) => { 
				this.app.load(JSON.parse(r)); 
				this.state.model = filepath;
				this.SAGE2Sync(true);
			},
			fail: (r) => { 
				
				console.error(r); 
				this.app.ui.updateStatus('file not found');
			
			},
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
        this.loaded = true;
	},

	/**
	 * Load the app from a previous state
	 * @method load
	 * @param date time from the server
	 */
	load: function(date) {
		/* TODO */
		this.app.setState(this.state.appstate);
		this.loadData(this.state.model);
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

		this.stateDistribute();
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
			//this.flowUpdateState(this.app.getState());
        }

		if (eventType === "specialKey" && data.state === "up") {
			this.app.interface.onKeyUp(data.code);
			//this.flowUpdateState(this.app.getState());
		}

		if (eventType === "pointerScroll") {
			this.app.interface.wheel(data.wheelDelta);
			//this.flowUpdateState(this.app.getState());
		}

		if (eventType === "pointerPress" && data.button === "left") {    
			this.app.interface.onMouseDown(position.x, position.y);
			//this.flowUpdateState(this.app.getState());
		}

		if (eventType === "pointerRelease" && data.button === "left") {
			this.app.interface.onMouseUp(position.x, position.y);
			//this.flowUpdateState(this.app.getState());
		}

		if (eventType === "pointerMove") {
			this.app.interface.onMouseMove(position.x, position.y);
			//this.flowUpdateState(this.app.getState());
		}
	},


	stateDistribute: function(){
		/* create lastRefresh in case you haven't done that before;
		   following 3 lines can be deleted 
		   and this.lastRefresh = Date.now(); moved into init */
		if (!('lastRefresh' in this)){
			this.lastRefresh = Date.now();
		}

		/* setup custom time timerange how often should state be forced to update */
		if (Date.now() - this.lastRefresh > 3000){
			this.lastRefresh = Date.now();
			
			if(isMaster){
				/* manually set individual properties of state (load);
				   following object should copy exact structure of load variable
				   in instructions.json */
				let newState = {
					'model': this.state.model,
					'appstate': this.app.getState(),
				};

				console.log(newState.appstate);

				/* broadcast state accross browsers */
				this.broadcast('stateUpdate', newState);
			}
		}
	},

	stateUpdate: function(newState){
		/* setup individual keys in this.state from newState */ 
		for (let key in newState){
			this.state[key] = newState[key];
		}

		console.log(this.state.appstate);
		this.app.setState(this.state.appstate);
		this.SAGE2Sync(true);
	},

	quit: function(){
		//console.log('app is closing...');
		this.app.quit();
	}
});