/**
 * Created by Administrator on 2015/12/2.
 */
Z.GraphicElement = Z.Class.extend({
    includes: Z.EventManager,

    initialize: function(feature, symbol, options){
        this.feature = feature;
        this.symbol = symbol;
        this.options = options || {};
        this.ownerGraphic = null;
        this._layer = null;
        this._render = null;
        //this._scene = null;
        this._added = false;
    },

    updateFeature: function(feature){
        if(feature instanceof Z.Feature){
            this.feature = feature;

            if(this._render && this._added){
                this._render.updateGeometry(feature.shape);
            }
        }
    },

    updateSymbol: function(symbol){
        //if(symbol && symbol !== this.symbol){
        if(symbol){
            this.symbol = symbol;

            //if(this._render && this._added &&
            //    (!this.symbol || (this.symbol && !this.symbol.equals(symbol)))
            //){
            if(this._render && this._added){
                this._render.updateSymbol(symbol);
            }
        }
    },

    //onAdd: function(graphicLayer, container, scene, baseIndex, layerIndex){
    onAdd: function(graphicLayer, container, scene){
        var graphicRender = this._getGraphicRender(graphicLayer, scene);

        if(!graphicRender){
            return;
        }

        //if(this._render !== graphicRender || !this._added){
        //    this._render = graphicRender;
        //    //this._render.onAdd(graphicLayer, container, scene, baseIndex, layerIndex);
        //    this._render.onAdd(graphicLayer, container, scene);
        //    //this._scene = scene;
        //}

        if(!this._added){
            if(this._render){
                this._render.onRemove(graphicLayer);
            }

            this._render = graphicRender;
            //this._render.onAdd(graphicLayer, container, scene, baseIndex, layerIndex);
            this._render.onAdd(graphicLayer, container, scene);
            //this._scene = scene;
        }

        this._layer = graphicLayer;
        this._added = true;
    },

    onRemove: function(graphicLayer){
        if(this._render){
            this._render.onRemove(graphicLayer);
            //this._render = null;
        }

        this._layer = null;
        //this.ownerGraphic = null;
        //this._scene = null;
        this._added = false;
    },

    dispose: function(){
        if(this._added){
            this.onRemove(this._layer);
        }

        if(this._render){
            this._render.dispose();
            this._render = null;
        }
    },

    refresh: function(){
        //this.updateFeature(this.feature);
        if(this._render){
            this._render.refresh();
        }
    },

    //setScale: function(scale){    //{x, y, z}
    //    if(this._render){
    //        this._render.setScale(scale);
    //    }
    //},

    //返回与graphicLayer匹配的render对象。如果已添加到graphicLayer中，直接返回现有render，否则将render从原有graphicLayer中移除并创建新的render对象。
    _getGraphicRender: function(graphicLayer, scene){
        if(this._render){
            if(graphicLayer === this._layer || !this._layer){
                return this._render;
            }else{
                this.onRemove(graphicLayer);
                return this._createGraphicRender(graphicLayer, scene);
            }
        }else{
            return this._createGraphicRender(graphicLayer, scene);
        }
    },

    _createGraphicRender: function(graphicLayer, scene){
        return Z.GraphicRenderFactory.getGraphicRender(graphicLayer, this, scene);
    }
});