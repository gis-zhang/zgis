/**
 * Created by Administrator on 2015/11/20.
 */
Z.CustomPyramidGrid = Z.AbstractPyramidGrid.extend({
    initialize: function(options){
        options = options || {};
        Z.AbstractPyramidGrid.prototype.initialize.apply(this, arguments);

        this._levelDefine = options.levelDefine;

        this._levelMapping = null;

        if(this._levelDefine instanceof Array){
            this._levelDefine.sort(function(a,b){
                return parseInt(a.level) - parseInt(b.level);
            });

            this._levelMapping = {};

            for(var i = 0; i < this._levelDefine.length; i++){
                this._levelMapping[this._levelDefine[i].level + ""] = this._levelDefine[i];
            }
        }
    },

    getScale: function(zoom){
        if(this._zoomInvalid(zoom)){
            return NaN;
        }

        if(this._levelMapping){
            return this._levelMapping[zoom + ""].scale;
        }
    },

    _getLevelDefine: function(){
        return this._levelDefine;
    },

    _zoomInvalid: function(zoom){
        return this._levelMapping ? !this._levelMapping[zoom + ""]: false;
    },

    _latLngSizeToPixelSize: function(latLngWidth, latLngHeight, zoom){
        if(this._levelMapping){
            var resolution = this._levelMapping[zoom + ""].resolution,
                width = Math.floor(latLngWidth / resolution),
                height = Math.floor(latLngHeight / resolution);

            return new Z.Point(width, height);
        }else{
            return null;
        }
    },

    _pixelSizeToLatLngSize: function(pixelWidth, pixelHeight, zoom){
        if(this._levelMapping){
            var resolution = this._levelMapping[zoom + ""].resolution,
                width = resolution * pixelWidth,
                height = resolution * pixelHeight;

            return new Z.LatLng(height, width);
        }else{
            return null;
        }
    }
});