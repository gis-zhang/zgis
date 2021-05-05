L.Texttip = L.Class.extend({
    initialize: function (map) {
        this._map = map;

        if (map instanceof Map) {
            this._map = map.map;
        }

        this._popupPane = this._map._panes.popupPane;

        //this._container = map.options.drawControlTooltips ? L.DomUtil.create('div', 'leaflet-draw-tooltip', this._popupPane) : null;
        this._container = L.DomUtil.create('div', 'leaflet-texttip', this._popupPane);
        this._singleLineLabel = false;
    },

    dispose: function () {
        if (this._container) {
            this._popupPane.removeChild(this._container);
            this._container = null;
        }
    },

    updateContent: function (labelText) {
        if (!this._container) {
            return this;
        }
        labelText.subtext = labelText.subtext || '';

        // update the vertical position (only if changed)
        if (labelText.subtext.length === 0 && !this._singleLineLabel) {
            L.DomUtil.addClass(this._container, 'leaflet-texttip-single');
            this._singleLineLabel = true;
        }
        else if (labelText.subtext.length > 0 && this._singleLineLabel) {
            L.DomUtil.removeClass(this._container, 'leaflet-texttip-single');
            this._singleLineLabel = false;
        }

        this._container.innerHTML =
			(labelText.subtext.length > 0 ? '<span class="leaflet-texttip-subtext">' + labelText.subtext + '</span>' + '<br />' : '') +
			'<span>' + labelText.text + '</span>';

        return this;
    },

    updatePosition: function (latlng) {
        var pos = this._map.latLngToLayerPoint(latlng),
			tooltipContainer = this._container;

        if (this._container) {
            tooltipContainer.style.visibility = 'inherit';
            L.DomUtil.setPosition(tooltipContainer, pos);
        }

        return this;
    },

    showAsError: function () {
        if (this._container) {
            L.DomUtil.addClass(this._container, 'leaflet-error-texttip');
        }
        return this;
    },

    removeError: function () {
        if (this._container) {
            L.DomUtil.removeClass(this._container, 'leaflet-error-texttip');
        }
        return this;
    },

    hide: function () {
        if (this._container) {
            this._container.style.display = 'hide';
        }
    },

    show: function () {
        if (this._container) {
            this._container.style.display = 'block';
        }
    }
});