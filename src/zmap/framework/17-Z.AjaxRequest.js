
// TODO: introduce promises

Z.AjaxRequest = (function() {

    function load(url, callback, errorCallback) {
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

        getJSON : function(url, callback, scope) {
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
            });
        },

        destroy : function() {}
    };

}());
