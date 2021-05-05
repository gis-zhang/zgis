/**
 * Created by Administrator on 2015/12/2.
 */
Z.GroupSymbol = Z.Class.extend({
    initialize: function(groups, symbols){
        //this.ka = options.ka;         //环境光  [r, g, b, a]
        //this.kd = options.kd;         //散射光  [r, g, b, a]
        //this.ks = options.ks;         //镜面光  [r, g, b, a]
        //this.ke = options.ke;         //放射光  [r, g, b, a]
        //this.sharpness = options.sharpness;      //锐度 float
        //this.illum = options.illum;               //亮度 float
        //this.ni = options.ni;               //光密度 float
        //this.tf = options.tf;               //透射滤波  float
        //this.mapKa = options.mapKa;         //环境贴图   string
        //this.mapKd = options.mapKd;         //散射贴图   string
        //this.mapKs = options.mapKs;         //镜面贴图   string
        //this.refl = options.refl;           //反射率
        this.groups = groups || [];   //[{start: 0, count: 1, symbolIndex: 0}]
        this.symbols = symbols || [];  //[symbol, symbol]
    },

    clone: function(){
        //return new Z.ModelSymbol(this);
        return new Z.GroupSymbol(this.groups, this.symbols);
    }
});