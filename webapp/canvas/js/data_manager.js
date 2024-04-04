'use strict';

/**
 * DataManager handles the HTTP requests.
 * The calss offers a set of methods 
 * suitable for different situations.
 * 
 * Each method accepts an object specifying 
 * the request parameters.
 * Following object structure is expected:
 * {
 * 'method': 'POST' | 'GET'
 * 'decode': whether the response data should be JSON-deserialized 
 * 'headers': list of custom request headers
 * 'data': request contents
 * 'form': JavaScript Form object
 * 'progress': bool 
 * 'files': list of requested files
 * 
 * 'success': callback for success response
 * 'fail': callback for fil response
 * 'url': target url of the request
 * } 
 */
class DataManager {
    /**
     * It is expected that this method will be called very frequently.
     * The internal implementation sends the requests with a delay to prevent 
     * overload.
     * 
     * @param {object} options request parameters
     */
    static requestFrequent(options) {
           if (DataManager.changeTimer !== false)
               clearTimeout(DataManager.changeTimer);
   
               DataManager.changeTimer = setTimeout(() => {
               return DataManager.request(options);
           }, 300);
       }

    /**
     * Send a standard request
     * 
     * @param {object} options request parameters
     */
    static request(options) {
        if (!('method' in options))
            options['method'] = 'POST';

        let request = new XMLHttpRequest();
        let token = Cookies.get('csrftoken');

        request.open(options.method, options.url, true);
        request.setRequestHeader('X-CSRFTOKEN', token);
        request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

        request.onload = function () {
            if (request.status === 200) {
                let response = request.responseText;
                if ('decode' in options && options.decode)
                    response = JSON.parse(response);
                options.success(response, request.responseURL);
            } else {
                options.fail(request.responseText);
            }
        };

        if ('headers' in options)
            request.setRequestHeader(...options.headers);

        if ('data' in options) {
            let data = JSON.stringify(options.data);
            request.setRequestHeader('Content-type', 'application/json');
            request.send(data);
        } else if ('form' in options) {
            request.send(options.form);
        } else {
            request.send();
        }
    }

    /**
     * Upload a file.
     * 
     * @param {object} options request parameters
     */
    static upload(options) {
        let request = new XMLHttpRequest();
        let token = Cookies.get('csrftoken');

        request.open('POST', options.url, true);
        request.setRequestHeader('X-CSRFTOKEN', token);
        request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

        request.onload = function () {
            if (request.status === 200) {
                options.success(request.responseText, request.responseURL);
            } else {
                options.fail(request.responseText);
            }
        };

        if ('progress' in options){
            // progress bar
            request.upload.onprogress = function(e) {
                let p = (e.loaded / e.total * 100);
                options.progress(p);
            };
        }

        request.send(options.data);
    }

    /**
     * Get files from url.
     * 
     * @param {object} options request parameters
     */
    static files(options) {
        let requests = [];

        for (let file of options.files) {
            requests.push(DataManager.getPromise(file));
        }

        Promise.all(requests).then(
            options.success,
            options.fail,
        );
    }

    /**
     * Support method for the files routine.
     * 
     * @param {object} url 
     */
    static getPromise(url) {
        return new Promise(function (resolve, reject) {
            var request = new XMLHttpRequest();
            request.open('GET', url);

            request.onload = function () {
                if (request.status == 200) {
                    resolve(request.response);
                }
                else {
                    reject(Error(request.statusText));
                }
            };

            request.onerror = function () {
                reject(Error("Network Error"));
            };

            request.send();
        });
    }

    /**
     * Load a static icon.
     * 
     * @param {object} url 
     */
    static getIcon(url) {
        return '/static/visual/canvas/icons/' + url;
    }

    /**
     * Get a file from url and read its contents.
     * 
     * @param {object} options request parameters
     */
    static readFile(options){
        // File reader and uploader...
        let handleFiles = function (file) {
            file = file[0];
            let reader = new FileReader();
        
            reader.onloadend = function(e) {
                if (e.target.readyState == FileReader.DONE) { // DONE == 2
                    options.success(e.target.result);
                } else {
                    options.fail(e);
                }
            };

            reader.readAsBinaryString(file);
        }

        handleFiles(options.file);
    }
}
