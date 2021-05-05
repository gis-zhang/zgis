/**
 * Created by Administrator on 2015/12/2.
 */
Z.ModelSymbol = Z.Symbol.extend({
    initialize: function(options){
        Z.Symbol.prototype.initialize.call(this, options);
        this.ka = options.ka;         //环境光  [r, g, b, a]
        this.kd = options.kd;         //散射光  [r, g, b, a]
        this.ks = options.ks;         //镜面光  [r, g, b, a]
        this.ke = options.ke;         //放射光  [r, g, b, a]
        this.sharpness = options.sharpness;      //锐度 float
        this.illum = options.illum;               //亮度 float
        this.ni = options.ni;               //光密度 float
        //this.tf = options.tf;               //透射滤波  float
        this.d = options.d;               //透射滤波  float
        this.map_ka = options.map_ka;         //环境贴图   string
        this.map_kd = options.map_kd;         //散射贴图   string
        this.map_ks = options.map_ks;         //镜面贴图   string
        this.map_bump = options.map_bump || options.bump;         //**贴图   string
        this.refl = options.refl;           //反射率

        this.map_ka_wrap = options.map_ka_wrap || THREE.RepeatWrapping;
        this.map_kd_wrap = options.map_kd_wrap || THREE.RepeatWrapping;
        this.map_ks_wrap = options.map_ks_wrap || THREE.RepeatWrapping;
        this.map_bump_wrap = options.map_bump_wrap || THREE.RepeatWrapping;

        this.isLine = options.isLine || false;
        this.name = options.name || "";
        this.path = options.path || "";
    },

    equals: function(symbol){
        var result = false;

        if(symbol instanceof Z.ModelSymbol){
            result = Z.Symbol.prototype.equals.call(this, symbol);

            if(result){
                if(this.ka !== symbol.ka ||
                    this.kd !== symbol.kd ||
                    this.ks !== symbol.ks ||
                    this.ke !== symbol.ke ||
                    this.sharpness !== symbol.sharpness ||
                    this.illum !== symbol.illum ||
                    this.ni !== symbol.ni ||
                    this.d !== symbol.d ||
                    //this.map_ka !== symbol.map_ka ||
                    //this.map_kd !== symbol.map_kd ||
                    //this.map_ks !== symbol.map_ks ||
                    //this.map_bump !== symbol.map_bump ||
                    this.refl !== symbol.refl ||
                    //this.map_ka_wrap !== symbol.map_ka_wrap ||
                    //this.map_kd_wrap !== symbol.map_kd_wrap ||
                    //this.map_ks_wrap !== symbol.map_ks_wrap ||
                    //this.map_bump_wrap !== symbol.map_bump_wrap ||
                    this.isLine !== symbol.isLine //||
                    //this.name !== symbol.name ||
                    //this.path !== symbol.path
                ){
                    result = false;
                }
            }
        }

        return result;
    },

    clone: function(){
        return new Z.ModelSymbol(this);
    }
});