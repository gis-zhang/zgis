/**
 * Created by Administrator on 2015/12/2.
 */
Z.MultiExtrude = Z.Geometry.extend({
    initialize: function(extrudes){
        Z.Geometry.prototype.initialize.call(this);
        this.extrudes = extrudes || [];
        this.type = "multiextrude";
    },

    getBounds: function(){
        var west, east, south, north, minAlt, maxAlt;

        for(var i = 0; i < this.extrudes.length; i++){
            var curBounds = this.extrudes[i].getBounds();

            if(west === undefined){
                west = curBounds.getWest();
                east = curBounds.getEast();
                south = curBounds.getSouth();
                north = curBounds.getNorth();
                minAlt = this.extrudes[i].baseHeight;
                maxAlt = this.extrudes[i].baseHeight + this.extrudes[i].height;
            }else{
                west = Math.min(west, curBounds.getWest());
                east = Math.max(east, curBounds.getEast());
                south = Math.min(south, curBounds.getSouth());
                north = Math.max(north, curBounds.getNorth());
                minAlt = Math.min(minAlt, this.extrudes[i].baseHeight);
                maxAlt = Math.max(maxAlt, (this.extrudes[i].baseHeight + this.extrudes[i].height));
            }
        }

        if(west === undefined){
            return null;
        }else{
            return Z.LatLngBounds.create(Z.LatLng.create(south, west, minAlt), Z.LatLng.create(north, east, maxAlt));
        }
    },

    clone: function(){
        var extrudes = [];

        for(var i = 0; i < this.extrudes; i++){
            extrudes.push(this.extrudes[i].clone());
        }

        return new Z.MultiExtrude(extrudes);
    }
});