/**
 * Created by Administrator on 2015/12/2.
 */
Z.Cell = Z.AbstractBuilding.extend({
    initialize: function(feature, symbol, options){
        //feature = feature || {};
        //
        //if(!(feature.shape instanceof Z.Extrude)){
        //    throw error("几何类型应为Z.Extrude");
        //}

        Z.AbstractBuilding.prototype.initialize.apply(this, arguments);

        //this.options = Z.Util.applyOptions(this.options, {
        //    selectSymbol: new Z.ExtrudeSymbol(),
        //    mouseoverSymbol: new Z.ExtrudeSymbol()
        //}, true);
        //
        //Z.Util.applyOptions(this.options, options);
        //
        //this._cells = {};
        ////this._curFloorIndex = [1];
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
    },

    _buildParts: function(ownerGraphic, partsData, partsOptions){
        return Z.BuildingBuilder.buildCell(ownerGraphic, partsData, partsOptions);
    }
});

Z.Building.load = function(){}