/**
 * Created by Administrator on 2015/12/2.
 * 根据symbol创建对应的材质对象
 */
Z.StyleBuilder3D = function(){};

Z.StyleBuilder3D.createRenderStyle = function(symbol, renderType, side, onTextureLoad){
    symbol = symbol || {};
    var style = null,
        opacity = symbol.opacity,
        options = {
            transparent: false
        };

    if(opacity < 1){
        options.transparent = true;
        options.opacity = opacity;
    }

    if(side && THREE[side]){
        options.side = THREE[side];
    }

    if(symbol instanceof Z.FillSymbol){
        if(symbol instanceof Z.PictureFillSymbol){
            var bgColor = symbol.bgColor || 0xffffff;
            options.color = bgColor;
            //style = new THREE.MeshBasicMaterial({color: bgColor, transparent: true, opacity: opacity});
            //fillMaterial.map = texture;
            //this._textureForLoad.push({material:fillMaterial, url: fillSymbol.url});
            if((typeof symbol.url === "string") && symbol.url.length > 0){
                options.map = this._loadTexture(symbol.url, null, onTextureLoad);
            }
        }else{
            var fillColor = symbol.color|| symbol.bgColor || 0xffffff;
            options.color = fillColor;

            //style = new THREE.MeshBasicMaterial({
            //    color:fillColor
            //});
        }

        if(renderType === "lambert"){
            style = new THREE.MeshLambertMaterial(options);
        }else if(renderType === "phong"){
            style = new THREE.MeshPhongMaterial(options);
        }else{
            style = new THREE.MeshBasicMaterial(options);
        }

        if(!(symbol instanceof Z.PictureFillSymbol) && onTextureLoad && typeof onTextureLoad === "function"){
            onTextureLoad();
        }
    }else if(symbol instanceof Z.PolylineSymbol){
        var color = symbol.color || 0xffffff,
            width = symbol.width || 1;
        options.color = color;
        options.linewidth = width;

        if(symbol.style === Z.PolylineStyleType.Dash){
            if(symbol.dashSize){
                options.dashSize = symbol.dashSize;
            }

            if(symbol.gapSize){
                options.gapSize = symbol.gapSize
            };
            style = new THREE.LineDashedMaterial(options);
        }else{
            style = new THREE.LineBasicMaterial(options);
        }

        if(onTextureLoad && typeof onTextureLoad === "function"){
            onTextureLoad();
        }
    }else if(symbol instanceof Z.ModelSymbol){
        style = this._createByModelSymbol(symbol, renderType, onTextureLoad);
    }

    //if(style.transparent && style.opacity < 1){
    //    style.depthWrite = false;
    //}

    return style;
}

Z.StyleBuilder3D._createByModelSymbol = function(symbol, renderType, onTextureLoad){
    var params = {
        transparent: false,
        texParams: {}
    };

    for ( var prop in symbol ) {
        var value = symbol[ prop ];

        if ( value === null || value === undefined || value === '' ) continue;

        switch ( prop.toLowerCase() ) {
            // Ns is material specular exponent
            case 'kd':
                // Diffuse color (color under white light) using RGB values
                params.color = new THREE.Color().fromArray( value );
                break;
            case 'ks':
                // Specular color (color when light is reflected from shiny surface) using RGB values
                params.specular = new THREE.Color().fromArray( value );
                break;
            case 'map_kd':
                // Diffuse texture map
                if ( params.map ) break; // Keep the first encountered texture

                var texParams = this._getTextureParams( value, params );
                //params.map = this._loadTexture( this._resolveURL( symbol.path, texParams.url ) );
                //params.map.repeat.copy( texParams.scale );
                //params.map.offset.copy( texParams.offset );
                //params.map.wrapS = symbol.map_kd_wrap;
                //params.map.wrapT = symbol.map_kd_wrap;
                params.texParams.map = this._prepareTexture(
                    this._resolveURL(symbol.path, texParams.url),
                    texParams.scale,
                    texParams.offset,
                    symbol.map_kd_wrap,
                    symbol.map_kd_wrap);
                //{
                //    url: this._resolveURL(symbol.path, texParams.url),
                //    onLoad: function(texture){
                //        texture.repeat.copy( texParams.scale );
                //        texture.offset.copy( texParams.offset );
                //        texture.wrapS = symbol.map_kd_wrap;
                //        texture.wrapT = symbol.map_kd_wrap;
                //    }
                //};
                break;
            case 'map_ks':
                // Specular map
                if ( params.specularMap ) break; // Keep the first encountered texture

                //params.specularMap = this._loadTexture( this._resolveURL( symbol.path, value ) );
                //params.specularMap.wrapS = symbol.map_ks_wrap;
                //params.specularMap.wrapT = symbol.map_ks_wrap;
                params.texParams.specularMap = this._prepareTexture(
                    this._resolveURL(symbol.path, value),
                    null,
                    null,
                    symbol.map_ks_wrap,
                    symbol.map_ks_wrap);
                break;
            case 'ns':
                // The specular exponent (defines the focus of the specular highlight)
                // A high exponent results in a tight, concentrated highlight. Ns values normally range from 0 to 1000.
                params.shininess = parseFloat( value );
                break;
            case 'd':
                if ( value < 1 ) {
                    params.opacity = value;
                    params.transparent = true;
                }

                break;
            case 'Tr':
                if ( value > 0 ) {
                    params.opacity = 1 - value;
                    params.transparent = true;
                }

                break;
            case 'map_bump':
            case 'bump':
                // Bump texture map
                if ( params.bumpMap ) break; // Keep the first encountered texture

                //var texParams = this._getTextureParams( value, params );
                //params.bumpMap = this._loadTexture(this._resolveURL(symbol.path, texParams.url));
                //params.bumpMap.repeat.copy( texParams.scale );
                //params.bumpMap.offset.copy( texParams.offset );
                //params.bumpMap.wrapS = symbol.map_bump_wrap;
                //params.bumpMap.wrapT = symbol.map_bump_wrap;
                params.texParams.bumpMap = this._prepareTexture(
                    this._resolveURL(symbol.path, value),
                    texParams.scale,
                    texParams.offset,
                    symbol.map_bump_wrap,
                    symbol.map_bump_wrap);
                break;
            default:
                break;
        }
    }

    var style;

    if(renderType === "lambert"){
        style = new THREE.MeshLambertMaterial(params);
    }else if(renderType === "phong"){
        style = new THREE.MeshPhongMaterial(params);
    }else{
        style = new THREE.MeshBasicMaterial(params);
    }

    if(symbol.isLine){
        var materialLine = new THREE.LineBasicMaterial();
        materialLine.copy( style );
        style = materialLine;
    }

    for(var texKey in params.texParams){
        var tp = params.texParams[texKey];

        //this._loadTexture(tp.url, null, function(texture){
        //    tp.onLoad(texture);
        //    style[texKey] = texture;
        //    style.needsUpdate = true;
        //});
        Z.TileManager.pushImageByUrl(tp.url, function(img){
            var texture = new THREE.Texture();

            var isJPEG = tp.url.search( /\.(jpg|jpeg)$/ ) > 0 || tp.url.search( /^data\:image\/jpeg/ ) === 0;
            texture.format = isJPEG ? THREE.RGBFormat : THREE.RGBAFormat;

            texture.image = img;
            texture.needsUpdate = true;

            tp.onLoad(texture);
            style[texKey] = texture;
            style.needsUpdate = true;

            if(onTextureLoad && typeof onTextureLoad === "function"){
                onTextureLoad();
            }
        });
    }

    return style;
}

Z.StyleBuilder3D.createDefaultRenderStyle = function(type, options, renderType, onTextureLoad){
    var style = null;
    type = (type + "").toLowerCase();

    if(type === "fillsymbol" || type === "simplefillsymbol"){
        style = Z.StyleBuilder3D.createRenderStyle(new Z.SimpleFillSymbol(options), renderType, undefined, onTextureLoad);
    }else if(type === "picturefillsymbol"){
        style = Z.StyleBuilder3D.createRenderStyle(new Z.PictureFillSymbol(options), renderType, undefined, onTextureLoad);
    }else if(type === "linesymbol"){
        style = Z.StyleBuilder3D.createRenderStyle(new Z.PolylineSymbol(options), renderType, undefined, onTextureLoad);
    }

    return style;
}

Z.StyleBuilder3D._resolveURL = function ( baseUrl, url ) {
    if ( typeof url !== 'string' || url === '' )
        return '';

    // Absolute URL
    if ( /^https?:\/\//i.test( url ) ) {
        return url;
    }

    return baseUrl + url;
};

Z.StyleBuilder3D._getTextureParams = function( value, matParams ) {
    var texParams = {
        scale: new THREE.Vector2( 1, 1 ),
        offset: new THREE.Vector2( 0, 0 ),
    };

    var items = value.split(/\s+/);
    var pos;

    pos = items.indexOf('-bm');
    if (pos >= 0) {
        matParams.bumpScale = parseFloat( items[pos+1] );
        items.splice( pos, 2 );
    }

    pos = items.indexOf('-s');
    if (pos >= 0) {
        texParams.scale.set( parseFloat( items[pos+1] ), parseFloat( items[pos+2] ) );
        items.splice( pos, 4 ); // we expect 3 parameters here!
    }

    pos = items.indexOf('-o');
    if (pos >= 0) {
        texParams.offset.set( parseFloat( items[pos+1] ), parseFloat( items[pos+2] ) );
        items.splice( pos, 4 ); // we expect 3 parameters here!
    }

    texParams.url = items.join(' ').trim();
    return texParams;
};

Z.StyleBuilder3D._prepareTexture = function ( url, scale, offset, wrapS, wrapT ) {
    return {
        url: url,
        onLoad: function(texture){
            if(!isNaN(scale)){
                texture.repeat.copy(scale);
            }

            if(!isNaN(offset)){
                texture.offset.copy(offset);
            }

            texture.wrapS = wrapS;
            texture.wrapT = wrapT;
        }
    };
};

Z.StyleBuilder3D._loadTexture = function ( url, mapping, onLoad, onProgress, onError ) {
    var texture;
    var loader = THREE.Loader.Handlers.get( url );
    var manager = ( this.manager !== undefined ) ? this.manager : THREE.DefaultLoadingManager;

    if ( loader === null ) {
        loader = new THREE.TextureLoader( manager );
    }

    if ( loader.setCrossOrigin ) loader.setCrossOrigin( this.crossOrigin );
    texture = loader.load( url, onLoad, onProgress, onError );

    if ( mapping !== undefined ) texture.mapping = mapping;

    return texture;
}