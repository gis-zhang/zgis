/**
 * Created by Administrator on 2017/4/29.
 */

var Floor = CDCBuildingUnit.extend({
    initialize: function(hull){
        CDCBuildingUnit.prototype.initialize.call(this, hull);
        this.floorId = null;
        this.floorIndex = null;
        this.ownerBuilding = null;
    },

    addRooms: function(rooms){
        if(!rooms){
            return;
        }

        var inputRooms = Array.isArray(rooms) ? rooms : [rooms],
            realRooms = [];

        for(var i = 0; i < inputRooms.length; i++){
            if(inputRooms[i] instanceof Room){
                realRooms.push(inputRooms[i]);
            }
        }

        this.addComponents(realRooms);
    },

    removeFloors: function(rooms){
        if(!rooms){
            return;
        }

        var inputRooms = Array.isArray(rooms) ? rooms : [rooms],
            realRooms = [];

        for(var i = 0; i < inputRooms.length; i++){
            if(inputRooms[i] instanceof Room){
                realRooms.push(inputRooms[i]);
            }
        }

        this.removeComponents(realRooms);
    }
});