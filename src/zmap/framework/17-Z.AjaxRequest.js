
// TODO: introduce promises

Z.AjaxRequest = (function() {

    function load(url, callback, errorCallback, contentType) {
        var req = new XMLHttpRequest();

        req.onreadystatechange = function() {
            if (req.readyState !== 4) {
                return;
            }

            //if (!req.status || req.status<200 || req.status>299) {
            //    return;
            //}

            callback(req);
        };

        req.onerror = function(){
            errorCallback(req);
        }

        req.open('GET', url);

        if(contentType){
            req.setRequestHeader("Content-Type",contentType);
            //req.responseType = "text";
        }

        req.send(null);

        return {
            abort: function() {
                req.abort();
            }
        };
    }

    //***************************************************************************

    return {
        getText : function(url, callback, scope) {
            return load(url, function(res) {
                if (res.responseText !== undefined) {
                    callback.call(scope, res.responseText);
                }
            },function(e){
                console.warn('ajax request failed');
                callback.call(scope, "");
            });
        },

        getXML : function(url, callback, scope) {
            return load(url, function(res) {
                if (res.responseXML !== undefined) {
                    callback.call(scope, res.responseXML);
                }
            },function(e){
                console.warn('ajax request failed');
                callback.call(scope, null);
            });
        },

        getJSON : function(url, callback, scope, contentType) {
            return load(url, function(res) {
                if (res.responseText) {
                    var json;

                    try {
                        json = JSON.parse(res.responseText);
                    } catch(ex) {
                        console.warn('Could not parse JSON from '+ url +'\n'+ ex.message);
                    }

                    callback.call(scope, json);
                    json = null;
                }
            },function(e){
                console.warn('ajax request failed');
                callback.call(scope, "");
            },
            contentType);
        },

        destroy : function() {}
    };

}());


Z.JSONPRequest = (function() {
    var scriptTag = null;

    function addScriptTag(src) {
        var script = document.createElement('script');
        script.setAttribute("type","text/javascript");
        script.src = src;
        document.body.appendChild(script);

        return script;
    }

    function removeScriptTag(instanceId){
        var scriptTagElement = scriptTag[instanceId];
        
        if(scriptTagElement){
            document.body.removeChild(scriptTagElement);
        }   
    }

    function loadData (jsonpSrc, customCallback, customScope) {
        var instanceId = getInstanceId();
        // var callbackName = "Z['JSONPRequest']['osmbuildingCallback']['" + instanceId + "']";
        var callbackName = "jsonpCallbackTest";
        var callbackFunc = getCallback(instanceId, customCallback, customScope);
        registerCallback(instanceId, callbackFunc);
        scriptTag[instanceId] = addScriptTag(jsonpSrc + '?callback=' + callbackName);
    }

    var jsonpCallback = {};

    var getCallback = function(instanceId, customCallback, customScope){
        //var instanceId = null;
    
        return function(data){
            removeScriptTag(instanceId);
            unregisterCallback(instanceId);
            customCallback.call(customScope, data);
        }
    };

    function registerCallback(id, callback){
        Z.JSONPRequest.osmbuildingCallback[id] = callback;
    }

    function unregisterCallback(id){
        if(Z.JSONPRequest.osmbuildingCallback[id]){
            delete Z.JSONPRequest.osmbuildingCallback[id];
        }
    }

    var searialsNo = 0;
    function getInstanceId(){
        var now = new Date();
        var year = now.getFullYear().toString();
        var month = now.getMonth() + 1;
        var day = now.getDate();
        var hour = now.getHours();
        var minutes = now.getMinutes();
        var seconds = now.getSeconds();
        var no = year+month+day+hour+minutes+seconds + (searialsNo++);
        
        return no;
    }

    //***************************************************************************

    return {
        getJSON : function(url, callback, scope) {
            //var instanceId = getInstanceId();
            
            return loadData(url, callback, scope);
        },

        destroy : function() {}
    };

}());

Z.JSONPRequest.osmbuildingCallback = {};