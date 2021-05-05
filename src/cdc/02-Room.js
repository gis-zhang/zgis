/**
 * Created by Administrator on 2017/4/29.
 */

var Room = CDCBuildingUnit.extend({
    initialize: function(hull){
        CDCBuildingUnit.prototype.initialize.call(this, hull);
        this.roomId = null;
        this.floorIndex = null;
        this.ownerBuilding = null;

        if(hull){
            var innerVisionUnit = this._getInnerVisionUnit(),
                innerBgGraphic = this._createInnerBgGraphics(hull);
            innerVisionUnit.bgGraphics.push(innerBgGraphic);
        }

    },

    updateHull: function(graphic){
        CDCBuildingUnit.prototype.updateHull.call(this, graphic);
        var hull = this.getHull(),
            innerVisionUnit = this._getInnerVisionUnit(),
            innerBgGraphic = this._createInnerBgGraphics(hull);
        innerVisionUnit.bgGraphics = [];
        innerVisionUnit.bgGraphics.push(innerBgGraphic);
    },

    addEquipments: function(equipments){
        if(!equipments){
            return;
        }

        var inputEquipments = Array.isArray(equipments) ? equipments : [equipments],
            realEquipments = [];

        for(var i = 0; i < inputEquipments.length; i++){
            if(inputEquipments[i] instanceof Equipment){
                realEquipments.push(inputEquipments[i]);
            }
        }

        this.addComponents(realEquipments);
    },

    removeEquipments: function(equipments){
        if(!equipments){
            return;
        }

        var inputEquipments = Array.isArray(equipments) ? equipments : [equipments],
            realEquipments = [];

        for(var i = 0; i < inputEquipments.length; i++){
            if(inputEquipments[i] instanceof Equipment){
                realEquipments.push(inputEquipments[i]);
            }
        }

        this.removeComponents(realEquipments);
    },

    _createInnerBgGraphics: function(templateGraphic){
        if(!templateGraphic){
            return null;
        }

        var newGraphic = templateGraphic.clone();
        newGraphic.symbol.opacity = 1;
        newGraphic.symbol.side = "BackSide";
        newGraphic.eventCapturable = false;
        newGraphic.eventFirable = false;

        return newGraphic;
    }
});