/**
 * Created by Administrator on 2015/10/23.
 */
module.exports = function(grunt) {
    grunt.file.defaultEncoding = 'utf-8';

    grunt.initConfig({
        concat: {
            dist: {
                src: ['src/zmap/framework/base/*.js',
                    'src/zmap/framework/*.js',
                    'src/zmap/config/**/*.js',
                    'src/zmap/core/config/*.js',
                    'src/zmap/core/geometry/*.js',
                    'src/zmap/core/feature/*.js',
                    'src/zmap/core/crs/*.js',
                    'src/zmap/core/interface/*.js',
                    'src/zmap/core/popup/*.js',
                    'src/zmap/core/symbol/*.js',
                    'src/zmap/core/graphic/*.js',
                    'src/zmap/core/layer/*.js',
                    'src/zmap/core/scene/*.js',
                    'src/zmap/core/*.js',
                    'src/zmap/component/**/*.js'],
                dest: 'dist/zmap-release.js'
            },
            //mapViewDist: {
            //    src: ['src/cdc/*.js'],
            //    dest: 'dist/mapview-release.js'
            //},
            threeLib: {
                src: ['src/lib/threejs_new2/three.js',
                    'src/lib/threejs/ConvexGeometry.js',
                    //'src/lib/threebsp/ThreeBSP.js',
                    'src/lib/threebsp/index.js',
                    'src/lib/threejs-ext/loaders/DDSLoader.js',
                    'src/lib/threejs-ext/loaders/MTLLoader.js',
                    'src/lib/threejs-ext/loaders/OBJLoader.js',
                    'src/lib/threejs-ext/shaders/SSAOShader.js',
                    'src/lib/threejs-ext/shaders/CopyShader.js',
                    'src/lib/threejs-ext/shaders/SMAAShader.js',
                    'src/lib/threejs-ext/postprocessing/EffectComposer.js',
                    'src/lib/threejs-ext/postprocessing/RenderPass.js',
                    'src/lib/threejs-ext/postprocessing/ShaderPass.js',
                    'src/lib/threejs-ext/postprocessing/MaskPass.js',
                    'src/lib/threejs-ext/postprocessing/SSAOPass.js',
                    'src/lib/threejs-ext/postprocessing/SMAAPass.js'],
                dest: 'dist/three-lib.js'
            },
            zmap_all_in_one: {
                src: [ 'src/lib/stats.min.js',
                    'dist/three-lib.js',
                    'src/lib/jszip/zip/jszip.min.js',
                    'src/lib/jszip/zipu/jszip-utils.js',
                    'dist/zmap-release.js'//,
                    //'dist/mapview-release.js'
                ],
                dest: 'dist/zmap_all_in_one.js'
            },
            css: {
                //src: ['src/zmap/css/*.css', 'src/cdc/css/*.css'],
                src: ['src/zmap/css/*.css'],
                dest: 'dist/zmap.css'
            }
        },
        uglify: {
            beautify: {
                //����ascii�����ǳ����ã���ֹ���������������
                ascii_only: true
            },
            //build: {
            //    src: 'dist/zmap-release.js',
            //    dest: 'dist/zmap-release.min.js'
            //}

            buildZMap: {
                src: 'dist/zmap-release.js',
                dest: 'dist/zmap-release.min.js'
            },

            //buildMapView: {
            //    src: 'dist/mapview-release.js',
            //    dest: 'dist/mapview-release.min.js'
            //},

            buildAllInOne: {
                src: 'dist/zmap_all_in_one.js',
                dest: 'dist/zmap_all_in_one.min.js'
            }
        },
        watch: {
            files: ['<%= concat.dist.src %>'],
            tasks: ['concat']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['concat', 'uglify']);
    //grunt.registerTask('default', ['concat']);
    grunt.registerTask('buildZMap', ['uglify:buildZMap']);
    //grunt.registerTask('buildMapView', ['uglify:buildMapView']);
};
