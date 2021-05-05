/**
 * Created by Administrator on 2015/11/4.
 */
Z.SceneViewFrame = function(container){
    this.controlPane;
    this.popupPane;
    this.labelPane;
    this.tipPane;
    this.mapPane;
    this.rootPane;
    this._container = container;
    this.initialize();
};

Z.SceneViewFrame.prototype = {
    initialize: function () {
        this.rootPane = new Z.SceneDivPaneItem();
        this.controlPane = new Z.SceneDivPaneItem();
        this.popupPane = new Z.SceneDivPaneItem();
        this.labelPane = new Z.SceneDivPaneItem();
        this.tipPane = new Z.SceneDivPaneItem();
        this.mapPane = new Z.SceneDivPaneItem();

        this._initLayout();
        this._applyResizeEvent('on');
    },

    resize: function(){
        this._resize();
    },

    _initLayout: function(){
        if(!this._container){
            return;
        }

        this._resize();

        this.rootPane.root = this._container;
        this.rootPane.addChild(this.mapPane, 0);
        this.rootPane.addChild(this.labelPane, 1);
        this.rootPane.addChild(this.tipPane, 2);
        this.rootPane.addChild(this.popupPane, 3);
        this.rootPane.addChild(this.controlPane, 4);
    },

    _applyResizeEvent: function(onOff){
        if(!this._container){
            return;
        }

        onOff = onOff || 'on';
        var thisObj = this;
        Z.DomEvent.addListener(this._container, 'resize', function(){
            thisObj._resize();
        }, this);
    },

    _resize: function(){
        var width = this._container.clientWidth,
            height = this._container.clientHeight;
        this._setPanelSize(this.mapPane, width, height);
        this._setPanelSize(this.labelPane, width, height);
        //this._setPanelSize(this.tipPane, width, height);
        //this._setPanelSize(this.popupPane, width, height);
        //this._setPanelSize(this.controlPane, width, height);
    },

    _setPanelSize: function(panel, width, height){
        panel.root.style.width = width + 'px';
        panel.root.style.height = height + 'px';
    }
}