Z.SimpleInfoTemplate = Z.AbstractInfoTemplate.extend({
    //includes: Z.EventManager,

    initialize: function (options) {
        Z.AbstractInfoTemplate.prototype.initialize.call(this, options);
        this._content = null;
        this._title = null;

        this.options = {
            showTitle: true
        };

        Z.Util.applyOptions(this.options, options);
    },

    getTitle: function(){
        return this._title;
    },

    getContent: function(content){
        return this._content;
    },

    setTitle: function(title){
        this._title = title;
    },

    setContent: function(content){
        this._content = content;
    }//,

    //setBinding: function(binding){
    //    this._binding = binding || [];
    //
    //    if(!Array.isArray(this._binding)){
    //        this._binding = [this._binding];
    //    }
    //},

    //toHtml: function () {
    //    var html = "",
    //        title = this.getTitle(),
    //        content = this.getContent();
    //
    //    //if(title && this.options.showTitle){
    //    //    html += title + "<br/><hr/>";
    //    //}
    //
    //    html += content;
    //
    //    return html;
    //}
});