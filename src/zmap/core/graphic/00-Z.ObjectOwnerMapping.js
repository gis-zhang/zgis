/**
 * Created by Administrator on 2016/8/21.
 */

Z.ObjectOwnerMapping = Z.Class.extend({
    initialize: function(){
        //this._graphicTiles = {};
        //this._graphicToIndexMap = {};

        this._mapping = {};
    },

    registerObjects : function(owner, objects){
        for(var i = 0; i < objects.length; i++){
            var curObj = objects[i],
                id = (curObj._rawGraphic || curObj).id;

            this._registerOneObject(owner, id);
        }
    },

    getUnregisteredObjects : function(objects){
        var duplicateObjects = []

        for(var i = 0; i < objects.length; i++){
            var curObj = objects[i],
                id = (curObj._rawGraphic || curObj).id,
                item = this._mapping[id],
                exist = false;

            if(item && item.addedOwner) {
                exist = true;
            }

            if(exist){
                continue;
            }else{
                duplicateObjects.push(curObj);
            }
        }

        return duplicateObjects;
    },

    getOwnersForUpdate: function(meshes){
        var tilesForUpdate = {};

        for(var i = 0; i < meshes.length; i++){
            var curObj = meshes[i],//curTile.objects[j],
                id = (curObj._rawGraphic || curObj).id,
                ownerTiles = this._mapping[id].owners || [];

            if(!this._mapping[id].addedOwner && ownerTiles.length > 0){
                var firstTile = ownerTiles[0];
                //firstTile.needsUpdate = true;
                tilesForUpdate[id] = firstTile;
            }
        }

        return tilesForUpdate;
    },
    //_updateOwnerOfObjects: function(meshes){
    //    var tilesForUpdate = {};
    //
    //    for(var i = 0; i < meshes.length; i++){
    //        var curObj = meshes[i],
    //            id = (curObj._rawGraphic || curObj).id,
    //            ownerTiles = this._mapping[id].owners || [];
    //
    //        if(!this._mapping[id].addedOwner && ownerTiles.length > 0){
    //            var firstTile = ownerTiles[0];
    //            tilesForUpdate[id] = firstTile;
    //            this._mapping[id].addedOwner = firstTile;
    //        }
    //    }
    //
    //    return tilesForUpdate;
    //},

    unregisterObjects: function(owner, objects){
        var removed = [], remained = [];

        for(var j = 0; j < objects.length; j++){
            var curObj = objects[j],
                shouldRemove = this._removeObjectFromOneOwner(curObj, owner);

            if(shouldRemove){
                removed.push(curObj);
            }else{
                remained.push(curObj);
            }
        }

        var ownerForUpdate = this.getOwnersForUpdate(remained),
        //var ownerForUpdate = this._updateOwnerOfObjects(remained),
            ownersArray = [];

        for(var key in ownerForUpdate){
            ownersArray.push(ownerForUpdate[key]);
        }

        return {
            removed: removed,
            remained: remained,
            owneresNeedsUpdate: ownersArray
        };
    },

    exist: function(object){
        var exist = false;

        if(!object){
            return exist;
        }

        var id = object.id;

        if(!id){
            return exist;
        }

        var item = this._mapping[id];

        if(item && (item.addedOwner || (!item.addedOwner && item.owners.length > 0))){
            exist = true;
        }

        return exist;
    },

    _registerOneObject : function(owner, objectId){
        var item = this._mapping[objectId];

        if(!item) {
            this._mapping[objectId] = {
                addedOwner: null,
                owners: []
            };

            item = this._mapping[objectId];
        }

        if(!item.addedOwner){
            item.addedOwner = owner;
            item.owners.push(owner);
        }else{
            var owners = item.owners,
                exist = false;

            for(var j = 0; j < owners.length; j++){
                if(owners[j] === owner){
                    exist = true;
                    break;
                }
            }

            if(!exist){
                item.owners.push(owner);
            }
        }
    },

    _removeObjectFromOneOwner : function(object, tile){
        var curObj = object,//curTile.objects[j],
            id = (curObj._rawGraphic || curObj).id,
            ownerTiles = [],
            shouldRemove = true;

        if(!this._mapping[id]){
            return shouldRemove;
        }

        ownerTiles = this._mapping[id].owners || [];

        for(var k = ownerTiles.length - 1; k >= 0; k--){
            if(ownerTiles[k] !== tile){
                continue;
            }

            ownerTiles.splice(k, 1);
            //break;
            if(this._mapping[id].addedOwner === tile){
                this._mapping[id].addedOwner = null;
                //break;
            }
        }

        if(!this._mapping[id].addedOwner){
            if(ownerTiles.length <= 0){
                this._mapping[id] = null;
                delete this._mapping[id];
            }else{
                shouldRemove = false;
            }
        }

        //需要释放object占用的资源，待完善

        return shouldRemove;
    }
});


