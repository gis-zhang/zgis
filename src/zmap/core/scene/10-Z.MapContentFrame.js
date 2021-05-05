/**
 * Created by Administrator on 2015/11/4.
 */
Z.MapContentFrame = function(container){
    this.basePane;
    this.layerPane;
    this.defaultGraphicPane;
    this.baseBgPane;
    this.baseOverPane;
    this.rootPane;
    this._container = container;
    this.initialize();
};

Z.MapContentFrame.prototype = {
    initialize: function () {
        this.rootPane = new Z.SceneThreePaneItem();
        this.basePane = new Z.SceneThreePaneItem();
        this.layerPane = new Z.SceneThreePaneItem();
        this.defaultGraphicPane = new Z.SceneThreePaneItem();
        this.baseBgPane = new Z.SceneThreePaneItem();
        this.baseOverPane = new Z.SceneThreePaneItem();

        this._initLayout();

    },

    _initLayout: function(){
        if(this._container){
            this.rootPane.root = this._container;
        }

        //所有的index均为全局绝对index，不支持层层嵌套的相对index计算
        this.rootPane.addChild(this.basePane, 1);
        //this.rootPane.addChild(this.layerPane, 4);
        this.rootPane.addChild(this.defaultGraphicPane, 5);

        this.basePane.addChild(this.baseBgPane, 2);
        this.basePane.addChild(this.baseOverPane, 3);
        this.basePane.addChild(this.layerPane, 4);
    }
}