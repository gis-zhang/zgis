L.CustomTileLayer = L.TileLayer.extend({
    yFactor:1,
    initialize: function (url, options) {
        //alert("L.CustomTileLayer.initialize()");
        L.TileLayer.initialize.call(this, url, options);

        this.options.tileWidth = options.tileWidth || options.tileSize;
        this.options.tileHeight = options.tileHeight || options.tileSize;

        if (this.options.detectRetina && L.Browser.retina && this.options.maxZoom > 0) {
            this.options.tileWidth = Math.floor(this.options.tileWidth / 2);
            this.options.tileHeight = Math.floor(this.options.tileHeight / 2);
        }
    },
    _update: function () {

        if (!this._map) { return; }

        var map = this._map,
		    bounds = map.getPixelBounds(),
		    zoom = map.getZoom(),
        //tileSize = this._getTileSize();
            tileWidth = this.options.tileWidth;
        tileHeight = this.options.tileHeight * this.yFactor;


        if (zoom > this.options.maxZoom || zoom < this.options.minZoom) {
            return;
        }

        var minx = Math.floor(bounds.min.x / tileWidth);
        var miny = Math.floor(bounds.min.y / tileHeight);
        var maxx = Math.floor(bounds.max.x / tileWidth);
        var maxy = Math.floor(bounds.max.y / tileHeight);
        var tileBounds = L.bounds(new L.Point(minx, miny), new L.Point(maxx, maxy));

        //        var tileBounds = L.bounds(
        //		        bounds.min.divideBy(tileSize)._floor(),
        //		        bounds.max.divideBy(tileSize)._floor());


        this._addTilesFromCenterOut(tileBounds);

        if (this.options.unloadInvisibleTiles || this.options.reuseTiles) {
            this._removeOtherTiles(tileBounds);
        }
    },
    _tileShouldBeLoaded: function (tilePoint) {
        if ((tilePoint.x + ':' + tilePoint.y) in this._tiles) {
            return false; // already loaded
        }

        var options = this.options;

        if (!options.continuousWorld) {
            var limit = this._getWrapTileNum();

            // don't load if exceeds world bounds
            if ((options.noWrap && (tilePoint.x < 0 || tilePoint.x >= limit.x)) ||
				tilePoint.y < 0 || tilePoint.y >= limit.y) { return false; }
        }

        if (options.bounds) {
            //            var tileSize = options.tileSize,
            //			    nwPoint = tilePoint.multiplyBy(tileSize),
            //			    sePoint = nwPoint.add([tileSize, tileSize]),
            var tileWidth = options.tileWidth,
                tileHeight = options.tileHeight * this.yFactor,
                nwPoint = new L.Point(tilePoint.x * tileWidth, tilePoint.y * tileHeight),
			    sePoint = nwPoint.add([tileWidth, tileHeight]),
			    nw = this._map.unproject(nwPoint),
			    se = this._map.unproject(sePoint);

            // TODO temporary hack, will be removed after refactoring projections
            // https://github.com/Leaflet/Leaflet/issues/1618
            if (!options.continuousWorld && !options.noWrap) {
                nw = nw.wrap();
                se = se.wrap();
            }

            if (!options.bounds.intersects([nw, se])) { return false; }
        }

        return true;
    },

    _getTilePos: function (tilePoint) {
        var origin = this._map.getPixelOrigin(),
            tileWidth = this.options.tileWidth,
            tileHeight = this.options.tileHeight * this.yFactor;
        //tileSize = this._getTileSize();

        //return tilePoint.multiplyBy(tileSize).subtract(origin);
        return new L.Point(tilePoint.x * tileWidth, tilePoint.y * tileHeight).subtract(origin);
    },

    _getWrapTileNum: function () {
        var crs = this._map.options.crs,
		    size = crs.getSize(this._map.getZoom());
        //return size.divideBy(this._getTileSize())._floor();

        size.x /= this.options.tileWidth;
        size.y /= (this.options.tileHeight * this.yFactor);

        return size._floor();
    },

    _createTile: function () {
        var tile = L.DomUtil.create('img', 'leaflet-tile');
        //tile.style.width = tile.style.height = this._getTileSize() + 'px';
        tile.style.width = this.options.tileWidth + 'px';
        tile.style.height = this.options.tileHeight * this.yFactor + 'px';
        tile.galleryimg = 'no';

        tile.onselectstart = tile.onmousemove = L.Util.falseFn;

        if (L.Browser.ielt9 && this.options.opacity !== undefined) {
            L.DomUtil.setOpacity(tile, this.options.opacity);
        }
        // without this hack, tiles disappear after zoom on Chrome for Android
        // https://github.com/Leaflet/Leaflet/issues/2078
        if (L.Browser.mobileWebkit3d) {
            tile.style.WebkitBackfaceVisibility = 'hidden';
        }
        return tile;
    }
});