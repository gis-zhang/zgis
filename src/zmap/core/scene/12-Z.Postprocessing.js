/**
 * Created by Administrator on 2015/11/3.
 */
Z.Postprocessing = function(scene, camera, renderer, options){
    this._scene = scene;
    this._camera = camera;
    this._renderer = renderer;
    this._effectComposer;
    this._ssaoPass;
    this._smaaPass;
    // var postprocessing = { enabled: true, onlyAO: false, radius: 32, aoClamp: 0.25, lumInfluence: 0.7 };

    this.options = {
        smaa:{
            enable: true
        },
        ssao: {
            // enabled: true,
            onlyAO: false,
            radius: 32,
            aoClamp: 0.25,
            lumInfluence: 0.7
        }
    };

    options = options || {};
    Z.Util.applyOptions(this.options.ssao, options.ssao||{}, false);
    Z.Util.applyOptions(this.options.smaa, options.smaa||{}, false);
    this.initialize();
};

Z.Postprocessing.prototype = {
    initialize: function () {
        var renderPass = new THREE.RenderPass(this._scene, this._camera );
        // Setup SSAO pass
        this._ssaoPass = new THREE.SSAOPass(this._scene, this._camera );
        this._ssaoPass.renderToScreen = true;

        var renderSize = this._renderer.getSize();
        this._smaaPass = new THREE.SMAAPass( renderSize.width * this._renderer.getPixelRatio(), renderSize.height * this._renderer.getPixelRatio() );
        this._smaaPass.renderToScreen = true;
        // composer.addPass( pass );

        // Add pass to effect composer
        this._effectComposer = new THREE.EffectComposer( this._renderer );
        this._effectComposer.addPass( renderPass );
        this._effectComposer.addPass( this._smaaPass );
        this._effectComposer.addPass( this._ssaoPass );

    },

    render: function(){
        if(!this._effectComposer){
            return;
        }

        this._effectComposer.render();
    }
};