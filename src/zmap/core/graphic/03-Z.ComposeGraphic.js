/**
 * Created by Administrator on 2015/12/2.
 */
Z.ComposeGraphic = Z.Graphic.extend({
    initialize: function(feature, symbol, options){
        Z.Graphic.prototype.initialize.apply(this, arguments);
        this._members = [];
        this._membersShowing = false;
        this._selfShowing = true;
        this._membersRoot = null;
        this._graphicRoot = null;
        //this._scene = null;
        this._parent = null;
    },

    onAdd: function(graphicLayer, container, scene){
        if(!this._graphicRoot && container){
            this._graphicRoot = container.newInstance();
            container.addChild(this._graphicRoot);
        }

        Z.Graphic.prototype.onAdd.apply(this, [graphicLayer, this._graphicRoot, scene]);

        if(!this._membersRoot && this._mainElementRoot){
            this._membersRoot = this._mainElementRoot.newInstance();

            if(this._graphicRoot){
                this._graphicRoot.addChild(this._membersRoot);
            }
        }

        //this.show();
    },

    onRemove: function(graphicLayer){
        this.clearMembers();
        Z.Graphic.prototype.onRemove.apply(this, arguments);
    },

    updateFeature: function(feature){
        Z.Graphic.prototype.updateFeature.apply(this, arguments);
    },

    updateSymbol: function(symbol){
        Z.Graphic.prototype.updateSymbol.apply(this, arguments);
    },

    show: function(){
        if(this._selfShowing){
            this._showSelf();
        }else{
            this._hideSelf();
        }

        if(this._membersShowing) {
            this._showMembers();
        }else{
            this._hideMembers();
        }

        //if(this._scene){
        //    this._scene.refresh();
        //}
    },

    hide: function(){
        this.disableSelf();
        this.disableMembers();

        //if(this._scene){
        //    this._scene.refresh();
        //}
    },

    enableMembers: function(){
        if(this._membersShowing){
            return;
        }

        this._showMembers();
        this._membersShowing = true;
    },

    disableMembers: function(){
        if(!this._membersShowing){
            return;
        }

        this._hideMembers();
        this._membersShowing = false;
    },

    enableSelf: function(){
        if(this._selfShowing){
            return;
        }

        this._showSelf();
        this._selfShowing = true;
        //this._scene.refresh();
    },

    disableSelf: function(){
        if(!this._selfShowing){
            return;
        }

        this._hideSelf();
        this._selfShowing = false;
        //this._scene.refresh();
    },

    addMember: function(graphic){
        if(!graphic){
            return;
        }

        var graphics = (graphic instanceof Array) ? graphic : [graphic];

        for(var i = 0; i < graphics.length; i++){
            if(graphics[i] instanceof Z.Graphic){
                this._members.push(graphics[i]);
                graphics[i]._parent = this;

                if(this._membersShowing){
                    //graphics[i].onAdd(this._layer, this._container, this._scene);
                    this._addOneGraphic(graphics[i]);
                }
            }
        }
    },

    removeMember: function(graphic){
        if(!graphic){
            return;
        }

        var graphics = (graphic instanceof Array) ? graphic : [graphic];

        for(var i = 0; i < graphics.length; i++){
            for(var j = this._members.length - 1; j >= 0; j--){
                this._removeOneMember(this._members[j], j);
            }
        }

    },

    clearMembers: function(){
        //this._members = [];
        for(var i = this._members.length - 1; i >= 0; i--){
            this._removeOneMember(this._members[i], i);
        }
    },

    getAllMembers: function(){
        return this._members;
    },

    _hideSelf: function(){
        //this._mainElementRoot.hide();
        Z.Graphic.prototype.hide.apply(this);
    },

    _showSelf: function(){
        //this._mainElementRoot.show();
        Z.Graphic.prototype.show.apply(this);
    },

    _hideMembers: function(){
        for(var i = 0; i < this._members.length; i++){
            this._removeOneGraphic(this._members[i]);
            //this._members[i].hide();
        }
    },

    _showMembers: function(){
        for(var i = 0; i < this._members.length; i++){
            this._addOneGraphic(this._members[i]);
            this._members[i].show();
        }
    },

    _removeOneMember: function(member, memberIndex){
        if(member instanceof Z.Graphic){
            if(this._membersShowing){
                this._removeOneGraphic(this._members[i]);
            }

            member._parent = null;
            this._members.splice(memberIndex, 1);
        }
    },

    _addOneGraphic: function(graphic){
        this._layer.addGraphic(graphic);

        if(graphic._container === this._membersRoot){
            return;
        }

        if(graphic._graphicRoot){      //ComposeGraphic
            graphic._container.removeChild(graphic._graphicRoot);
            this._membersRoot.addChild(graphic._graphicRoot);
        }else{                           //Graphic
            graphic._container.removeChild(graphic._mainElementRoot);
            this._membersRoot.addChild(graphic._mainElementRoot);
        }

        graphic._container = this._membersRoot;
    },

    _removeOneGraphic: function(graphic){
        this._layer.removeGraphic(graphic);
    }
});