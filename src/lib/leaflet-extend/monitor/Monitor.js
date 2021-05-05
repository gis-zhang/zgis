/**
 * 事件监听器，用来进行同一页面中不同面板间的事件交互
 */
EventMonitor = {
    listeners: {}
}

EventMonitor.register = function (panelId, event, func) {
    if (!targetPanelId || !targetEvent || !func) {
        return;
    }

    var regId = panelId + "_" + event;

    if (!this.listeners[regId]) {
        this.listeners[regId] = [];
    }

    this.listeners[regId].push(func);
}

EventMonitor.unregister = function (func) {
    var found = false;

    for (listener in this.listeners) {
        var curLis = this.listeners[listener];

        for (var i = 0; i < curLis.length; i++) {
            if (curLis[i] == func) {
                curLis.splice(i, 1);
                found = true;
                break;
            }
        }

        if (found) {
            break;
        }
    }
}

EventMonitor.fire = function (panelId, event, params) {
    var funcList = this.listeners[panelId + "_" + event];

    if (funcList) {
        for (var i = 0; i < funcList.length; i++) {
            try {
                funcList[i](params);
            } catch (e) {

            }
        }
    }
}