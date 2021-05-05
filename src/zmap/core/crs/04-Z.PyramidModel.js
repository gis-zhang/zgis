/**
 * Created by Administrator on 2015/11/20.
 */
Z.PyramidModel = Z.Class.extend({
    initialize: function(grid, crs, projModel, options){
        options = options || {};

        this.grid = grid;
        //this.crs = options.crs || Z.CRS[ZMapConfig.crs] || Z.CRS.EPSG4326;
        this.crs = crs || Z.CRS[ZMapConfig.crs] || Z.CRS.EPSG4326;
        this.projModel = projModel || new Z.ProjModel();
    },

    getScale: function(zoom){
        //return this.grid.getScale(zoom);
        //var floorScale = this.grid.getScale(Math.floor(zoom)),
        //    ceilingScale = this.grid.getScale(Math.ceil(zoom));
        //
        //return floorScale * Math.pow(ceilingScale / floorScale, (zoom - Math.floor(zoom)) / (Math.ceil(zoom) - Math.floor(zoom)));
        var multiply = this._getMultiple(zoom, Math.floor(zoom));

        return this.grid.getScale(Math.floor(zoom)) / multiply;
    },

    getTileSize: function(zoom){
        //return this.grid.getTileSize();
        var multiple = 1;

        if(zoom !== undefined){
            var nearestZoom = this._getNearestGridZoom(zoom);
            multiple = this._getMultiple(zoom, nearestZoom);
        }

        return this.grid.getTileSize().multiplyBy(multiple);
    },

    getOrigin: function(){
        var pyramidOrigin = this.grid.getOrigin();

        return this._transformLatLngFromPyramid(pyramidOrigin);
    },

    /*经纬度坐标转为像素坐标（相对于原点）*/
    latLngToPixelPoint: function(latLng, zoom){
        //var pyramidLatLng = this._transformLatLng2Pyramid(latLng);
        //
        //return this.grid.latLngToPixelPoint(pyramidLatLng, zoom);

        var pyramidLatLng = this._transformLatLng2Pyramid(latLng),
            gridZoom = this._getNearestGridZoom(zoom);
        var gridPixelPoint = this.grid.latLngToPixelPoint(pyramidLatLng, zoom),
            multiple = this._getMultiple(zoom, gridZoom);

        return gridPixelPoint.multiplyBy(multiple);
    },

    /*像素坐标（相对于原点）转为经纬度坐标*/
    pixelPointToLatLng: function(point, zoom){
        //var latLng = this.grid.pixelPointToLatLng(point, zoom);
        //
        //return this._transformLatLngFromPyramid(latLng);

        var gridZoom = this._getNearestGridZoom(zoom);
        var multiple = this._getMultiple(zoom, gridZoom);
        var newPoint = new Z.Point(point.x * multiple, point.y * multiple, point.z * multiple);
        var latLng = this.grid.pixelPointToLatLng(newPoint, gridZoom);

        return this._transformLatLngFromPyramid(latLng);
    },

    /*返回指定级别和坐标位置所在的瓦片行列号*/
    getTilePoint: function(latLng, zoom){
        //var pyramidLatLng = this._transformLatLng2Pyramid(latLng);
        //
        //return this.grid.getTilePoint(pyramidLatLng, zoom);
        var pyramidLatLng = this._transformLatLng2Pyramid(latLng),
            gridZoom = this._getNearestGridZoom(zoom);

        return this.grid.getTilePoint(pyramidLatLng, gridZoom);
    },

    /*返回单张瓦片的经纬度范围*/
    getLatLngBounds: function(tilePoint, zoom){
        //var pyramidBounds = this.grid.getLatLngBounds(tilePoint, zoom);
        //
        //return this._transformLatLngBoundsFromPyramid(pyramidBounds);
        var gridZoom = this._getNearestGridZoom(zoom);
        var pyramidBounds = this.grid.getLatLngBounds(tilePoint, gridZoom);

        return this._transformLatLngBoundsFromPyramid(pyramidBounds);
    },

    /*返回指定空间范围所在的行列号范围*/
    getTileBounds: function(latLngBounds, zoom){
        //var pyramidBounds = this._transformLatLngBounds2Pyramid(latLngBounds);
        //
        //return this.grid.getTileBounds(pyramidBounds, zoom);
        var pyramidBounds = this._transformLatLngBounds2Pyramid(latLngBounds),
            gridZoom = this._getNearestGridZoom(zoom);

        return this.grid.getTileBounds(pyramidBounds, gridZoom);
    },

    getTopLeftPixelPoint: function(tilePoint){
        return this.grid.getTopLeftPixelPoint(tilePoint);
    },

    getTopLeftPixelPointOfBounds: function(tileBounds){
        return this.grid.getTopLeftPixelPointOfBounds(tileBounds);
    },

    getTopLeftPixelPointInBounds: function(tilePoint, tileBounds){
        return this.grid.getTopLeftPixelPointInBounds(tilePoint, tileBounds);
    },

    /*返回与指定空间范围最匹配的级别*/
    fitZoomLevel: function(latLngBounds, containerWidth, containerHeight){
        var pyramidBounds = this._transformLatLngBounds2Pyramid(latLngBounds);
        var fitedZoomLevel = this.grid.fitZoomLevel(pyramidBounds, containerWidth, containerHeight);
        //var fitedPixelBounds = this.grid.latLngBoundsToPixelBounds(latLngBounds, fitedZoomLevel.level);

        if(fitedZoomLevel.zoomFactor === 1){
            return {
                scale: fitedZoomLevel.scale,
                level: fitedZoomLevel.level,
                outOfScaleBounds: fitedZoomLevel.outOfScaleBounds
            }
        }else{
            return this.scalingLevel(fitedZoomLevel.level, fitedZoomLevel.zoomFactor);
        }
    },

    getFitableBounds: function(center, zoom, containerWidth, containerHeight){
        //var pyramidCenter = this._transformLatLng2Pyramid(center);
        //var pyramidBounds = this.grid.getFitableBounds(pyramidCenter, level, containerWidth, containerHeight);
        //
        //return this._transformLatLngBoundsFromPyramid(pyramidBounds);

        var pyramidCenter = this._transformLatLng2Pyramid(center),
            gridZoom = this._getNearestGridZoom(zoom);
        var multiple = this._getMultiple(zoom, gridZoom);
        var pyramidBounds = this.grid.getFitableBounds(pyramidCenter, gridZoom, containerWidth / multiple, containerHeight / multiple);

        return this._transformLatLngBoundsFromPyramid(pyramidBounds);
    },

    //返回对指定级别缩放一定倍数后的新级别
    scalingLevel: function(level, scaling){
        //return this.grid.scalingLevel(level, scaling);

        scaling = scaling === undefined ? 1 : scaling;
        var targetZoom, targetScale;

        if(scaling <= 0 || scaling === 1){
            targetZoom = level;
            targetScale = this.getScale(targetZoom);
        }else{
            var startScale = this.getScale(level);
            targetScale = startScale / scaling;
            var nearestStartGridZoom = this._getNearestGridZoom(level);
            var nearestStartZoomScale = this.getScale(nearestStartGridZoom);

            var nearestEndGridLevelDefine = this.grid.scalingLevel(nearestStartGridZoom, targetScale / nearestStartZoomScale);
            var levelRange = this.grid.getLevelRange();
            var nearestEndGridZoom = nearestEndGridLevelDefine.level;
            var nearestEndZoomScale = nearestEndGridLevelDefine.scale;      //this.getScale(nearestEndGridZoom);

            if(targetScale <= nearestEndZoomScale){
                if(nearestEndGridZoom === levelRange.max){
                    targetZoom = nearestEndGridZoom;
                }else{
                    targetZoom = nearestEndGridZoom + this._getSubZoom(nearestEndGridZoom, nearestEndGridZoom + 1, targetScale / nearestEndZoomScale);
                }
            }else{
                if(nearestEndGridZoom === levelRange.min){
                    targetZoom = nearestEndGridZoom;
                }else {
                    targetZoom = nearestEndGridZoom - this._getSubZoom(nearestEndGridZoom, nearestEndGridZoom - 1, targetScale / nearestEndZoomScale);
                }
            }
        }

        return {
            level: targetZoom,
            scale: targetScale,
            outOfScaleBounds: false
        };
    },

    _getNearestGridZoom: function(zoom){
        return Math.floor(zoom);
    },

    //fromZoom相对于toGridZoom的放大或缩小倍数
    _getMultiple: function(fromZoom, toGridZoom){
        //var floorScale = this.grid.getScale(Math.floor(fromZoom)),
        //    ceilingScale = this.grid.getScale(toGridZoom);
        var floorScale, ceilingScale;

        if(fromZoom === toGridZoom){
            return 1;
        }else if(fromZoom > toGridZoom){
            floorScale = this.grid.getScale(toGridZoom);
            ceilingScale = this.grid.getScale(Math.ceil(fromZoom));

            return Math.pow(floorScale / ceilingScale, (fromZoom - toGridZoom) / (Math.ceil(fromZoom) - toGridZoom));
        }else{
            floorScale = this.grid.getScale(Math.floor(fromZoom));
            ceilingScale = this.grid.getScale(toGridZoom);

            return Math.pow(ceilingScale / floorScale, (toGridZoom - fromZoom) / (toGridZoom - Math.floor(fromZoom)));
        }
    },

    _getSubZoom: function(startGridZoom, endGridZoom, scaling){
        var startScale = this.grid.getScale(startGridZoom),
            endScale = this.grid.getScale(endGridZoom);

        return Math.log(scaling) / Math.log(endScale / startScale);
    },

    _transformLatLng2Pyramid: function(latLng){
        //var crsCode = latLng.crs ? latLng.crs.code : ZMapConfig.crs,
        //    coordinates = latLng;
        //
        //if(this._crs.code !== crsCode){
        //    var projectCoords = this._crs.project(latLng);
        //    coordinates = new Z.LatLng(projectCoords.y, projectCoords.x);
        //}
        //
        //return coordinates;

        //var projectCoords = this._projModel.project(latLng);
        //
        //return new Z.LatLng(projectCoords.y, projectCoords.x);
        return this.projModel.forwardTransform(latLng);
    },

    _transformLatLngFromPyramid: function(pyramidLatLng, targetCRS){
        //targetCRS = targetCRS || Z.CRS[ZMapConfig.crs];
        //
        //var crsCode = targetCRS.code,
        //    coordinates = pyramidLatLng;
        //
        //if(this._crs.code !== crsCode){
        //    coordinates = this._crs.unproject(new Z.Point(pyramidLatLng.lng, pyramidLatLng.lat));
        //}
        //
        //return coordinates;
        //return this._projModel.unproject(new Z.Point(pyramidLatLng.lng, pyramidLatLng.lat));
        return this.projModel.reverseTransform(pyramidLatLng);
    },

    _transformLatLngBounds2Pyramid: function(latLngBounds){
        var southWest = latLngBounds.getSouthWest(),
            northEast = latLngBounds.getNorthEast();

        var pyramidSouthWest = this._transformLatLng2Pyramid(southWest),
            pyramidNorthEast = this._transformLatLng2Pyramid(northEast);

        return Z.LatLngBounds.create(pyramidSouthWest, pyramidNorthEast);
    },

    _transformLatLngBoundsFromPyramid: function(pyramidBounds, targetCRS){
        var southWest = pyramidBounds.getSouthWest(),
            northEast = pyramidBounds.getNorthEast();

        var pyramidSouthWest = this._transformLatLngFromPyramid(southWest, targetCRS),
            pyramidNorthEast = this._transformLatLngFromPyramid(northEast, targetCRS);

        return Z.LatLngBounds.create(pyramidSouthWest, pyramidNorthEast);
    }
});

Z.PyramidModel.TDT = Z.PyramidModel.extend({
    initialize: function(){
        var crs = Z.CRS.EPSG4326,
            dpi = 96,
            tileWidth = 256,
            tileHeight = 256,
            grid = new Z.CustomPyramidGrid({
                xFactor: 1,
                yFactor: -1,
                tileSize: new Z.Point(tileWidth, tileHeight),
                dpi: 96,
                origin: new Z.LatLng(90, -180),
                //multiplier: 2,
                //baseResolution: (20037508.3427892 * 2 / tileWidth),
                //baseScale: dpi * 20037508.3427892 * 2 / (0.0254 * tileWidth)
                levelDefine :
                    [
                        { "level": 0, "resolution": 1.40782880508533, "scale": 591658710.9 },
                        { "level": 1, "resolution": 0.70312500000011879, "scale": 295497593.05879998 },
                        { "level": 2, "resolution": 0.3515625000000594, "scale": 147748796.52939999 },
                        { "level": 3, "resolution": 0.1757812500000297, "scale": 73874398.264699996 },
                        { "level": 4, "resolution": 0.087890625000014849, "scale": 36937199.132349998 },
                        { "level": 5, "resolution": 0.043945312500007425, "scale": 18468599.566174999 },
                        { "level": 6, "resolution": 0.021972656250003712, "scale": 9234299.7830874994 },
                        { "level": 7, "resolution": 0.010986328125001856, "scale": 4617149.8915437497 },
                        { "level": 8, "resolution": 0.0054931640625009281, "scale": 2308574.9457718749 },
                        { "level": 9, "resolution": 0.002746582031250464, "scale": 1154287.4728859374 },
                        { "level": 10, "resolution": 0.001373291015625232, "scale": 577143.73644296871 },
                        { "level": 11, "resolution": 0.00068664550781261601, "scale": 288571.86822148436 },
                        { "level": 12, "resolution": 0.000343322753906308, "scale": 144285.934110742183 },
                        { "level": 13, "resolution": 0.000171661376953154, "scale": 72142.967055371089 },
                        { "level": 14, "resolution": 8.5830688476577001e-005, "scale": 36071.483527685545 },
                        { "level": 15, "resolution": 4.2915344238288501e-005, "scale": 18035.741763842772 },
                        { "level": 16, "resolution": 2.145767211914425e-005, "scale": 9017.8708819213862 },
                        { "level": 17, "resolution": 1.0728836059572125e-005, "scale": 4508.9354409606931 },
                        { "level": 18, "resolution": 5.3644180297860626e-006, "scale": 2254.4677204803465 },
                        { "level": 19, "resolution": 2.6822090148930313e-006, "scale": 1127.2338602401733 },
                        { "level": 20, "resolution": 1.3411045074465156e-006, "scale": 563.61693012008664 }
                    ]
            });

        //Z.PyramidModel.prototype.initialize.call(this, grid, {crs: crs});

        //var projModel = new Z.ProjModel(Z.CRS.EPSG4490, Z.Projection.LatLng);
        var projModel = new Z.ProjModel(Z.CRS.EPSG4490, crs);
        Z.PyramidModel.prototype.initialize.call(this, grid, crs, projModel);
    }
});

Z.PyramidModel.OSM = Z.PyramidModel.extend({
    initialize: function(){
        var crs = Z.CRS.EPSG3857,
            dpi = 96,
            tileWidth = 256,
            tileHeight = 256,
            baseResolution = 20037508.3427892 * 2 / tileWidth,
            baseScale = baseResolution * dpi / 0.0254,
            grid = new Z.FixedMultiplePyramidGrid({
                xFactor: 1,
                yFactor: -1,
                tileSize: new Z.Point(tileWidth, tileHeight),
                dpi: 96,
                origin: new Z.LatLng(20037508.3427892, -20037508.3427892),
                multiplier: 2,
                //baseResolution: (20037508.3427892 * 2 / tileWidth),
                //baseScale: dpi * 20037508.3427892 * 2 / (0.0254 * tileWidth)
                baseZoom: 0,
                baseResolution: baseResolution,
                baseScale: baseScale
            });

        //Z.PyramidModel.prototype.initialize.call(this, grid, {crs: crs});

        //var projModel = new Z.ProjModel(Z.CRS.EPSG4326, Z.Projection.SphericalMercator);
        var projModel = new Z.ProjModel(Z.CRS.EPSG4326, crs);
        Z.PyramidModel.prototype.initialize.call(this, grid, crs, projModel);
    }
});

Z.PyramidModel.BD = Z.PyramidModel.extend({
    initialize: function(){
        var crs = Z.CRS.EPSG3857,
            dpi = 96,
            tileWidth = 256,
            tileHeight = 256,
            baseResolution = Math.pow(2, 18),
            baseScale = baseResolution * dpi / 0.0254,
            grid = new Z.FixedMultiplePyramidGrid({
                xFactor: 1,
                yFactor: 1,
                tileSize: new Z.Point(tileWidth, tileHeight),
                dpi: 96,
                origin: new Z.LatLng(0, 0),
                multiplier: 2,
                baseZoom: 0,
                baseResolution: baseResolution,
                baseScale: baseScale
            });

        //Z.PyramidModel.prototype.initialize.call(this, grid, {crs: crs});

        //var projModel = new Z.ProjModel(Z.CRS.EPSG4326, Z.Projection.SphericalMercator);
        var projModel = new Z.ProjModel(Z.CRS.EPSG4326, crs);
        Z.PyramidModel.prototype.initialize.call(this, grid, crs, projModel);
    }
});

Z.PyramidModel.TDT_UNLIMIT = Z.PyramidModel.extend({
    initialize: function(){
        var crs = Z.CRS.EPSG4490,
            dpi = 96,
            tileWidth = 256,
            tileHeight = 256,
            baseResolution = 0.70312500000011879 * 2,
            baseScale = 295497593.05879998 * 2,
            grid = new Z.FixedMultiplePyramidGrid({
                xFactor: 1,
                yFactor: -1,
                tileSize: new Z.Point(tileWidth, tileHeight),
                dpi: 96,
                origin: new Z.LatLng(90, -180),
                multiplier: 2,
                startZoom: 0,
                endZoom: 30,
                //baseResolution: (20037508.3427892 * 2 / tileWidth),
                //baseScale: dpi * 20037508.3427892 * 2 / (0.0254 * tileWidth)
                baseZoom: 0,
                baseResolution: baseResolution,
                baseScale: baseScale
            });

        //Z.PyramidModel.prototype.initialize.call(this, grid, {crs: crs});

        //var projModel = new Z.ProjModel(Z.CRS.EPSG4326, Z.Projection.SphericalMercator);
        var projModel = new Z.ProjModel(Z.CRS.EPSG4326, crs);
        Z.PyramidModel.prototype.initialize.call(this, grid, crs, projModel);
    }
});