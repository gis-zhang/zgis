/*
 * L.Control.Layers is a control to allow users to switch between different layers on the map.
 */

L.Control.Layers.Custom = L.Control.Layers.extend({
    //    initialize: function (baseLayers, overlays, options) {
    //        L.setOptions(this, options);

    //        this._layers = {};
    //        this._lastZIndex = 0;
    //        this._handlingClick = false;

    //        for (var i in baseLayers) {
    //            this._addLayer(baseLayers[i], i);
    //        }

    //        for (i in overlays) {
    //            this._addLayer(overlays[i], i, true);
    //        }
    //    },

    //显示初始图层
//    showInitialLayer: function () {
//        var inputs = this._form.getElementsByTagName('input');
//    },

    onAdd: function (map) {
        this._initLayout();
        this._update();

        map
		    .on('layeradd', this._onLayerChange, this)
		    .on('layerremove', this._onLayerChange, this);

        //this.showInitialLayer();

        return this._container;
    },

    removeLayer: function (layer) {
        var layerList = layer instanceof Array ? layer : [layer];

        //        for (var loop = 0; loop < layerList.length; loop++) {
        //            var id = L.stamp(layerList[loop]);
        //            delete this._layers[id];
        //        }
        var id = L.stamp(layerList[0]);
        delete this._layers[id];

        this._update();
        return this;
    },

    _addLayer: function (layer, name, overlay) {
        var layerList = layer instanceof Array ? layer : [layer];

        //        for (var loop = 0; loop < layerList.length; loop++) {
        //            var id = L.stamp(layerList[loop]);

        //            this._layers[id] = {
        //                layer: layerList[loop],
        //                name: name,
        //                overlay: overlay
        //            };

        //            if (this.options.autoZIndex && layer.setZIndex) {
        //                this._lastZIndex++;
        //                layer.setZIndex(this._lastZIndex);
        //            }
        //        }

        var id = L.stamp(layerList[0]);

        this._layers[id] = {
            layer: layerList,
            name: name,
            overlay: overlay
        };

        if (this.options.autoZIndex && layer.setZIndex) {
            for (var loop = 0; loop < layerList.length; loop++) {
                this._lastZIndex++;
                layerList[loop].setZIndex(this._lastZIndex);
            }
        }
    },

    _onLayerChange: function (e) {
        //        var obj = this._layers[L.stamp(e.layer)];

        //        if (!obj) { return; }

        //        if (!this._handlingClick) {
        //            this._update();
        //        }

        //        var type = obj.overlay ?
        //			(e.type === 'layeradd' ? 'overlayadd' : 'overlayremove') :
        //			(e.type === 'layeradd' ? 'baselayerchange' : null);

        //        if (type) {
        //            this._map.fire(type, obj);
        //        }
    },

    _addItem: function (obj) {
        var label = document.createElement('label'),
		    input,
        //checked = this._map.hasLayer(obj.layer);
            checked = this._map.hasLayer(obj.layer[0]);

        if (obj.overlay) {
            input = document.createElement('input');
            input.type = 'checkbox';
            input.className = 'leaflet-control-layers-selector';
            input.defaultChecked = checked;
        } else {
            input = this._createRadioElement('leaflet-base-layers', checked);
        }

        //input.layerId = L.stamp(obj.layer);
        input.layerId = L.stamp(obj.layer[0]);

        L.DomEvent.on(input, 'click', this._onInputClick, this);

        var name = document.createElement('span');
        name.innerHTML = ' ' + obj.name;

        label.appendChild(input);
        label.appendChild(name);

        var container = obj.overlay ? this._overlaysList : this._baseLayersList;
        container.appendChild(label);

        return label;
    },

    _onInputClick: function () {
        var i, input, obj,
		    inputs = this._form.getElementsByTagName('input'),
		    inputsLen = inputs.length;

        this._handlingClick = true;

        for (i = 0; i < inputsLen; i++) {
            input = inputs[i];
            obj = this._layers[input.layerId];

            //            if (input.checked && !this._map.hasLayer(obj.layer)) {
            //                this._map.addLayer(obj.layer);

            //            } else if (!input.checked && this._map.hasLayer(obj.layer)) {
            //                this._map.removeLayer(obj.layer);
            //            }

            if (input.checked && !this._map.hasLayer(obj.layer[0])) {
                for (var layerLength = 0; layerLength < obj.layer.length; layerLength++) {
                    this._map.addLayer(obj.layer[layerLength]);
                }

            } else if (!input.checked && this._map.hasLayer(obj.layer[0])) {
                for (var layerLength = 0; layerLength < obj.layer.length; layerLength++) {
                    this._map.removeLayer(obj.layer[layerLength]);
                }
            }
        }

        this._handlingClick = false;

        this._refocusOnMap();
    }

});