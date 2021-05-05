L.Map.include({
    _initBuildingRoot: function () {
        if (this._buildingRoot) { return; }
        this._buildingRootContainer = document.createElement('div');
        L.DomUtil.addClass(this._buildingRootContainer, 'leaflet-overlay-pane');
        this._changeMapPaneIndex();
        this._panes.objectsPane.appendChild(this._buildingRootContainer);

        if (L.Path.SVG) {
            this._createBuildingRoot_svg();
        } else if (L.Path.VML) {
            this._createBuildingRoot_vml();
        } else if (L.Path.CANVAS) {
            this._createBuildingRoot_canvas();
        }
    },

    _changeMapPaneIndex: function () {   //设置各个地图面板的叠加顺序
        this._buildingRootContainer.style.zIndex = 7;
        this._panes.popupPane.style.zIndex = 8;
    },

    _createBuildingRoot_svg: function () {
        this._buildingRoot = L.Path.prototype._createElement('svg');
        //this._panes.objectsPane.appendChild(this._buildingRoot);
        this._buildingRootContainer.appendChild(this._buildingRoot);

        if (this.options.zoomAnimation && L.Browser.any3d) {
            L.DomUtil.addClass(this._buildingRoot, 'leaflet-zoom-animated');

            this.on({
                'zoomanim': this._animateBuildingZoom,
                'zoomend': this._endBuildingZoom
            });
        } else {
            L.DomUtil.addClass(this._buildingRoot, 'leaflet-zoom-hide');
        }

        this.on('moveend', this._updateBuildingViewport);
        this._updateBuildingViewport();
    },

    _createBuildingRoot_vml: function () {
        var root = this._buildingRoot = document.createElement('div');
        root.className = 'leaflet-vml-container';
        //this._panes.objectsPane.appendChild(root);
        this._buildingRootContainer.appendChild(this._buildingRoot);

        this.on('moveend', this._updateBuildingViewport);
        this._updateBuildingViewport();
    },

    _createBuildingRoot_canvas: function () {
        var root = this._buildingRoot,
		    ctx;

        if (!root) {
            root = this._buildingRoot = document.createElement('canvas');
            root.style.position = 'absolute';
            ctx = this._canvasCtx = root.getContext('2d');

            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            //this._panes.objectsPane.appendChild(root);
            this._buildingRootContainer.appendChild(this._buildingRoot);

            if (this.options.zoomAnimation) {
                this._buildingRoot.className = 'leaflet-zoom-animated';
                this.on('zoomanim', this._animateBuildingZoom);
                this.on('zoomend', this._endBuildingZoom);
            }
            this.on('moveend', this._updateBuildingViewport);
            this._updateBuildingViewport();
        }
    },

    _animateBuildingZoom: function (e) {
        var scale = this.getZoomScale(e.zoom),
		    offset = this._getCenterOffset(e.center)._multiplyBy(-scale)._add(this._pathViewport.min);

        this._buildingRoot.style[L.DomUtil.TRANSFORM] =
		        L.DomUtil.getTranslateString(offset) + ' scale(' + scale + ') ';

        this._buildingZooming = true;
    },

    _endBuildingZoom: function () {
        this._buildingZooming = false;
    },

    _updateBuildingViewport: function () {

        if (this._buildingZooming) {
            // Do not update SVGs while a zoom animation is going on otherwise the animation will break.
            // When the zoom animation ends we will be updated again anyway
            // This fixes the case where you do a momentum move and zoom while the move is still ongoing.
            return;
        }

        this._updatePathViewport();

        if (L.Path.SVG) {
            var vp = this._pathViewport,
		    min = vp.min,
		    max = vp.max,
		    width = max.x - min.x,
		    height = max.y - min.y,
		    root = this._buildingRoot,
            //pane = this._panes.objectsPane;
            pane = this._buildingRootContainer;

            // Hack to make flicker on drag end on mobile webkit less irritating
            if (L.Browser.mobileWebkit) {
                pane.removeChild(root);
            }

            L.DomUtil.setPosition(root, min);
            root.setAttribute('width', width);
            root.setAttribute('height', height);
            root.setAttribute('viewBox', [min.x, min.y, width, height].join(' '));

            if (L.Browser.mobileWebkit) {
                pane.appendChild(root);
            }
        } else if (L.Path.CANVAS) {
            var vp = this._pathViewport,
		    min = vp.min,
		    size = vp.max.subtract(min),
		    root = this._buildingRoot;

            //TODO check if this works properly on mobile webkit
            L.DomUtil.setPosition(root, min);
            root.width = size.x;
            root.height = size.y;
            root.getContext('2d').translate(-min.x, -min.y);
        }
    } //,
    //    _updateViewportParams: function () {
    //        var p = L.Path.CLIP_PADDING,
    //		    size = this.getSize(),
    //		    panePos = L.DomUtil.getPosition(this._mapPane),
    //		    min = panePos.multiplyBy(-1)._subtract(size.multiplyBy(p)._round()),
    //		    max = min.add(size.multiplyBy(1 + p * 2)._round());

    //        this._buildingViewport = new L.Bounds(min, max);
    //    }
});

BuildingPolygon = L.Polygon.extend({
    onAdd: function (map) {
        //L.Path.prototype.onAdd.call(this, map);

        //var siblingLength = this._container.parentNode.childNodes.length;
        this.index = undefined;

        //        this._divBuildingContainer = document.createElement("div");
        //        var parentGNode = this._container.parentNode;
        //        parentGNode.removeChild(this._container);
        //        this._divBuildingContainer.appendChild(this._container);
        //        parentGNode.appendChild(this._divBuildingContainer);

        this._map = map;

        if (!this._map._buildingRoot) {
            this._map._initBuildingRoot();
        }

        if (!this._container) {
            //this._initElements();
            this._initBuildingElements();
            this._initEvents();
        }

        this.projectLatlngs();
        this._updatePath();

        if (this._container) {
            this._map._buildingRoot.appendChild(this._container);
        }

        this.fire('add');

        map.on({
            'viewreset': this.projectLatlngs,
            'moveend': this._updatePath
        }, this);
    },

    _initBuildingElements: function () {
        if (L.Path.SVG) {
            this._map._initBuildingRoot();
            this._initPath();
            this._initStyle();
        } else if (L.Path.VML) {
            //创建shape对象并添加到_buildingRoot中
            var container = this._container = this._createElement('shape');

            L.DomUtil.addClass(container, 'leaflet-vml-shape' +
			(this.options.className ? ' ' + this.options.className : ''));

            if (this.options.clickable) {
                L.DomUtil.addClass(container, 'leaflet-clickable');
            }

            container.coordsize = '1 1';

            this._path = this._createElement('path');
            container.appendChild(this._path);

            this._map._buildingRoot.appendChild(container);

            //初始化样式
            this._initStyle();
        } else if (L.Path.CANVAS) {
            this._map._initBuildingRoot();
            this._ctx = this._map._canvasCtx;
        }
    },
    onRemove: function (map) {
        map._buildingRoot.removeChild(this._container);

        if (L.Path.CANVAS) {
            map
		    .off('viewreset', this.projectLatlngs, this)
		    .off('moveend', this._updatePath, this);

            if (this.options.clickable) {
                this._map.off('click', this._onClick, this);
                this._map.off('mousemove', this._onMouseMove, this);
            }

            this._requestUpdate();

            this.fire('remove');
            this._map = null;
        } else {
            // Need to fire remove event before we set _map to null as the event hooks might need the object
            this.fire('remove');
            this._map = null;

            if (L.Browser.vml) {
                this._container = null;
                this._stroke = null;
                this._fill = null;
            }

            map.off({
                'viewreset': this.projectLatlngs,
                'moveend': this._updatePath
            }, this);
        }
    },
    setZIndex: function (index) {
        if (index == 0 || Util.isNumber(index)) {
            //this._divContainer.style.zIndex = parseInt(index);
            index = parseInt(index);

            if (this.index == index) {
                return;
            }

            this.index = index;
            this._insertTo(this.index);
        }
    },
    _insertTo: function (index) {
        var containerParent = this._container.parentNode;
        var siblings = containerParent.childNodes;

        if (L.Path.SVG) {
            if (index >= siblings.length - 1) {
                containerParent.appendChild(this._container);
            } else if (index <= 0) {
                if (siblings.length > 0) {
                    containerParent.insertBefore(this._container, siblings[0]);
                } else {
                    containerParent.appendChild(this._container);
                }
            } else {
                containerParent.insertBefore(this._container, siblings[index]);
            }
        } else if (L.Path.VML) {
            this._container.style.zIndex = index;
        }
    },
    getZIndex: function () {
        return this.index;
    }
});


BuildingMultiPolygon = L.MultiPolygon.extend({
    setLatLngs: function (latlngs) {
        var i = 0,
				    len = latlngs.length;

        this.eachLayer(function (layer) {
            if (i < len) {
                layer.setLatLngs(latlngs[i++]);
            } else {
                this.removeLayer(layer);
            }
        }, this);

        while (i < len) {
            this.addLayer(new BuildingPolygon(latlngs[i++], this._options));
        }

        return this;
    }
});
