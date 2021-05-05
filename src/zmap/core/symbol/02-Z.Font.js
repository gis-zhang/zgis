/**
 * Created by Administrator on 2015/12/2.
 */
Z.Font = function(options){
    options = options || {};
    //this.decoration;
    this.family = options.family || Z.FontFamily.Helvetiker;         //字体名称
    this.size = options.size || '1em';           //字体大小
    this.style = options.style || Z.FontStyle.Normal;          //字体样式：normal, italics
    //this.variant;
    this.weight = options.weight || Z.FontWeight.Normal;        //normal, bold
};

Z.Font.prototype.equals = function(font){
    if(!(font instanceof Z.Font)){
        return false;
    }

    if(this.family !== font.family
        || this.size !== font.size
        || this.style !== font.style
        || this.weight !== font.weight){
        return false;
    }

    return true;
};

Z.Font.prototype.clone = function(){
    var font = new Z.Font();
    font.family = this.family;
    font.size = this.size;
    font.style = this.style;
    font.weight = this.weight;

    return font;
};