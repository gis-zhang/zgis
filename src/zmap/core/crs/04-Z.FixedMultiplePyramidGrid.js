/**
 * Created by Administrator on 2015/11/20.
 */
Z.FixedMultiplePyramidGrid = Z.AbstractPyramidGrid.extend({
    initialize: function(options){
        options = options || {};
        //options.origin = options.origin || new Z.LatLng(20037508.3427892, -20037508.3427892);
        options.origin = options.origin || new Z.LatLng(0, 0);

        Z.AbstractPyramidGrid.prototype.initialize.apply(this, arguments);

        this.startZoom = isNaN(options.startZoom) ? 0 : parseInt(options.startZoom);
        this.endZoom = isNaN(options.endZoom) ? 18 : parseInt(options.endZoom);
        this.multiplier = options.multiplier || 2;
        this.baseZoom = 0;
        //this.baseResolution = options.baseResolution || (20037508.3427892 * 2 / this._tileSize.x);
        this.baseResolution = options.baseResolution || 1;

        //var defaultBaseScale = this._dpi * Math.abs(this._crs.latLngToMeterPoint(this._origin).x) * 2 / (0.0254 * this._tileSize.x);
        //var defaultBaseScale = this._dpi * Math.abs(this._origin).x * 2 / (0.0254 * this._tileSize.x);
        //var defaultBaseScale = this._dpi * Math.abs(this._origin.lng) * 2 / (0.0254 * this._tileSize.x);
        //this.baseScale = options.baseScale || defaultBaseScale;
        this.baseScale = options.baseScale || 1;
    },

    getScale: function(zoom){
        if(this._zoomInvalid(zoom)){
            return NaN;
        }

        //return this._dpi * Math.abs(this._crs.latLngToMeterPoint(this._origin).x) * 2 / (Math.pow(2, zoom) * 0.0254 * this._tileSize.x);
        return this.baseScale / Math.pow(2, (zoom - this.baseZoom));
    },

    _getLevelDefine: function(){
        var ld = [];
            //baseResolution = this._crs.latLngToMeterPoint(new Z.LatLng(0, 180)).x * 2 / this._tileSize.x;
            //baseResolution = 180 * 2 / this._tileSize.x;

        for(var i = this.startZoom; i < this.endZoom; i++){
            ld.push({
                level: i,
                //resolution: this.baseResolution / Math.pow(2, (i - this.baseZoom))
                resolution: this._getResolution(i),
                scale: this._getScale(i)
            });
        }

        return ld;
    },

    _getResolution: function(zoom){
        return this.baseResolution / Math.pow(2, (zoom - this.baseZoom));
    },

    _getScale: function(zoom){
        return this.baseScale / Math.pow(2, (zoom - this.baseZoom));
    },

    _zoomInvalid: function(zoom){
        return zoom < this.startZoom && zoom > this.endZoom;
    },

    _latLngSizeToPixelSize: function(latLngWidth, latLngHeight, zoom){
        //var baseMeterWidth = this._crs.latLngToMeterPoint(new Z.LatLng(0, 180)).x,
        //    meterSize = this._crs.latLngToMeterPoint(new Z.LatLng(this._origin.lat - latLngHeight, latLngWidth + this._origin.lng));
        //var width = (baseMeterWidth + meterSize.x) / (baseMeterWidth * 2) * this._tileSize.x * Math.pow(2, zoom);
        //var height = (baseMeterWidth - meterSize.y) / (baseMeterWidth * 2) * this._tileSize.x * Math.pow(2, zoom);
        //
        //return new Z.Point(width, height);
        var resolution = this._getResolution(zoom),
            width = Math.floor(latLngWidth / resolution),
            height = Math.floor(latLngHeight / resolution);

        return new Z.Point(width, height);
    },

    _pixelSizeToLatLngSize: function(pixelWidth, pixelHeight, zoom){
        //var baseMeterWidth = this._crs.latLngToMeterPoint(new Z.LatLng(0, 180)).x;
        //var meterX = pixelWidth *  baseMeterWidth * 2 / (this._tileSize.x * Math.pow(2, zoom)) - baseMeterWidth,
        //    meterY = baseMeterWidth - pixelHeight *  baseMeterWidth * 2 / (this._tileSize.x * Math.pow(2, zoom));
        //
        //var latLngPoint = this._crs.meterPointToLatLng(new Z.Point(meterX, meterY));
        //
        //return new Z.LatLng(this._origin.lat - latLngPoint.lat, latLngPoint.lng - this._origin.lng);
        var resolution = this._getResolution(zoom),
            width = resolution * pixelWidth,
            height = resolution * pixelHeight;

        return new Z.LatLng(height, width);
    }
});