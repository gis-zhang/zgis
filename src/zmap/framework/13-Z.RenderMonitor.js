/**
 * 在屏幕左上角显示当前渲染帧率
 */
Z.RenderMonitor = (function () {
    var stats = null;
    var appended = false;

    return {
        update: function(){
            if(!appended){
                stats = new Stats();
                stats.domElement.style.position = 'absolute';
                stats.domElement.style.top = '0px';
                stats.domElement.style.right = '0px';
                document.body.appendChild( stats.domElement );
                appended = true;
            }

            stats.update();
        }
    }
})();


