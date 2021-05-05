/**
 * Created by Administrator on 2017/4/29.
 */

var Equipment = CDCBuildingUnit.extend({
    initialize: function(hull){
        CDCBuildingUnit.prototype.initialize.call(this, hull);
        this.ownerRoom = null;
        this.equipmentId = null;
    }
});