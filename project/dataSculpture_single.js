
// PARAMETERS

var dataIn = [0.385,
    0.440,
    0.488,
    0.357,
    0.374,
    0.511,
    0.404,
    0.250,
    0.523,
    0.485,
    0.640,
    0.559];


///// GUI CONTROLS ///////////////////////////

var guiControls = new function () {

    this.thickness = 6;
    this.maxRadius = 20;
    this.minRadius = 5;

};

var datGUI = new dat.GUI();

datGUI.add(guiControls, 'thickness', 1, 10).name('Height')

/////////////////////////////////////////////

////////////////////////////////////
var maxRadius = guiControls.maxRadius;
var minRadius = guiControls.minRadius;
var dataLowerLimit = 0.25;
var dataUpperLimit = 0.64;
///////////////////////////////////
var dataOut = [];
var dataSum = 0;
var dataMean = 0;


//Maps data value to predefined upper and lower bounds
function mapping() {

    for (var i = 0; i < dataIn.length; i++) {
        dataOut.push(dataIn[i] * ((maxRadius - minRadius) / (dataUpperLimit - dataLowerLimit)) + minRadius);
        dataSum += dataOut[i];
    }

    dataMean = dataSum/dataIn.length;
}

mapping();

// PREPARE THE SCENE

// Scene
var scene = new THREE.Scene();
// Camera
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
//camera.position.z = 80;
//camera.position.y = 60;

camera.position.y = 50;
camera.position.z = 100;

// Renderer
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth/1.5, window.innerHeight/1.5 );
renderer.setClearColor( 0xEFEFEF );
document.body.appendChild( renderer.domElement );

// Grid Helper
var size = 30;
var step = 20;

var gridHelper = new THREE.GridHelper( size, step );
scene.add( gridHelper );

//////////////////////////////////////////////////



// DRAW THE MODEL

// Stacked Cylinders /////////////////////
var material = new THREE.MeshPhongMaterial( {color: 0xffffff} );
var cylinderMesh = [];
var cylinderConv = [];
var rectMeshShow = [];
var result = [];
var model;


for (var i=0; i<dataOut.length; i++)
{
    cylinderGeo = new THREE.CylinderGeometry(dataOut[i], dataOut[i], 1, 64, 1, false, 0, 2*Math.PI );
    cylinderMesh[i] = new THREE.Mesh(cylinderGeo,material);
    cylinderConv[i] = new ThreeBSP(cylinderMesh[i]);

    ////////////
    var rectGeo = new THREE.BoxGeometry(Math.max.apply(Math, dataOut)*2, 1, 5);
    var rectMesh = new THREE.Mesh(rectGeo, material);
    var rectConv = new ThreeBSP(rectMesh);
    ////////////

    // Boolean operation ///////////////
    var subtracted = cylinderConv[i].subtract(rectConv);
    result[i] = subtracted.toMesh(material);
    //result[i].position.setY(i*2);

    // Add the result to scene
    scene.add(result[i]);
    ////////////////////////

    // Wireframe on the Mesh
    var helper = new THREE.EdgesHelper(result[i], 0xffffff ); // or THREE.WireframeHelper
    helper.material.linewidth = 1;
    scene.add(helper);
    /////////////////////////

    rectGeoShow = new THREE.BoxGeometry(dataMean*2, 1, 5);
    rectMeshShow[i] = new THREE.Mesh(rectGeoShow, new THREE.MeshPhongMaterial( {color: 0xffffff} ));
    //rectMeshShow.scale.setY(guiControls.thickness*2);
    //rectMeshShow.position.setY(guiControls.thickness*2);

    scene.add(rectMeshShow[i]);

}

////////////////////////////////////////////

// Light
var hemisphereLight = new THREE.HemisphereLight(0xffffff,0x000000,1);
hemisphereLight.position.set(1, 0, 1).normalize();
scene.add(hemisphereLight);

// Trackball Controls
controlCamera = new THREE.TrackballControls(camera, renderer.domElement);
controlLight = new THREE.TrackballControls(hemisphereLight, renderer.domElement);

controlCamera.maxDistance = 200;
controlCamera.minDistance = 10;

controlLight.maxDistance = 200;
controlLight.minDistance = 10;

controlCamera.zoomSpeed = 0.05;
controlLight.zoomSpeed = 0.05;



// RENDER THE SCENE

function render() {

    for (var i=0; i<dataOut.length; i++)
    {

        gridHelper.position.setY(-guiControls.thickness/2);
        result[i].scale.setY(guiControls.thickness);
        result[i].position.setY(i*guiControls.thickness);
        rectMeshShow[i].scale.setY(guiControls.thickness);
        rectMeshShow[i].position.setY(i*guiControls.thickness);

    }

    controlCamera.update();
    controlLight.update();
    animationFrame = requestAnimationFrame(render);
    renderer.render(scene, camera);
}

render();

function saveSTL(scene, name){
    var exporter = new THREE.STLExporter();
    var stlString = exporter.parse( scene );

    var blob = new Blob([stlString], {type: 'application/octet-stream'});

    saveAs(blob, name + '.stl');
}


var myBtn = document.getElementById('save-btn');
myBtn.addEventListener("click", function(){saveSTL(scene,'dataSculpture')});