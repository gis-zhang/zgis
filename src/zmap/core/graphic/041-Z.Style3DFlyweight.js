/**
 * Created by Administrator on 2015/12/2.
 */
Z.Style3DFlyweight = (function(){
    //var symbolsBuffer = {};
    //var defaultRenderType = "basic";
    //var styleBuilder;
    //
    //function getStyleBuilder(){
    //    if(!styleBuilder){
    //        styleBuilder = Z.StyleBuilder3D;
    //    }
    //
    //    return styleBuilder;
    //}
    var instanceObj = null;

    return {
        getInstance: function(){
            var context = null,
                instance = null;

            try{
                if(getCurrentMapContext){
                    context = getCurrentMapContext();
                }
            }catch(e){}

            if(context){
                instance = context.getSingleInstance("Style3DFlyweight");

                if(!instance){
                    context.registerSingleInstance("Style3DFlyweight", {
                        symbolsBuffer: {},
                        defaultRenderType: "basic",
                        styleBuilder: Z.StyleBuilder3D
                    });
                }

                instance = context.getSingleInstance("Style3DFlyweight");
            }else{
                if(!instanceObj){
                    instanceObj = {
                        symbolsBuffer: {},
                        defaultRenderType: "basic",
                        styleBuilder: Z.StyleBuilder3D
                    };
                }

                instance = instanceObj;
            }

            return instance;
        },

        getStyle: function(symbol, renderType, side, onTextureLoad){
            if(!(symbol instanceof Z.Symbol)){
                return null;
            }

            var instance = Z.Style3DFlyweight.getInstance();
            renderType = renderType || instance.defaultRenderType;

            if(!instance.symbolsBuffer[renderType]){
                instance.symbolsBuffer[renderType] = [];
            }

            var symbols = instance.symbolsBuffer[renderType],
                style = null,
                symbolCount = symbols.length;

            for(var i = 0; i < symbolCount; i++){

                //if(symbols[i].symbol.equals(symbol) && symbols[i].symbol.side === side){
                //    style = symbols[i].style;
                //    break;
                //}

                var curSymbolBuf = symbols[i];
                var curSymbol = curSymbolBuf.symbol;

                if(curSymbolBuf.side === side &&
                    (
                        curSymbol.equals(symbol)
                    )
                ){
                    style = curSymbolBuf.style;
                    break;
                }
            }

            if(!style){
                style = instance.styleBuilder.createRenderStyle(symbol, renderType, side, onTextureLoad);
                symbols.push({style: style, side: side, symbol: symbol.clone()});
            }

            return style;
        }
    }
})();