/**
 * Created by Administrator on 2015/10/30.
 */
Z.BuildingLayer = Z.GraphicLayer.extend({
    buildingOptions:{
        root:'',
        props:'',     //string or function
        id:'#{id}',
        title:'#{name}',
        titleSymbol: null,
        icon: null,
        iconSymbol: null,
        desc:'#{id}',
        shape:'#{SHAPE}',
        cw: false,
        height: 0,       //优先级顺序为：fun、prop、value、defaultValue
        baseHeight: 0,   //同上
        selectSymbol: null,
        mouseoverSymbol: null,
        partsData: null,
        //floorLoader: function(buildingGrahic, buildingData){},
        partsOptions:{
            props:'',     //string or function
            id:'#{id}',
            title:'#{name}',
            titleSymbol: null,
            icon: null,
            iconSymbol: null,
            desc:'#{id}',
            shape:'#{SHAPE}',
            cw: false,
            floorIndex:'#{id}',
            height: 0,       //优先级顺序为：fun、prop、value、defaultValue
            selectSymbol: null,
            mouseoverSymbol: null,
            partsData: null,
            //cellLoader: function(floorIndex, floorData){},
            partsOptions:{
                props:'',     //string or function
                id:'#{id}',
                title:'#{name}',
                titleSymbol: null,
                icon: null,
                iconSymbol: null,
                desc:'#{id}',
                height: 0,       //优先级顺序为：fun、prop、value、defaultValue
                shape:'#{SHAPE}',
                cw: false,
                selectSymbol: null,
                mouseoverSymbol: null,
                wire: false,
                opacity: 1,
                topColor: '#000fff',
                wallColor: '#ffaa33'
            },
            wire: true,
            opacity: 1,
            topColor: '#0f00ff',
            wallColor: '#00aa33'
        },
        wire: true,
        opacity: 1,
        topColor: '#000fff',
        wallColor: '#ffaa33'
    },

    initialize: function(options){
        options = options || {};
        Z.GraphicLayer.prototype.initialize.call(this, options);
        this.buildingOptions = Z.Util.applyOptions(this.buildingOptions, options, false);

        //this._graphics = {};
        //this._scene = null;
        //this._render = null;
        //this._visible = true;

    },

    /**
     *
     * @param objects
     * @param options
     * @param recursive   如果为true，则加载包括层和户在内的所有信息，如果为false则只加载建筑整体信息。默认为false
     */
    loadBuildingsByWKT: function(objects, options, recursive){
        options = options || {};
        options.partsOptions = options.partsOptions || {};
        this.buildingOptions = Z.Util.applyOptions(this.buildingOptions, options, false, ['partsOptions']);
        this.buildingOptions.partsOptions = Z.Util.applyOptions(this.buildingOptions.partsOptions, options.partsOptions, false, ['partsOptions']);
        this.buildingOptions.partsOptions.partsOptions = Z.Util.applyOptions(this.buildingOptions.partsOptions.partsOptions, options.partsOptions.partsOptions, false);
        this.options = Z.Util.applyOptions(this.options, options, false);

        var objLength = objects.length,
            graphics = [];
            //graphicOptions = this._getGraphicOptions();
        console.info("objLength:" + objLength);
        //for(var i = 0; i < objLength; i++){
        //    //var buildings = this._buildBuilding(objects[i], this.buildingOptions, graphicOptions);
        //    var buildings = this._buildBuilding(objects[i], this.buildingOptions);
        //
        //    for(var j = 0; j < buildings.length; j++){
        //        graphics.push(buildings[j]);
        //    }
        //}
        //console.info("graphics:" + graphics.length);
        //document.getElementById("loadingState").innerHTML="数据加载......";

        var loader = new Z.JsonBuildingLoader(objects, this.buildingOptions.root),
            thisObj = this;
        loader.load(function(buildingData){
            var parts = Z.BuildingBuilder.buildBuilding(buildingData, thisObj.buildingOptions);

            for(var i = 0; i < parts.length; i++){
                graphics.push(parts[i]);
            }
        }, recursive);

        //document.getElementById("loadingState").innerHTML="数据加载完毕，总共" + graphics.length + "条记录 | 开始解析:";

        this.addGraphics(graphics);

        //document.getElementById("loadingState").innerHTML="数据加载完毕，总建筑物个数为" + graphics.length;
    },

    //重写父类GraphicLayer的_fireGraphicEvent方法
    _fireGraphicEvent: function(graphicEvent){
        Z.GraphicLayer.prototype._fireGraphicEvent.apply(this, arguments);

        var graphic = graphicEvent.object,
            type = graphicEvent.type;

        if(graphic instanceof Z.Building){
            type = "building" + type;
        }else if(graphic instanceof Z.Floor){
            type = "floor" + type;
        }else if(graphic instanceof Z.Cell){
            type = "cell" + type;
        }

        this.fire(type, {
            latlng: graphicEvent.latlng,
            scenePoint: graphicEvent.scenePoint,
            containerPoint: graphicEvent.containerPoint,
            originalEvent: graphicEvent.originalEvent,
            objects: graphicEvent.object ? [graphicEvent.object] : []
        });

        //Z.GraphicLayer.prototype._fireLayerEvent.apply(this, arguments);
    },

    _getGraphicLayerRender3D: function(options){
        return new Z.GraphicLayerMergedRender3D(options);
        //return new Z.GraphicLayerTileRender3D(options);
        //return new Z.GraphicLayerRender3D(options);
    }
});