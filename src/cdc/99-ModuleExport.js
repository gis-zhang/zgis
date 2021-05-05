/**
 * Created by Administrator on 2017/4/29.
 */
(function(){
    var MV = {
        MapView: MapView,
        CDCBusinessView: CDCBusinessView,
        BuildingMode: BuildingMode,
        Building: Building,
        Floor: Floor,
        Room: Room,
        Equipment: Equipment,
        FloorController: FloorController
    };

    // for Node module pattern loaders, including Browserify
    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = MV;

    // as an AMD module
    } else if (typeof define === 'function' && define.amd) {
        define("MV", MV);
    }
}());



