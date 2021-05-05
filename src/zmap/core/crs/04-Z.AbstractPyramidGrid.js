/**
 * Created by Administrator on 2015/11/20.
 */
Z.AbstractPyramidGrid = Z.Class.extend({
    initialize: function(options){
        options = options || {};

        this._xFactor = options.xFactor === -1 ? -1 : (options.xFactor === 1 ? 1 : 1);         //瓦片列的正向与空间横坐标正向是否一致，一致为1，反向为-1，默认为1
        this._yFactor = options.yFactor === -1 ? -1 : (options.yFactor === 1 ? 1 : 1);        //瓦片行的正向与空间纵坐标正向是否一致，一致为1，反向为-1，默认为1

        this._origin = options.origin ? Z.LatLng.create(options.origin) : new Z.LatLng(0, 0);
        this._tileSize = options.tileSize ? Z.Point.create(options.tileSize) : new Z.Point(256, 256);
        this._dpi = options.dpi || 96;
        //this._crs = options.crs || Z.CRS.EPSG3857;

        this._minLevel = undefined;
        this._maxLevel = undefined;

        this.resolationTolerance = 0.00000001;
    },

    getScale: function(zoom){},

    //getTileSize: function(){
    //    return this._tileSize;
    //},
    //
    //getOrigin: function(){
    //    return this._origin;
    //},

    /*经纬度坐标转为像素坐标（相对于原点）*/
    latLngToPixelPoint: function(latLng, zoom){
        if(this._zoomInvalid(zoom) || !(latLng instanceof Z.LatLng)){
            return null;
        }

        //return this._latLngSizeToPixelSize(latLng.lng - this._origin.lng,
        //    this._origin.lat - latLng.lat, zoom);

        var lngSize = (latLng.lng - this._origin.lng) * this._xFactor,
            latSize = (latLng.lat - this._origin.lat) * this._yFactor;

        return this._latLngSizeToPixelSize(lngSize, latSize, zoom);
    },

    /*像素坐标（相对于原点）转为经纬度坐标*/
    pixelPointToLatLng: function(point, zoom){
        if(this._zoomInvalid(zoom) || !(point instanceof Z.Point)){
            return null;
        }

        var latLngPoint = this._pixelSizeToLatLngSize(point.x, point.y, zoom);
        //latLngPoint.lat = this._origin.lat - latLngPoint.lat;
        //latLngPoint.lng = this._origin.lng + latLngPoint.lng;
        latLngPoint.lat = this._origin.lat + latLngPoint.lat * this._yFactor;
        latLngPoint.lng = this._origin.lng + latLngPoint.lng * this._xFactor;
        return latLngPoint;
    },

    latLngBoundsToPixelBounds: function(latLngBounds, zoom){
        if(this._zoomInvalid(zoom) || !(latLngBounds instanceof Z.LatLngBounds)){
            return null;
        }

        //return this._latLngSizeToPixelSize(latLng.lng - this._origin.lng,
        //    this._origin.lat - latLng.lat, zoom);

        var southWestPixelPoint = this.latLngToPixelPoint(latLngBounds.getSouthWest(), zoom),
            northEastPixelPoint = this.latLngToPixelPoint(latLngBounds.getNorthEast(), zoom);

        return new Z.Bounds(southWestPixelPoint, northEastPixelPoint);
    },

    /*返回指定级别和坐标位置所在的瓦片行列号*/
    getTilePoint: function(latLng, zoom){
        var pixelPoint = this.latLngToPixelPoint(latLng, zoom);

        if(pixelPoint){
            var tileX = Math.floor(pixelPoint.x / this._tileSize.x);
            var tileY = Math.floor(pixelPoint.y / this._tileSize.y);

            return new Z.Point(tileX, tileY, zoom);
        }

        return null;
    },

    /*返回单张瓦片的经纬度范围*/
    getLatLngBounds: function(tilePoint, zoom){
        if(this._zoomInvalid(zoom) || !(tilePoint instanceof Z.Point)){
            return null;
        }

        var leftUpperPixelPoint = new Z.Point(tilePoint.x * this._tileSize.x, tilePoint.y * this._tileSize.y),
            rightLowerPixelPoint = new Z.Point((tilePoint.x + 1) * this._tileSize.x, (tilePoint.y + 1) * this._tileSize.y);
        var delta_leftUpper = this.pixelPointToLatLng(leftUpperPixelPoint, zoom);
        var delta_rightLower = this.pixelPointToLatLng(rightLowerPixelPoint, zoom);

        return Z.LatLngBounds.create(delta_leftUpper, delta_rightLower);
    },

    /*返回指定空间范围所在的行列号范围*/
    getTileBounds: function(latLngBounds, zoom){
        var leftLower = this.getTilePoint(latLngBounds.getSouthWest(), zoom),
            rightUpper = this.getTilePoint(latLngBounds.getNorthEast(), zoom);

        if(leftLower && rightUpper){
            return new Z.Bounds(leftLower, rightUpper);
        }else{
            return null;
        }
    },

    getTileSize: function(){
        return this._tileSize.clone();
    },

    getOrigin: function(){
        return this._origin.clone();
    },

    getTopLeftPixelPoint: function(tilePoint){
        var tileSize = this._tileSize,
            yCount = this._yFactor === -1 ? tilePoint.y : (tilePoint.y + 1),
            xCount = this._xFactor === 1 ? tilePoint.x : (tilePoint.x + 1);

        return new Z.Point(tileSize.x * xCount, tileSize.y * yCount);
    },

    getTopLeftPixelPointOfBounds: function(tileBounds){
        var topLeftTile = this.getTopLeftTileOfBounds(tileBounds);

        return this.getTopLeftPixelPoint(topLeftTile);
    },

    getTopLeftPixelPointInBounds: function(tilePoint, tileBounds){
        var tileSize = this._tileSize,
            topLeftTile = this.getTopLeftTileOfBounds(tileBounds),
            tileTopLeft, boundsTopLeft;

        tileTopLeft = this.getTopLeftPixelPoint(tilePoint);
        boundsTopLeft = this.getTopLeftPixelPoint(topLeftTile);

        var posX = (tileTopLeft.x - boundsTopLeft.x) * this._xFactor,
            posY = (boundsTopLeft.y - tileTopLeft.y) * this._yFactor;

        return new Z.Point(posX, posY);
    },

    getTopLeftTileOfBounds: function(tileBounds){
        var minTilePoint = tileBounds.min,
            maxTilePoint = tileBounds.max,
            top, left;

        top = this._yFactor === -1 ? minTilePoint.y : maxTilePoint.y;
        left = this._xFactor === 1 ? minTilePoint.x : maxTilePoint.x;

        return new Z.Point(left, top);
    },

    /*返回与指定空间范围最匹配的级别*/
    fitZoomLevel: function(latLngBounds, containerWidth, containerHeight){
        if(!(latLngBounds instanceof Z.LatLngBounds)){
            return null;
        }

        var resolution = Math.abs((latLngBounds.getEast() - latLngBounds.getWest())/containerWidth);
        //var levels = this._levelDefine || this._getDefaultLevelDefine();
        var levels = this._getLevelDefine();
        var resoLoop = levels[0].resolution;
        var scale = 1;

        if(resolution > resoLoop || Math.abs(resolution - resoLoop) < 0.0000001){
            //if(Math.abs(resolution - resoLoop) > this.resolationTolerance){
            //    scale = resoLoop / resolution;
            //}
            scale = this._getResolutionScale(resolution, resoLoop);

            return {
                scale: levels[0].scale,
                zoomFactor: scale,
                level: levels[0].level,
                outOfScaleBounds: true
            };
        }

        for(var i = 1; i < levels.length; i++){
            resoLoop = levels[i].resolution;

            if(resolution >= resoLoop || Math.abs(resolution - resoLoop) < 0.0000001){
                scale = this._getResolutionScale(resolution, resoLoop);

                return {
                    scale: ((resolution - resoLoop) < (levels[i - 1].resolution - resolution)) ? levels[i].scale : levels[i - 1].scale,
                    zoomFactor: scale,
                    level:((resolution - resoLoop) < (levels[i - 1].resolution - resolution)) ? levels[i].level : levels[i - 1].level,
                    outOfScaleBounds: false
                };
            }
        }

        scale = this._getResolutionScale(resolution, levels[levels.length - 1].resolution);

        return {
            scale: levels[levels.length - 1].scale,
            zoomFactor: scale,
            level: levels[levels.length - 1].level,
            outOfScaleBounds: true
        };
    },

    getFitableBounds: function(center, level, containerWidth, containerHeight){
        //var levels = this._levelDefine || this._getDefaultLevelDefine();
        var levels = this._getLevelDefine();
        var resolution = levels[level].resolution;
        var spatialWidth = containerWidth * resolution;
        var spatialHeight = containerHeight * resolution;
        var minx = center.lng - spatialWidth / 2;
        var maxx = center.lng + spatialWidth / 2;
        var miny = center.lat - spatialHeight / 2;
        var maxy = center.lat + spatialHeight / 2;

        return Z.LatLngBounds.create(Z.LatLng.create(miny, minx), Z.LatLng.create(maxy, maxx));
    },

    scalingLevel: function(level, scaling){
        var levels = this._getLevelDefine();

        //if(level <= levels[0].level){
        //    return {
        //        scale: levels[0].scale,
        //        level: levels[0].level,
        //        outOfScaleBounds: false
        //    };
        //}else if(level >= levels[levels.length - 1].level){
        //    return {
        //        scale: levels[levels.length - 1].scale,
        //        level: levels[levels.length - 1].level,
        //        outOfScaleBounds: false
        //    };
        //}

        if(level < levels[0].level && level > levels[levels.length - 1].level){
            return;
        }

        var baseScale = levels[0].scale;
        var baseLevelIndex = 0,
            targetLevelIndex;

        for(var i = 1; i < levels.length; i++){
            if(levels[i].level === level){
                baseScale = levels[i].scale;
                baseLevelIndex = i;
                break;
            }
        }

        if(scaling === 1){
            targetLevelIndex = baseLevelIndex;
        }else if(scaling < 1 && scaling > 0){
            for(var i = baseLevelIndex + 1; i < levels.length; i++){
                var curScale = levels[i].scale;

                if(curScale / baseScale < scaling){
                    targetLevelIndex = i - 1;
                    break;
                }
            }

            if(i >= levels.length){
                targetLevelIndex = levels.length - 1;
            }
        }else if(scaling > 1){
            for(var i = baseLevelIndex; i >= 0; i--){
                var curScale = levels[i].scale;

                if(curScale / baseScale >= scaling){
                    targetLevelIndex = i;
                    break;
                }
            }

            if(i < 0){
                targetLevelIndex = 0;
            }
        }

        //return targetLevel;
        return {
            scale: levels[targetLevelIndex].scale,
            level: levels[targetLevelIndex].level,
            outOfScaleBounds: false
        };
    },

    getLevelRange: function(){
        return {
            min: this._getMinLevel(),
            max: this._getMaxLevel()
        };
    },

    _getLevelDefine: function(){
        throw error("_getLevelDefine()是抽象方法，请在子类中覆盖");
    },

    _getMinLevel: function(){
        if(this._minLevel === undefined || this._minLevel === null){
            var levels = this._getLevelDefine();
            var minLevel = undefined;

            if(levels){
                for(var i = 1; i < levels.length; i++){
                    if(minLevel === undefined){
                        minLevel = levels[i].level;
                    }else{
                        minLevel = Math.min(levels[i].level, minLevel);
                    }
                }
            }

            this._minLevel = minLevel;
        }

        return this._minLevel;
    },

    _getMaxLevel: function(){
        if(this._maxLevel === undefined || this._maxLevel === null){
            var levels = this._getLevelDefine();
            var maxLevel = undefined;

            if(levels){
                for(var i = 1; i < levels.length; i++){
                    if(maxLevel === undefined){
                        maxLevel = levels[i].level;
                    }else{
                        maxLevel = Math.max(levels[i].level, maxLevel);
                    }
                }
            }

            this._maxLevel = maxLevel;
        }

        return this._maxLevel;
    },

    _getResolutionScale: function(realResolution, levelResolution){
        var scale = 1;

        if(Math.abs(realResolution - levelResolution) > this.resolationTolerance){
            scale = levelResolution / realResolution;
        }

        return scale;
    },

    _zoomInvalid: function(zoom){
        throw error("_zoomInvalid(zoom)是抽象方法，请在子类中覆盖");
    },

    _latLngSizeToPixelSize: function(latLngWidth, latLngHeight, zoom){
        throw error("_latLngSizeToPixelSize(latLngWidth, latLngHeight, zoom)是抽象方法，请在子类中覆盖");
    },

    _pixelSizeToLatLngSize: function(pixelWidth, pixelHeight, zoom){
        throw error("_pixelSizeToLatLngSize(pixelWidth, pixelHeight, zoom)是抽象方法，请在子类中覆盖");
    }
});