/**
 * Created by Administrator on 2015/12/2.
 */
Z.ModelGeometry = Z.Geometry.extend({
    initialize: function(crs, modelParams, transformation, lngStart){
        Z.Geometry.prototype.initialize.call(this, crs);
        this.crs = crs || Z.CRS.EPSG4490;   //默认坐标系
        this.lngStart = lngStart === false ? false : true;
        this.modelParams = modelParams || {};        //{vertices:[], uvs: [], faces:[], normals:[], isLine: false}
        this.transformation = transformation;
        this.type = "modelgeometry";
    },

    getBounds: function(){
        if(this.needsUpdate || !this._bounds){
            var pathBounds = Z.GeometryUtil.getPathBounds(this._translateArray(this.modelParams ? this.modelParams.vertices : []), true),
                southWest, northEast;

            if(pathBounds){
                southWest = pathBounds.getSouthWest(),
                northEast = pathBounds.getNorthEast();

                this._bounds = Z.LatLngBounds.create(southWest, northEast);
                this.needsUpdate = false;
            }
        }

        return this._bounds;
    },

    clone: function(){
        var newModelParams = {};
        newModelParams.vertices = this.modelParams.vertices ? Z.Util.arrayClone(this.modelParams.vertices) : this.modelParams.vertices;
        newModelParams.uvs = this.modelParams.uvs ? Z.Util.arrayClone(this.modelParams.uvs) : this.modelParams.uvs;
        newModelParams.faces = this.modelParams.faces ? Z.Util.arrayClone(this.modelParams.faces) : this.modelParams.faces;

        return new Z.ModelGeometry(this.crs, this.modelParams, this.transformation);
    },

    _translateArray: function(inputArray){
        var array = [];

        //if(inputArray instanceof Array){
        if(Z.Util.isArray(inputArray)){
            for(var i = 0, j = 0; i < inputArray.length - 2; i = i + 3, j++){
                if(this.transformation){
                    var transformPoint = this.transformation.transform(inputArray[i], inputArray[i + 1], inputArray[i + 2]);
                    array[j] = [transformPoint.x, transformPoint.y, transformPoint.z];
                }else{
                    array[j] = [inputArray[i], inputArray[i + 1], inputArray[i + 2]];
                }
            }
        }

        return array;
    }
});