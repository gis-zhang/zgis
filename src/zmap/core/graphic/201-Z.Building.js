/**
 * Created by Administrator on 2015/12/2.
 */
Z.Building = Z.AbstractBuilding.extend({
    initialize: function(feature, symbol, options){
        Z.AbstractBuilding.prototype.initialize.apply(this, arguments);

        this.options = Z.Util.applyOptions(this.options, {
            floorIndexProp: options.floorIndexProp || 'index'
        }, true);
    },

    /**
     *
     * @param options {
     *   enableWire: true,
     *   opacity: 1
     * }
     */
    showSurface: function(options){
        this.showSelf();
        this.hideStructure();
        this.eventCapturable = true;
        this.eventFirable = true;
        //this._applyFloorsEvent("off");
        this.fire("showBuildingSurface");
    },

    /**
     *
     * @param floorIndex       number or array
     * @param options  {
     *   showSurface: true,
     *   showInner: false
     *   showWire: true
     * }
     */
    showFloor: function(floorsIndex){
        this.showParts(floorsIndex, {showInner: true});

        var floors = this.getFloors(floorsIndex);

        for(var i = 0; i < floors.length; i++){
            floors[i].showAllCells();
        }

        this.hideStructure();
        this.eventCapturable = false;
        //this._applyFloorsEvent("off");
        //var floors = this.getFloor(floorIndex);

        //for(var i = 0; i < floors.length; i++){
        //    this._applyOneFloorEvent(floors[i], 'on');
        //}

        this.fire("showFloors", {floorsIndex: floorsIndex});
    },

    showAllFloors: function(floorModel){     //floorModel:surface、cells
        this.showAllParts();
        this.hideStructure();
        this.eventCapturable = false;
        //this._applyFloorsEvent("off");   //防止重复添加事件
        //this._applyFloorsEvent("on");
        this.fire("showAllFloors");

        //if(floorModel === Z.FloorModel.Cells){
        //    var floors = this.getAllFloors();
        //
        //    for(var i = 0; i < floors.length; i++){
        //        floors[i].showCells();
        //    }
        //}else{
        //
        //}

        var floors = this.getAllFloors();

        for(var i = 0; i < floors.length; i++){
            if(floorModel === Z.FloorModel.Cells){
                floors[i].showAllCells();
            }else{
                floors[i].showSurface();
            }

        }
    },

    showCell: function(cellId, options){},

    getAllFloors: function(){
        return this.getAllParts();
    },

    getFloors: function(floorIndex){
        return this.getParts(floorIndex);
    },

    getCurFloors: function(){
        return this.getCurParts();
    },

    getCurFloorsIndex: function(){
        return this.getCurPartIds();
    },

    _buildParts: function(ownerGraphic, partsData, partsOptions){
        return Z.BuildingBuilder.buildFloor(ownerGraphic, partsData, partsOptions);
    }
});