/**
 * Created by Administrator on 2017/4/29.
 */

var Building = CDCBuildingUnit.extend({
    /**
     *
     * @param floorConfig : [{
     * `index: 1,
     *  desc: '',
     *  objectId: ''
     * }]
     */
    initialize: function(hull, floorConfig){
        CDCBuildingUnit.prototype.initialize.call(this, hull);
        this._floorConfig = floorConfig;
        this._floorMapping = this._buildFloorMapping(floorConfig);
        //this.buildingId = null;
        this.name = null;
    },

    addFloors: function(floors){
        if(!floors){
            return;
        }

        var inputFloors = Array.isArray(floors) ? floors : [floors],
            realFloors = [];

        for(var i = 0; i < inputFloors.length; i++){
            if(inputFloors[i] instanceof Floor){
                realFloors.push(inputFloors[i]);
            }
        }

        this.addComponents(realFloors);

        this._floorMapping = this._buildFloorMapping(this._floorConfig);
    },

    removeFloors: function(floors){
        if(!floors){
            return;
        }

        var inputFloors = Array.isArray(floors) ? floors : [floors],
            realFloors = [];

        for(var i = 0; i < inputFloors.length; i++){
            if(inputFloors[i] instanceof Floor){
                realFloors.push(inputFloors[i]);
            }
        }

        this.removeComponents(realFloors);

        this._floorMapping = this._buildFloorMapping(this._floorConfig);
    },

    getFloorsInfo: function(){
        var info = [];

        for(var key in this._floorMapping){
            info.push(this._floorMapping[key]);
        }

        return info;
    },

    updateFloorConfig: function(floorConfig){
        this._floorConfig = floorConfig;
        this._floorMapping = this._buildFloorMapping(this._floorConfig);
    },

    showFloorsByIndex: function(floorIndexArray){
        var floorIndexes = Array.isArray(floorIndexArray) ? floorIndexArray : [floorIndexArray],
            floorsForShow = {};

        for(var i = 0; i < floorIndexes.length; i++){
            var mappingItem = this._floorMapping[floorIndexes[i] + ""];

            if(!mappingItem){
                continue;
            }

            var floorObj = mappingItem.object;

            if(!floorObj){
                continue;
            }

            floorObj.show();
            floorsForShow[floorObj.uid] = true;
        }

        for(var j = 0; j < this._components.length; j++){
            var currentUID = this._components[j].uid;

            if(!floorsForShow[currentUID]){
                this._components[j].hide();
            }
        }
    },

    _buildFloorMapping: function(floorConfig){
        var mapping = {};

        if(floorConfig){
            for(var i = 0; i < floorConfig.length; i++){
                if(!floorConfig[i]){
                    continue;
                }

                var index = floorConfig[i].index;

                if(index === undefined){
                    continue;
                }

                mapping[index + ""] = {
                    index: index,
                    desc: floorConfig[i].desc,
                    objectId: floorConfig[i].objectId,
                    object: this._getFloorById(floorConfig[i].objectId)
                };
            }
        }else{
            for(var i = 0; i < this._components.length; i++){
                mapping[(i + 1) + ""] = {
                    index: i + 1,
                    desc: '',
                    objectId: this._components[i].uid,
                    object: this._components[i]
                };
            }
        }

        return mapping;
    },

    _getFloorById: function(objectId){
        var floorObj = null;

        for(var i = 0; i < this._components.length; i++){
            if(this._components[i].getHull().feature.props.name === objectId){
                floorObj = this._components[i];
                break;
            }
        }

        return floorObj;
    }
});