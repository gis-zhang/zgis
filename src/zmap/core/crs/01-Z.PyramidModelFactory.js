Z.PyramidModelFactory = function(){}

Z.PyramidModelFactory.create = function(options){
    options = options || {};

    var id = options.pyramidId;
    var pyramidOptions = options.pyramidDefine;

    if(pyramidOptions){
        var pyramidGrid = null;

        if(pyramidOptions.type === "CustomLevel"){
            pyramidGrid = new Z.CustomPyramidGrid(pyramidOptions.params);
        }else{
            pyramidGrid = new Z.FixedMultiplePyramidGrid(pyramidOptions.params);
        }

        //var crs = ((options.crs instanceof Z.CRS) ? options.crs : Z.CRS[options.crsId])|| Z.CRS[options.crsId] || Z.CRS[DefaultZMapConfig.crs] || Z.CRS[MapConfig.crs] || Z.CRS.EPSG4326;
        var crs = Z.CRS[pyramidOptions.crsId + ""] || Z.CRS[DefaultZMapConfig.crs + ""] || Z.CRS[MapConfig.crs + ""] || Z.CRS.EPSG4326;

        if(pyramidOptions.crs){
            crs = ((pyramidOptions.crs instanceof Z.CRS) ? pyramidOptions.crs : null) || crs;
        }

        ////return pyramidModel;
        //return new Z.PyramidModel(pyramidGrid, {crs: crs});

        return new Z.PyramidModel(pyramidGrid, crs, options.projModel);
    }else if(Z.PyramidModel[id]){
        return new Z.PyramidModel[id]();
    }else{
        return new Z.PyramidModel.TDT();
    }

    //var pyramidGrid = null;
    //
    //if(pyramidOptions.type === "CustomLevel"){
    //    pyramidGrid = new Z.CustomPyramidGrid(pyramidOptions.params);
    //}else{
    //    pyramidGrid = new Z.FixedMultiplePyramidGrid(pyramidOptions.params);
    //}
    //
    //var crs = ((options.crs instanceof Z.CRS) ? options.crs : Z.CRS[options.crsId])|| Z.CRS[options.crsId] || Z.CRS[DefaultZMapConfig.crs] || Z.CRS[MapConfig.crs] || Z.CRS.EPSG4326;
    //
    //////return pyramidModel;
    ////return new Z.PyramidModel(pyramidGrid, {crs: crs});
    //
    //return new Z.PyramidModel(pyramidGrid, crs, options.projModel);
}