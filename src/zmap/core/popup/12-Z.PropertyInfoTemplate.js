Z.PropertyInfoTemplate = Z.SimpleInfoTemplate.extend({
    initialize: function (props, options) {
        Z.SimpleInfoTemplate.prototype.initialize.call(this, options);
        this._props = props;
        this._propConfig = {};

        this.options = Z.Util.applyOptions(this.options, {
            propertyMapping: []    //{name: '', title: '', func: function(prop, value){}}
        }, true);

        Z.Util.applyOptions(this.options, options);

        this._configProps();
    },

    getContent: function(content){
        return this._propsToHtml(this._props);
    },

    _configProps: function(){
        var pMapping = this.options.propertyMapping;

        if(pMapping && pMapping.length > 0){
            for(var i = 0; i < pMapping.length; i++){
                this._propConfig[pMapping[i].name] = pMapping[i];
            }
        }else{
            for(var p in this._props){
                this._propConfig[p] = {name: p, title: p};
            }
        }
    },

    _propsToHtml: function(props){
        props = props || {};
        var content = "",
            propContent = "",
            title = this.getTitle();

        for(var p in props){
            if(!this._showProp(p)){
                continue;
            }

            if(propContent.length > 0){
                propContent += "<br/>";
            }

            propContent += "<label>" + this._getPropLabel(p) + ": </label>" + "<label>" + this._getPropValue(p, props[p]) + "</label>"
        }

        content += propContent;
        return content;
    },

    _showProp: function(propName){
        return this._propConfig[propName] ? true : false;
    },

    _getPropLabel: function(propName){
        var config = this._propConfig[propName];

        if(config && config.title){
            return config.title;
        }else{
            return propName;
        }
    },

    _getPropValue: function(propName, propValue){
        var config = this._propConfig[propName];

        if(config && config.func){
            return config.func(propName, propValue);
        }else{
            return propValue;
        }
    }
});