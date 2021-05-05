BuildingDataLoader = function () {
    this.buildingUrl = "http://localhost:8080/temporal-webserver/rest/featureservice/building/query";
    this.FloorUrl = "http://localhost:8080/temporal-webserver/rest/featureservice/building/querycell";
    this.cellUrl;
    this.farenUrl = "http://localhost:8080/temporal-webserver/rest/featureservice/building/queryfaren";
    this.employeeUrl = "http://localhost:8080/temporal-webserver/rest/featureservice/building/queryemployee";
    this.renkouUrl = "http://localhost:8080/temporal-webserver/rest/featureservice/building/queryrenkou";
    this.zhaoshangUrl = "http://localhost:8080/temporal-webserver/rest/featureservice/building/queryzhaoshang";
};

BuildingDataLoader.prototype.loadBuildings = function (params, callback) {
    var bData = testWktData;
    callback(bData);
}

BuildingDataLoader.prototype.loadBuildingFloor = function (buildingId, floorIndex, callback, scope) {
    //    var bcData = testCellWktData;
    //    callback(bcData);
    var params = {
        buildingId: buildingId,
        floorIndex: floorIndex
    }
    this.queryData(this.FloorUrl, params, callback, scope);
}

BuildingDataLoader.prototype.queryCells = function (params, callback) {
    var bcData = testCellWktData;
    callback(bcData);
}

BuildingDataLoader.prototype.queryFaren = function (danganCode, callback, scope) {
    var params = {
        dabm: danganCode
    }

    this.queryData(this.farenUrl, params, callback, scope);
}

BuildingDataLoader.prototype.queryEmployee = function (danganCode, callback, scope) {
    var params = {
        dabm: danganCode
    }

    this.queryData(this.employeeUrl, params, callback, scope);
}

BuildingDataLoader.prototype.queryRenkou = function (peopleNum, callback, scope) {
    var params = {
        peopleNum: peopleNum
    }

    this.queryData(this.renkouUrl, params, callback, scope);
}

BuildingDataLoader.prototype.queryZhaoshang = function (buildingId, callback, scope) {
    var params = {
        buildingId: buildingId
    }

    this.queryData(this.zhaoshangUrl, params, callback, scope);
}

BuildingDataLoader.prototype.queryData = function (url, params, callback, scope) {
    var queryString = decodeURIComponent($.param(params));

    $.ajax({
        type: "GET",
        url: url,
        data: queryString,
        success: function (data) {
            var resultData = data;

            if (typeof resultData === "string") {
                resultData = jQuery.parseJSON(resultData);
            }

            if (resultData.success) {
                if (scope) {
                    callback.call(scope, resultData.list);
                } else {
                    callback(resultData.list);
                }
            } else {

            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            var sss = 6
        }
    });
}

