var viewer = new Cesium.Viewer('map3d', {
    geocoder: false,
    homeButton: false,
    sceneModePicker: false,
    baseLayerPicker: false,
    navigationHelpButton: true,
    animation: false,
    timeline: false,
    fullscreenButton: false,
    vrButton: false
});
viewer.scene.debugShowFramesPerSecond = true;

// viewer.extend(Cesium.viewerCesium3DTilesInspectorMixin);

// 地图底图
function setBaseMap(url, credit, subdomains, replace) {
    var mapProvider = new Cesium.UrlTemplateImageryProvider({
        url: url,
        //credit: credit,
        subdomains: subdomains
    });
    var mapLayer = new Cesium.ImageryLayer(mapProvider, Cesium.defaultValue(true, {}));
    if (replace) viewer.scene.imageryLayers.removeAll(false);
    viewer.scene.imageryLayers.add(mapLayer);
}

// google 有偏移
// setBaseMap('http://www.google.cn/maps/vt?lyrs=s&gl=cn&x={x}&y={y}&z={z}', 'Google Map', ["mt0", "mt1", "mt2", "mt3"], true);
// google 无偏移
setBaseMap('http://www.google.cn/maps/vt?lyrs=s&x={x}&y={y}&z={z}', 'Google Map', ["mt0", "mt1", "mt2", "mt3"], true);
// scgis 卫星图
//setBaseMap('/scgis/satelite?level={z}&col={x}&row={y}', 'scgis', ["mt0", "mt1", "mt2", "mt3"], true);
// 天地图
// setBaseMap('http://{s}.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&L={z}', 'tianditu', ["t1", "t2", "t3", "t4"], true);
// setBaseMap('http://{s}.tianditu.com/DataServer?T=cva_w&X={x}&Y={y}&L={z}', 'tianditu', ["t1", "t2", "t3", "t4"], false);
// 天地图卫星图
// setBaseMap('http://{s}.tianditu.cn/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={z}&TileRow={y}&TileCol={x}&style=default&format=tiles', 'tianditu', ["t1", "t2", "t3", "t4"], true);
// setBaseMap('http://{s}.tianditu.com/DataServer?T=cva_w&X={x}&Y={y}&L={z}', 'tianditu', ["t1", "t2", "t3", "t4"], false);

// 模型的中心点坐标
var longitude = 118.92363523296339;
var latitude = 32.11622044873156;
// 高度校准（需手动调节）
var height = -20;//2.5076627764545864e-9;
var heading = 0;
// 加载 3d-tiles 模型资源到场景中
var tileset = new Cesium.Cesium3DTileset({
    url: '/test-3dtiles/tiles/3D_Tiles/tileset.json'
});
var add = viewer.scene.primitives.add(tileset);

tileset.readyPromise.then(function (argument) {
    // 校准模型位置、高度、旋转角
    var position = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
    var mat = Cesium.Transforms.eastNorthUpToFixedFrame(position);
    var rotationX = Cesium.Matrix4.fromRotationTranslation(Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(heading)));
    Cesium.Matrix4.multiply(mat, rotationX, mat);
    tileset._root.transform = mat;
    //
    viewer.camera.flyTo({destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height + 1000)});

    tileset.style = new Cesium.Cesium3DTileStyle({
        "color":{
            "conditions":[
                ["${Height} >=20 ","color(blue)"],
                ["${Height} >=15 ", "color(green)"],
                ["${Height} >=10 ", "color(yellow)"],
                ["${Height} >=5 ", "color(red)"],
                ["true",'color(white)']
            ]
        },
        "meta":{

        }
    });
}).otherwise(function (error) {
    console.error(error);
});


// 添加图标
function addIcons() {
    // 坐标 + 高度偏移（标注在模型“上空”）
    var pos = Cesium.Cartesian3.fromDegrees(longitude + 0.00045, latitude, 22);
    viewer.entities.add({
        id: 'icon-12345',
        devType:'video',
        position: pos,
        // 图标
        billboard: {
            image: '/test-3dtiles/tiles/images/icon_dl.png'
        },
        // 文字标签
        label: {
            pixelOffset: new Cesium.Cartesian2(0, 30),
            fillColor: Cesium.Color.WHITE,
            outlineColor: new Cesium.Color.fromCssColorString('#191970'),
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            font: '24px Helvetica',
            text: '这是宿舍，还是教学楼？'
        }
    });
    var temp1 = {x: -2615155.20888409, y: 4732744.209971609, z: 3371365.5146097}

    var temp2 = {x: -2615216.6652877424, y: 4732711.448006832, z: 3371374.7258281666}

    viewer.entities.add({
        id: 'icon-123245',
        devType:'video',
        position: temp1,
        // position: new Cesium.Cartesian3(temp1.x, temp1.y, temp1.z),
        // 图标
        billboard: {
            image: '/test-3dtiles/tiles/images/icon_dl.png'
        },
        // 文字标签
        label: {
            pixelOffset: new Cesium.Cartesian2(0, 30),
            fillColor: Cesium.Color.WHITE,
            outlineColor: new Cesium.Color.fromCssColorString('#191970'),
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            font: '24px Helvetica',
            text: '这是宿舍，还是教学楼？'
        }
    });
}

addIcons();

var handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

handler.setInputAction(function (event) {
    // We use `viewer.scene.pickPosition` here instead of `viewer.camera.pickEllipsoid` so that
    // we get the correct point when mousing over terrain.
    // console.log(event.position);
    var earthPosition = viewer.scene.pickPosition(event.position);

    console.log( viewer.scene.pick(event.position))
    // console.log( viewer.scene.camera.pick(event.position))
    console.log( viewer.scene.drillPick(event.position))

    console.log( Cesium.Cartographic.fromCartesian(earthPosition))
    // `earthPosition` will be undefined if our mouse is not over the globe.
    // console.log(earthPosition)
    // if (Cesium.defined(earthPosition)) {
    //     if (activeShapePoints.length === 0) {
    //         floatingPoint = createPoint(earthPosition);
    //         firstPoint = floatingPoint;
    //         activeShapePoints.push(earthPosition);
    //         var dynamicPositions = new Cesium.CallbackProperty(function () {
    //             return activeShapePoints;
    //         }, false);
    //         activeShape = drawShape(dynamicPositions);
    //     }
    //     activeShapePoints.push(earthPosition);
    //     createPoint(earthPosition);
    // }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

var highlighted = {
    feature : undefined,
    originalColor : new Cesium.Color()
};
// Color a feature yellow on hover.
// viewer.screenSpaceEventHandler.setInputAction(function onMouseMove(movement) {
//     // If a feature was previously highlighted, undo the highlight
//     if (Cesium.defined(highlighted.feature)) {
//         highlighted.feature.color = highlighted.originalColor;
//         highlighted.feature = undefined;
//     }
//     // Pick a new feature
//     var pickedFeature = viewer.scene.pick(movement.endPosition);
//     if (!Cesium.defined(pickedFeature)) {
//         // nameOverlay.style.display = 'none';
//         return;
//     }
//     console.log(pickedFeature)
//     // A feature was picked, so show it's overlay content
//     // nameOverlay.style.display = 'block';
//     // nameOverlay.style.bottom = viewer.canvas.clientHeight - movement.endPosition.y + 'px';
//     // nameOverlay.style.left = movement.endPosition.x + 'px';
//     var name = pickedFeature.getProperty('name');
//     if (!Cesium.defined(name)) {
//         name = pickedFeature.getProperty('id');
//     }
//     // nameOverlay.textContent = name;
//     // Highlight the feature if it's not already selected.
//     if (pickedFeature !== selected.feature) {
//         highlighted.feature = pickedFeature;
//         Cesium.Color.clone(pickedFeature.color, highlighted.originalColor);
//         pickedFeature.color = Cesium.Color.YELLOW;
//     }
// }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);



// handler.setInputAction(function(movement) {
//     var feature = viewer.cesium3DTilesInspector.viewModel.feature;
//     if (Cesium.defined(feature)) {
//         feature.show = false;
//     }
// }, Cesium.ScreenSpaceEventType.MIDDLE_CLICK);

// var value=[temp1,temp2];
// viewer.entities.add({
//     position: value[0],
//     // position: Cesium.Cartesian3.fromDegrees(activeShapePoints[0].x,
//     //     activeShapePoints[0].y),
//     // position: Cesium.Cartesian3.fromDegrees(-122.2058, 46.1955, 1000.0),
//     name: 'Blue translucent, rotated, and extruded ellipse with outline',
//     type:'Selection tool',
//     ellipse: {
//         semiMinorAxis: new Cesium.CallbackProperty(function () {
//             // let value = positionData.getValue(0);
//             var r = Math.sqrt(Math.pow(value[0].x - value[value.length - 1].x, 2) + Math.pow(value[0].y - value[value.length - 1].y, 2));
//             return r ? r : r + 1;
//         }, false),
//         semiMajorAxis: new Cesium.CallbackProperty(function () {
//             var r = Math.sqrt(Math.pow(value[0].x - value[value.length - 1].x, 2) + Math.pow(value[0].y - value[value.length - 1].y, 2));
//             return r ? r : r + 1;
//         }, false),
//         // heightReference: add,
//         // extrudedHeight:10,
//         extrudedHeightReference:viewer,
//         fill:false,
//         // semiMinorAxis:250000.0,
//         // semiMajorAxis:400000.0,
//         // extrudedHeight : 200000.0,
//         // rotation: Cesium.Math.toRadians(45),
// //                 material: Cesium.Color.BLUE.withAlpha(0.5),
//         outline: true
//     }
// });

function logging(html) {
    document.getElementById('logging').innerHTML = html;
}

(function f() {

    new ChoiceHelper({
        viewer: viewer,
        toolbar:{
            container: document.getElementById("toolbar"),
            buttons:['marker','polygon', 'circle', 'extent','clear']
        },
        callbacks:{
            choice:[{
                filter: function (entity) {
                    return entity.devType === "video";
                },
                onChoice: function (entities) {
                    logging("<p>select " + entities.length + " entities, details see devTool(f12)</p>")
                    console.log(entities);
                }
            }],
            marker: function (position) {
                viewer.entities.add({
                    devType:'video',
                    position: formatHetightPlusNumber(position,0.5) ,
                    // position: new Cesium.Cartesian3(temp1.x, temp1.y, temp1.z),
                    // 图标
                    billboard: {
                        image: '/test-3dtiles/tiles/images/icon_dl.png'
                    },
                    // 文字标签
                    label: {
                        pixelOffset: new Cesium.Cartesian2(0, 30),
                        fillColor: Cesium.Color.WHITE,
                        outlineColor: new Cesium.Color.fromCssColorString('#191970'),
                        outlineWidth: 2,
                        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                        font: '24px Helvetica',
                        text: '这是宿舍，还是教学楼？'
                    }
                })
            }
        }
    })

}());


function formatHetightPlusNumber( position , heightPlus) {
    var fromCartesian = Cesium.Cartographic.fromCartesian(position);
    return Cesium.Cartesian3.fromRadians(fromCartesian.longitude, fromCartesian.latitude, fromCartesian.height + heightPlus);
}
