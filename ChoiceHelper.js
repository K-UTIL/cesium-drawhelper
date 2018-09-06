(function webpackUniversalModuleDefinition(root, factory) {
    if (typeof exports === 'object' && typeof module === 'object')
        module.exports = factory(require('Cesium'), require('DrawHelper'));
    else if (typeof define === 'function' && define.amd)
        define(['Cesium', 'DrawHelper'], factory);
    else {
        root.ChoiceHelper = factory(root.Cesium, root.DrawHelper);
    }
}(window, function (Cesium, DrawHelper) {

    /**
     * @param {Object} config
     * @param {Object} config.viewer - Cesium.viewer对象
     * @param {Object} config.toolbar - toolbar,为空则不创建
     * @param {Element} config.toolbar.container - toolbar所在容器
     * @param {string[]} config.toolbar.buttons - 包括 'polygon', 'circle', 'extent' 代表多边形、圆形、矩形
     * @param {Array} config.callbacks - 选择回调，可配置多种选择回调
     * @param {function(Cesium.Entity):boolean} config.callbacks.choice[].filter - 过滤器，即选择器,确认为需要选择的对象，返回ture
     * @param {function(Cesium.Entity[])} config.callbacks.choice[].onChoice - 选择回调
     * @param {function(Cesium.Cartesian3)} config.callbacks.marker - marker创建回调
     * {
     *     viewer: viewer对象,
     *     toolbar:{
     *         container: toolbar所在容器,
     *         buttons: []//
     *     },
     *     callbacks:{
     *          choice:[{
     *             filter: function
     *             onChoice: function
     *         }],
     *         marker: function
     *     }
     * }
     * @constructor
     */
    function ChoiceHelper(config) {
        this._cesiumViewer = config.viewer;
        this._util = new Util(this._cesiumViewer);

        this._scene = this._cesiumViewer.scene;
        this._drawHelper = new DrawHelper(this._cesiumViewer);
        this._option = config;


        this._primitives = [];
        var me = this;

        if (Cesium.defined(config.toolbar)) {
            this._toolbarContainer = config.toolbar.container;
            this._toolbar = this._drawHelper.addToolbar(this._toolbarContainer, {
                buttons: config.toolbar.buttons,
                clickCallback: function (event) {
                    //移除之前绘制的

                    me._util.getWithDefault(me._primitives, []).forEach(function (element, index) {
                        me._scene.primitives.remove(element);
                    })
                },
                //点位选取策略配置
                pickStrategy:function (position, viewer) {
                    if (Cesium.defined(viewer.scene.pick(position))) {
                        return viewer.scene.pickPosition(position);
                        // var fromCartesian = Cesium.Cartographic.fromCartesian(viewer.scene.pickPosition(position));
                        // return Cesium.Cartesian3.fromRadians(fromCartesian.longitude, fromCartesian.latitude, 0);
                    } else {
                        var fromCartesian = Cesium.Cartographic.fromCartesian(viewer.scene.camera.pickEllipsoid(position));
                        return Cesium.Cartesian3.fromRadians(fromCartesian.longitude, fromCartesian.latitude, 0);
                    }
                }
            })
        }
        this._eventInit();
    }

    ChoiceHelper.prototype._optionReload = function () {

    }

    ChoiceHelper.prototype._eventInit = function () {
        var me = this;
        me._toolbar.addListener('polygonCreated', function (event) {
            var polygon = new DrawHelper.PolygonPrimitive({
                positions: event.positions,
                material: Cesium.Material.fromType('Checkerboard')
            });

            console.log(event)
            var LatLngPaths = [];

            me._util.getWithDefault(event.positions, []).forEach(function (position, index) {
                LatLngPaths.push(me._util.Cartesian3ToLatLng(position));
            });


            me._filterExecuter(function (entities) {
                var parseEntities = [];
                me._util.getWithDefault(entities, []).forEach(function (entity, index) {
                    var latlng = Cesium.Cartographic.fromCartesian(entity.position.getValue(0));
                    if(me._util.isInPolygon(latlng,LatLngPaths)){
                        parseEntities.push(entity);
                    }
                });
                return parseEntities;
            })


        });
        // circle.center :  Cartesian3
        // circle.ellipsoid._maximumRadius : number
        // circle.ellipsoid._minimumRadius : number
        me._toolbar.addListener('circleCreated', function (event) {

            // var r = event.radius
            me._filterExecuter(function (entities) {
                var parseEntities = [];

                me._util.getWithDefault(entities, []).forEach(function (entity, index) {
                    var latlng = Cesium.Cartographic.fromCartesian(entity.position.getValue(0));
                    var groundPosition = Cesium.Cartesian3.fromRadians(latlng.longitude, latlng.latitude, 0.0);
                    if (Cesium.Cartesian3.distance(me._util.getCesiumHightZero( event.center) , groundPosition) <= event.radius) {
                        parseEntities.push(entity);
                    }
                })

                return parseEntities;
            });
        });

        //Cesium.Rectangle.subsample(e.extent)
        me._toolbar.addListener('extentCreated', function (e) {
            var extent = e.extent;

            me._filterExecuter(function (entities) {
                var parseEntities = [];

                me._util.getWithDefault(entities, []).forEach(function (entity, index) {
                    var cartesian3ToLatLng = me._util.Cartesian3ToLatLng(entity.position.getValue(0));
                    if (extent.west <= cartesian3ToLatLng.longitude && extent.east >= cartesian3ToLatLng.longitude
                        && extent.south <= cartesian3ToLatLng.latitude && extent.north >= cartesian3ToLatLng.latitude) {
                        parseEntities.push(entity);
                    }
                })

                return parseEntities;
            });
        });

        me._toolbar.addListener('markerCreated', function (event) {
            me._option.callbacks.marker(event.position);
            // loggingMessage('Marker created at ' + event.position.toString());
            // create one common billboard collection for all billboards
            // var b = new Cesium.BillboardCollection();
            // viewer.scene.primitives.add(b);
            // var billboard = b.add({
            //     show : true,
            //     position : event.position,
            //     pixelOffset : new Cesium.Cartesian2(0, 0),
            //     eyeOffset : new Cesium.Cartesian3(0.0, 0.0, 0.0),
            //     horizontalOrigin : Cesium.HorizontalOrigin.CENTER,
            //     verticalOrigin : Cesium.VerticalOrigin.CENTER,
            //     scale : 1.0,
            //     image: './img/glyphicons_242_google_maps.png',
            //     color : new Cesium.Color(1.0, 1.0, 1.0, 1.0)
            // });
            // billboard.setEditable();
        });
    }


    ChoiceHelper.prototype.setOption = function (option) {

    }

    ChoiceHelper.prototype._callBack = function () {

    }

    ChoiceHelper.prototype._filterExecuter = function (containsCallback) {
        var me = this;
        //选出在圈内的entities
        var containEntities = containsCallback(me._cesiumViewer.entities.values);

        me._util.getWithDefault(me._option.callbacks.choice, []).forEach(function (callback, index) {
            var entities = [];
            //过滤出需要的entity
            me._util.getWithDefault(containEntities, []).forEach(function (entity, index2) {
                if (callback.filter(entity)) entities.push(entity);
            })
            //callback
            callback.onChoice(entities);
        })

    };


    function Util(viewer) {
        this._viewer = viewer;
        this._ellipsoid = this._viewer.scene.globe._ellipsoid;
    }

    /**
     * 将Cartesian3转为经纬度
     * @param cartesian3
     * @returns {{height:number,latitude:number,longitude:number}}
     */
    Util.prototype.Cartesian3ToLatLng = function (cartesian3) {
        // return  Cesium.Cartographic.fromCartesian(cartesian3);
        return this._ellipsoid.cartesianToCartographic(cartesian3);
    }

    Util.prototype.getWithDefault = function (element, defaultElement) {
        return element ? element : defaultElement;
    }

    /**
     * 获取当前点位的近地点位
     * @param {Cesium.Cartesian3} cartesian3
     * @return {Cesium.Cartesian3}
     */
    Util.prototype.getCesiumHightZero = function(cartesian3){
        var fromCartesian = Cesium.Cartographic.fromCartesian(cartesian3);
        return Cesium.Cartesian3.fromRadians(fromCartesian.longitude, fromCartesian.latitude, 0);
    }

    /**
     *
     * @param position
     * @param paths
     */
    Util.prototype.isInPolygon = function (position, paths) {
        var x = position.longitude;
        var y = position.latitude;

        var isum, icount, index = 0;
        var dLon1 = 0, dLon2 = 0, dLat1 = 0, dLat2 = 0, dLon;

        if (paths.size < 3) {
            return false;
        }

        isum = 0;
        icount = paths.length;

        for (index = 0; index < icount - 1; index++) {
            if (index === icount - 1) {
                dLon1 = paths[index].longitude;
                dLat1 = paths[index].latitude;
                dLon2 = paths[0].longitude;
                dLat2 = paths[0].latitude;
            }
            else {
                dLon1 = paths[index].longitude;
                dLat1 = paths[index].latitude;
                dLon2 = paths[index + 1].longitude;
                dLat2 = paths[index + 1].latitude;
            }

            if (((y >= dLat1) && (y < dLat2)) || ((y >= dLat2) && (y < dLat1))) {
                if (Math.abs(dLat1 - dLat2) > 0) {
                    dLon = dLon1 - ((dLon1 - dLon2) * (dLat1 - y)) / (dLat1 - dLat2);
                    if (dLon < x)
                        isum++;
                }
            }
        }

        return (isum % 2) !== 0;
    }

    return ChoiceHelper;
}));