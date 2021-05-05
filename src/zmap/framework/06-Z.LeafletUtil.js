/**
 * Created by Administrator on 2015/10/30.
 */
Z.LeafletUtil = {
    latLngBoundsFromLeaflet: function(leafletBounds){
        return Z.LatLngBounds.create(
            Z.LatLng.create(leafletBounds.getSouthWest().lat, leafletBounds.getSouthWest().lng),
            Z.LatLng.create(leafletBounds.getNorthEast().lat, leafletBounds.getNorthEast().lng));
    },

    latLngBoundsToLeaflet: function(latLngBounds){
        return L.latLngBounds(
            L.latLng(latLngBounds.getSouthWest().lat, latLngBounds.getSouthWest().lng),
            L.latLng(latLngBounds.getNorthEast().lat, latLngBounds.getNorthEast().lng));
    },

    latLngToLeaflet: function(latLng){
        return L.latLng(latLng.lat, latLng.lng);
    },

    latLngFromLeaflet: function(latLng){
        return new Z.LatLng(latLng.lat, latLng.lng);
    },

    pointFromLeaflet: function(point){
        return new Z.Point(point.x, point.y);
    }
}