/**
 * Created by Administrator on 2015/12/2.
 */
Z.Floor = Z.AbstractBuilding.extend({
    initialize: function(feature, symbol, options){
        //feature = feature || {};
        //
        //if(!(feature.shape instanceof Z.Extrude)){
        //    throw error("几何类型应为Z.Extrude");
        //}

        Z.AbstractBuilding.prototype.initialize.apply(this, arguments);

        //this.options = Z.Util.applyOptions(this.options, {
        //    selectSymbol: new Z.ExtrudeSymbol(),
        //    mouseoverSymbol: new Z.ExtrudeSymbol(),
        //    cellData: [],
        //    //cellLoader: function(floorIndex, floorData){},
        //    cellOptions:{
        //        spatialProp:'SHAPE',
        //        title:{prop:'', value: '', defaultValue:'', fun:null, symbol:null}
        //    }
        //}, true);
        //
        //Z.Util.applyOptions(this.options, options);
        //
        //this._cells = {};
        ////this._curFloorIndex = [1];


    },

    //getFloorIndex: function(){
    //    return this._id;
    //},

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
        this.fire("showFloorSurface");
    },

    /**
     *
     * @param cellId       number or array
     * @param options  {
     *   showSurface: true,
     *   showInner: false
     *   showWire: true
     * }
     */
    showCells: function(cellIds, options){
        this.showParts(cellIds, options);

        var cells = this.getCells(cellIds);

        for(var i = 0; i < cells.length; i++){
            cells[i].showSurface();
        }

        this.showStructure();
        this.eventCapturable = false;
        this.fire("showCells", {cellId: cellIds});
    },

    showAllCells: function(){
        this.showAllParts();

        var cells = this.getAllCells();

        for(var i = 0; i < cells.length; i++){
            cells[i].showSurface();
        }

        this.showStructure();
        this.eventCapturable = false;
        this.fire("showFloorCells");
    },

    getAllCells: function(){
        return this.getAllParts();
    },

    getCells: function(cellIds){
        return this.getParts(cellIds);
    },

    _buildParts: function(ownerGraphic, partsData, partsOptions){
        return Z.BuildingBuilder.buildCell(ownerGraphic, partsData, partsOptions);
    }
});