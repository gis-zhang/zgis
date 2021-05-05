/**
 * Created by Administrator on 2015/12/2.
 */
Z.GraphicRenderFactory = {
    getGraphicRender: function(graphicLayer, graphicElement, scene){
        if(!(graphicElement instanceof Z.GraphicElement)|| !(scene instanceof Z.IScene)){
            return null;
        }

        var geometry = graphicElement.feature ? graphicElement.feature.shape : null;

        if(!geometry){
            return null;
        }

        if(scene instanceof Z.Scene2D){
            return this._getGraphicRender2D(graphicLayer, graphicElement, geometry);
        }else if(scene instanceof Z.Scene3D){
            return this._getGraphicRender3D(graphicLayer, graphicElement, geometry);
        }else{
            throw new Error("不支持的scene类型：" + scene.constructor);
        }
    },

    _getGraphicRender2D: function(graphicLayer, graphicElement, geometry){
        if(geometry instanceof Z.Polyline){
            return new Z.PolylineRender2D(graphicElement);
        }else if(geometry instanceof Z.Polygon){
            return new Z.PolygonRender2D(graphicElement);
        }else if(geometry instanceof Z.LatLng && graphicElement.symbol instanceof Z.PictureMarkerSymbol){
            return new Z.PictureMarkerRender2D(graphicElement);
        }else if(geometry instanceof Z.LatLng && graphicElement.symbol instanceof Z.TextSymbol){
            return new Z.TextMarkerRender2D(graphicElement);
        }else if(geometry instanceof Z.Circle){
            return new Z.CircleMarkerRender2D(graphicElement);
        }else{
            console.info("不支持的Geometry类型:" + geometry.constructor);
            return null;
        }
    },

    _getGraphicRender3D: function(graphicLayer, graphicElement, geometry){
        if(graphicLayer instanceof Z.TerrainGraphicLayer){
            return new Z.GraphicRenderTerrain(graphicElement);
        }

        if(geometry instanceof Z.Polyline){
            //if(graphicElement.symbol.only2d){
            //    return new Z.CanvasPolylineRender3D(graphicElement);
            //}else{
            //    return new Z.PolylineRender3D(graphicElement);
            //}
            return new Z.PolylineRender3D(graphicElement);
        }else if(geometry instanceof Z.Polygon){
            return new Z.PolygonRender3D(graphicElement);
        }else if(geometry instanceof Z.LatLng && graphicElement.symbol instanceof Z.PictureMarkerSymbol){
            return new Z.PictureMarkerRender3D(graphicElement);
        }else if(geometry instanceof Z.LatLng && graphicElement.symbol instanceof Z.TextSymbol){
            return new Z.CanvasTextRender3D(graphicElement);
        }else if(geometry instanceof Z.CircleExtrude){
            return new Z.CircleExtrudeRender3D(graphicElement);
        }else if(geometry instanceof Z.Extrude || geometry instanceof Z.MultiExtrude){
            return new Z.ExtrudeRender3D(graphicElement);
        }else if(geometry instanceof Z.Circle){
            return new Z.CircleMarkerRender3D(graphicElement);
        }else if(geometry instanceof Z.Ring){
            return new Z.RingMarkerRender3D(graphicElement);
        }else if(geometry instanceof Z.ModelGeometry){
            return new Z.ModelRender3D(graphicElement);
        }else if(geometry instanceof Z.Sphere){
            return new Z.SphereRender3D(graphicElement);
        }else{
            //throw new Error("不支持的Geometry类型:" + geometry.constructor);
            console.info("不支持的Geometry类型:" + geometry.constructor);
            return null;
        }
    }
};