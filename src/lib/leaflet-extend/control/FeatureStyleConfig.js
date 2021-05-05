FeatureStyleConfig = {};

FeatureStyleConfig.text = {
    iconStyle: {
        //            iconSize: [38, 95],
        //            iconAnchor: [22, 94],
        //            popupAnchor: [-3, -76],
        className: 'leaflet-div-icon',
        html: 'html'
    },
    markerStyle: {
        clickable: true,
        draggable: false,
        keyboard: true,
        title: '',
        alt: '',
        zIndexOffset: 0,
        opacity: 1,
        riseOnOver: false,
        riseOffset: 250
    }
};

FeatureStyleConfig.rect = {
    iconStyle: {
        iconSize: [8, 8],
        iconAnchor: null,
        popupAnchor: null,
        className: 'leaflet-div-icon',
        html: ''
    },
    markerStyle: {
        clickable: true,
        draggable: false,
        keyboard: true,
        title: '',
        alt: '',
        zIndexOffset: 0,
        opacity: 1,
        riseOnOver: false,
        riseOffset: 250
    }
};

FeatureStyleConfig.picture = {
    iconStyle: {
        iconUrl: application_url_prefix + '/mapapi/leaflet-0.7.3/images/marker-icon.png',
        iconRetinaUrl: application_url_prefix + '/mapapi/leaflet-0.7.3/images/marker-icon-2x.png',
        shadowUrl: application_url_prefix + '/mapapi/leaflet-0.7.3/images/marker-shadow.png',
        shadowRetinaUrl: application_url_prefix + '/mapapi/leaflet-0.7.3/images/marker-shadow.png',
        shadowSize: [41, 41],
        shadowAnchor: [22, 94],
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34]
    },
    markerStyle: {
        clickable: true,
        draggable: false,
        keyboard: true,
        title: '',
        alt: '',
        zIndexOffset: 0,
        opacity: 1,
        riseOnOver: false,
        riseOffset: 250
    }
};

FeatureStyleConfig.circle = {
    radius: 5,
    color: '#f00',
    weight: 2,
    opacity: 1,
    fillColor: '#aa6',
    fillOpacity: 1
};

FeatureStyleConfig.polyline = {
    stroke:true,
    color: '#03f',
    weight: 5,
    opacity: 0.5,
    dashArray: '5 5',
    clickable: true,
    smoothFactor: 1
};

FeatureStyleConfig.polygon = {
    stroke: true,
    color: '#03f',
    weight: 5,
    opacity: 0.5,
    dashArray: '5 5',
    fill: true,
    fillColor: '#03f',
    fillOpacity: 0.5,
    clickable: true,
    smoothFactor: 1
};