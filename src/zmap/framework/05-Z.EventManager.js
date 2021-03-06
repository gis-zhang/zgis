/**
 * Created by Administrator on 2015/10/23.
 */
//Z.EventManager = L.Mixin.Events;
var eventsKey = '_leaflet_events';

Z.EventManager = {
    addEventListener: function (types, fn, context) { // (String, Function[, Object]) or (Object[, Object])
        // types can be a map of types/handlers
        if ((typeof types === 'object' && !(types instanceof Array)) && Z.Util.invokeEach(types, this.addEventListener, this, fn, context)) { return this; }

        var events = this[eventsKey] = this[eventsKey] || {},
            contextId = context && context !== this && Z.stamp(context),
            i, len, event, type, indexKey, indexLenKey, typeIndex;

        // types can be a string of space-separated words
        if(typeof types === "string"){
            if(types.indexOf(" ") >= 0){
                types = Z.Util.splitWords(types);
            }else{
                types = [types];
            }
        }

        for (i = 0, len = types.length; i < len; i++) {
            event = {
                action: fn,
                context: context || this
            };
            type = types[i];

            if (contextId) {
                // store listeners of a particular context in a separate hash (if it has an id)
                // gives a major performance boost when removing thousands of map layers

                indexKey = type + '_idx';
                indexLenKey = indexKey + '_len';

                typeIndex = events[indexKey] = events[indexKey] || {};

                if (!typeIndex[contextId]) {
                    typeIndex[contextId] = [];

                    // keep track of the number of keys in the index to quickly check if it's empty
                    events[indexLenKey] = (events[indexLenKey] || 0) + 1;
                }

                typeIndex[contextId].push(event);
            } else {
                events[type] = events[type] || [];
                events[type].push(event);
            }
        }

        return this;
    },

    hasEventListeners: function (type) { // (String) -> Boolean
        var events = this[eventsKey];
        return !!events && ((type in events && events[type].length > 0) ||
            (type + '_idx' in events && events[type + '_idx_len'] > 0));
    },

    removeEventListener: function (types, fn, context) { // ([String, Function, Object]) or (Object[, Object])

        if (!this[eventsKey]) {
            return this;
        }

        if (!types) {
            return this.clearAllEventListeners();
        }

        if ((typeof types === 'object' && !(types instanceof Array)) && Z.Util.invokeEach(types, this.removeEventListener, this, fn, context)) { return this; }

        var events = this[eventsKey],
            contextId = context && context !== this && Z.stamp(context),
            i, len, type, listeners, j, indexKey, indexLenKey, typeIndex, removed;

        //types = Z.Util.splitWords(types);
        if(typeof types === "string"){
            if(types.indexOf(" ") >= 0){
                types = Z.Util.splitWords(types);
            }else{
                types = [types];
            }
        }

        for (i = 0, len = types.length; i < len; i++) {
            type = types[i];
            indexKey = type + '_idx';
            indexLenKey = indexKey + '_len';

            typeIndex = events[indexKey];

            if (!fn) {
                // clear all listeners for a type if function isn't specified
                delete events[type];
                delete events[indexKey];
                delete events[indexLenKey];

            } else {
                listeners = contextId && typeIndex ? typeIndex[contextId] : events[type];

                if (listeners) {
                    for (j = listeners.length - 1; j >= 0; j--) {
                        if ((listeners[j].action === fn) && (!context || (listeners[j].context === context))) {
                            removed = listeners.splice(j, 1);
                            // set the old action to a no-op, because it is possible
                            // that the listener is being iterated over as part of a dispatch
                            removed[0].action = Z.Util.falseFn;
                        }
                    }

                    if (context && typeIndex && (listeners.length === 0)) {
                        delete typeIndex[contextId];
                        events[indexLenKey]--;
                    }
                }
            }
        }

        return this;
    },

    clearAllEventListeners: function () {
        delete this[eventsKey];
        return this;
    },

    fireEvent: function (type, data) { // (String[, Object])
        if (!this.hasEventListeners(type)) {
            return this;
        }

        var event = Z.Util.extend({}, data, { type: type, target: this });

        var events = this[eventsKey],
            listeners, i, len, typeIndex, contextId;

        if (events[type]) {
            // make sure adding/removing listeners inside other listeners won't cause infinite loop
            listeners = events[type].slice();

            for (i = 0, len = listeners.length; i < len; i++) {
                listeners[i].action.call(listeners[i].context, event);
            }
        }

        // fire event for the context-indexed listeners as well
        typeIndex = events[type + '_idx'];

        for (contextId in typeIndex) {
            listeners = typeIndex[contextId].slice();

            if (listeners) {
                for (i = 0, len = listeners.length; i < len; i++) {
                    listeners[i].action.call(listeners[i].context, event);
                }
            }
        }

        return this;
    },

    addOneTimeEventListener: function (types, fn, context) {

        if (Z.Util.invokeEach(types, this.addOneTimeEventListener, this, fn, context)) { return this; }

        var handler = Z.bind(function () {
            this
                .removeEventListener(types, fn, context)
                .removeEventListener(types, handler, context);
        }, this);

        return this
            .addEventListener(types, fn, context)
            .addEventListener(types, handler, context);
    }
};

Z.EventManager.on = Z.EventManager.addEventListener;
Z.EventManager.off = Z.EventManager.removeEventListener;
Z.EventManager.once = Z.EventManager.addOneTimeEventListener;
Z.EventManager.fire = Z.EventManager.fireEvent;