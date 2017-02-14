function new3D(data) {

    //Input check
    var valid = true;

    if(String(data[0][0]).toLowerCase() == 'auto' && String(data[0][0]).toLowerCase() == 'manual' && String(data[0][0]).toLowerCase() == '%')
    {
        valid = false;
        alert('Wrong identifier! Use "auto", "manual" or "%"');
    }

    for(var a=0; a<data.length; a++)
    {
        if(data[0].length != data[a].length)
        {
            alert('Data size does not match with the attribute size');
            valid = false;
            break;
        }
        if(data[0].length > 5)
        {
            alert('Number of data set is more than 4');
            valid = false;
            break;
        }
    }

    //////////////////////////////////////////////

    ///// GUI CONTROLS ///////////////////////////

    if(valid)
    {
        // DOM Initializations
        document.getElementById('clear').disabled = false;
        document.getElementById('file3D').disabled = true;
        document.getElementById('save-btn').disabled = false;

        // Parsing parameters
        var names = [];
        var attributes = [];
        var dataIn = [];
        var dataLowerLimit = [];
        var dataUpperLimit = [];
        var dataSelection = [];

        var dataOffset;
        var dataRange;

        dataArrangefunc(names,attributes,dataLowerLimit,dataUpperLimit,dataIn,data);

        var guiControls = new function () {

            this.thickness = 8.5;
            this.smoothness = 0.7;
            this.maxRadius = 30;
            this.minRadius = 10;

            this.data1 = true;
            this.data2 = true;
            this.data3 = true;
            this.data4 = true;

            this.labelsOnOff = false;
            this.namesOnOff = false;
            this.rotate = false;
            //this.area = false;
            this.labelSize = 2;

            this.modelSegments = 64;
            this.reset = function()
            {
                controlCamera.reset();
            }

        };

        var datGUI = new dat.GUI({ autoPlace: false });
        document.getElementById('gui3D').appendChild(datGUI.domElement);

        var rotationSpeed = 0;

        division = attributes.length;
        var selectorLength;
        var boolValues = [true, true, true, true];

        for(var i = 1; i<=attributes.length; i++)
        {
            datGUI.add(guiControls, 'data' + i).name(attributes[i-1]).onChange(function (value) {
                if(value){division++}
                else{division--}

                if(division == 0)
                {
                    selectorLength = 0;
                    document.getElementById('content3D').style.color = "#777777";
                    document.getElementById('content3D').innerHTML = "No Model Selected"
                }
                else{
                    document.getElementById('content3D').innerHTML = "";
                    viewport3D.appendChild(renderer.domElement);
                }

                boolValues[0] = guiControls.data1;
                boolValues[1] = guiControls.data2;
                boolValues[2] = guiControls.data3;
                boolValues[3] = guiControls.data4;

                removing();
                drawing();
                generateLabel()
            })
        }



        datGUI.add(guiControls, 'thickness',3,10).name('Thickness').onChange(function () {
            removing();
            drawing();
            generateLabel();
        });

        datGUI.add(guiControls, 'smoothness',0,1,0.1).name('Smoothness').onChange(function (value) {

            dataOffset = dataRange*value;
            mapping();
            removing();
            drawing();
            generateLabel();
        });

        datGUI.add(guiControls, 'maxRadius',10,30).name('maxRadius').onChange(function (value) {

            maxRadius = value;
            mapping();
            removing();
            drawing();
            generateLabel();
        });

        datGUI.add(guiControls, 'minRadius',5,25).name('minRadius').onChange(function (value) {

            minRadius = value;
            mapping();
            removing();
            drawing();
            generateLabel();
        });

        datGUI.add(guiControls, 'modelSegments',16,128,8).name('Segments').onChange(function () {
            removing();
            drawing();
            dataSelection = [];
        });

        datGUI.add(guiControls, 'rotate').name('Rotate').onChange(function (value) {
            if(value)
            {
                rotationSpeed = 0.02;
            }
            else
            {
                rotationSpeed = 0;
                cylindersObject.rotation.y = 0;
                planesObject.rotation.y = 0;
                capsObject.rotation.y = 0;
                endCapsObject.rotation.y = 0;
            }
        });

        /*

        datGUI.add(guiControls, 'area').name('Area Scaling').onChange(function () {

            mapping();
            removing();
            drawing();
            generateLabel();

        });

        */

        datGUI.add(guiControls, 'reset').name('Reset Camera');


        /////////////////////////////////////////////

        // PARAMETERS
        ////////////////////////////////////
        var maxRadius = guiControls.maxRadius;
        var minRadius = guiControls.minRadius;
        ///////////////////////////////////
        var dataOut = [];

        function transpose(m){return zeroFill(m.reduce(function(m,r){return Math.max(m,r.length)},0)).map(function(r,i){return zeroFill(m.length).map(function(c,j){return m[j][i]})})}function zeroFill(n){return new Array(n+1).join("0").split("").map(Number)}

        dataIn = transpose(dataIn);

        //Maps data value to predefined upper and lower bounds /////////////////


        function mapping()
        {
            for (var i = 0; i<dataIn.length; i++)
            {
                dataOut[i] = new Array(dataIn[0].size);

                for (var a = 0; a<dataIn[0].length; a++)
                {


                    dataRange = dataUpperLimit[i] - dataLowerLimit[i];
                    dataOffset = dataRange*guiControls.smoothness;

                    dataOut[i][a] = ((dataIn[i][a]+dataOffset)-dataLowerLimit[i])*((maxRadius-minRadius)/((dataUpperLimit[i]+2*dataOffset)-dataLowerLimit[i])) + minRadius;

                    /*
                    if(guiControls.area == true)
                    {
                        dataOut[i][a] = minRadius * Math.sqrt(dataOut[i][a] / minRadius);
                    }
                    */

                    /*
                    // Area
                     dataRange = Math.sqrt(dataUpperLimit[i]/Math.PI) - Math.sqrt(dataLowerLimit[i]/Math.PI);
                     dataOffset = dataRange*guiControls.smoothness;

                     dataOut[i][a] = ((Math.sqrt(dataIn[i][a]/Math.PI)+dataOffset)-Math.sqrt(dataLowerLimit[i]/Math.PI))*((maxRadius-minRadius)/((Math.sqrt(dataUpperLimit[i]/Math.PI)+2*dataOffset)-Math.sqrt(dataLowerLimit[i]/Math.PI))) + minRadius;
                     */


                    //dataOut[i][a] = ((dataIn[i][a])-dataLowerLimit[i])*((maxRadius-minRadius)/((dataUpperLimit[i])-dataLowerLimit[i])) + minRadius;
                    
                }
            }

            console.log(dataOut);
        }

        mapping();





        // Three.JS SCENE PREPARATION
        var WIDTH = 650;
        var HEIGHT = 550;
        // Scene
        var scene = new THREE.Scene();
        // Camera
        var camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 1, 1000);
        camera.position.setY(100);
        camera.position.setZ(150);

        // Renderer
        viewport3D = document.getElementById('content3D');
        var renderer = new THREE.WebGLRenderer({antialias: true});
        //renderer.setSize(window.innerWidth / 1.5, window.innerHeight / 1.5);
        renderer.setSize(WIDTH, HEIGHT);
        viewport3D.appendChild(renderer.domElement);
        renderer.setClearColor(0xf4f4f4);
        //document.body.appendChild(renderer.domElement);
        // Grid Helper
        var size = 30;
        var step = 12;
        var gridHelper = new THREE.GridHelper(size, step, 0xa8a8a8, 0xd1d1d1);
        scene.add(gridHelper);
        // Light
        var hemisphereLight = new THREE.HemisphereLight(0xeaeaea, 0x7f7f7f, 1);
        hemisphereLight.position.set(0, 30, 0).normalize();
        scene.add(hemisphereLight);

        var directionalLight = new THREE.DirectionalLight( 0xffffff, 1);
        directionalLight.position.set(10, 10, 10);
        directionalLight.target.position.set(0, 0, 0);
        //scene.add( directionalLight );

        var light = new THREE.AmbientLight( 0xe8e8e8, 0.5 );
        scene.add(light);

        //////////////////////////////////////////////////

        // DRAW THE MODEL

        material = [];

        material[0] = new THREE.MeshPhongMaterial({color: 0xffa000});
        material[1] = new THREE.MeshPhongMaterial({color: 0xff8a00});
        material[2] = new THREE.MeshPhongMaterial({color: 0xff7200});
        material[3] = new THREE.MeshPhongMaterial({color: 0xFF5B00});


        //material[3] = new THREE.MeshPhongMaterial({color: 0x000000, opacity: 0.5, transparent: true});

        var cylinderMesh;
        var capMesh;
        var planeMesh;
        var width = [];
        var cylindersObject;
        var planesObject;
        var capsObject;
        var endCapsObject;

        function drawing()
        {

            cylindersObject = new THREE.Object3D();
            planesObject = new THREE.Object3D();
            capsObject = new THREE.Object3D();
            endCapsObject = new THREE.Object3D();


            if(division != 0)
            {
                var angle = 2*Math.PI/division;

                for(var n=0; n<boolValues.length; n++)
                {
                    if(boolValues[n]){
                        dataSelection.push(n)
                    }
                }

                for(var a = 0; a < division; a++)
                {

                    var difference;

                    for (var i = 0; i < dataIn[0].length; i++) {

                        cylinderGeo = new THREE.CylinderGeometry(dataOut[dataSelection[a]][i], dataOut[dataSelection[a]][i], 1, guiControls.modelSegments, 1, true, a*angle, angle);
                        cylinderMesh = new THREE.Mesh(cylinderGeo, material[dataSelection[a]]);

                        cylinderMesh.scale.setY(guiControls.thickness);
                        cylinderMesh.position.setY(i * guiControls.thickness);

                        cylindersObject.add(cylinderMesh);



                        if(i == 0) //Bottom caps
                        {
                            endCaps = new THREE.CircleGeometry(dataOut[dataSelection[a]][i], guiControls.modelSegments, -a*angle, angle);
                            endCapsMesh = new THREE.Mesh(endCaps, material[dataSelection[a]]);
                            endCapsMesh.position.setY(i * guiControls.thickness - guiControls.thickness/2);
                            endCapsMesh.rotation.x = -3*Math.PI/2;

                            if(division == 3)
                            {
                                endCapsMesh.rotation.z = -30*Math.PI/180;
                            }
                            else if(division == 2)
                            {
                                endCapsMesh.rotation.z = -90*Math.PI/180;
                            }

                        }
                        else if(i == dataIn[0].length-1) //Top caps
                        {
                            endCaps = new THREE.CircleGeometry(dataOut[dataSelection[a]][i], guiControls.modelSegments, a*angle, angle);
                            endCapsMesh = new THREE.Mesh(endCaps, material[dataSelection[a]]);
                            endCapsMesh.position.setY(i * guiControls.thickness + guiControls.thickness/2);
                            endCapsMesh.rotation.x = -Math.PI/2;
                            endCapsMesh.rotation.z = -Math.PI/2;

                        }

                        endCapsObject.add(endCapsMesh);

                        differenceRaw = dataOut[dataSelection[a]][i]-dataOut[dataSelection[(a+1)%division]][i];
                        difference = Math.abs(dataOut[dataSelection[a]][i]-dataOut[dataSelection[(a+1)%division]][i]);

                        planeGeo = new THREE.PlaneGeometry(difference, guiControls.thickness,1,1);
                        planeMesh = new THREE.Mesh(planeGeo, material[dataSelection[a]]);


                        if(division == 4){
                            planeMesh.rotation.y = a*angle;

                            if(dataOut[dataSelection[a]][i] > dataOut[dataSelection[(a+1)%division]][i])
                            {
                                planePos = dataOut[dataSelection[a]][i] - difference/2;
                            }
                            else
                            {
                                planePos = dataOut[dataSelection[a]][i] + difference/2;
                                planeMesh.material = material[dataSelection[(a+1)%division]];
                            }

                            //Fix side face normals
                            if(differenceRaw > 0)
                            {
                                if(a == 0){planeMesh.rotation.y = 2*angle;}
                                else if(a == 1){planeMesh.rotation.y = 3*angle;}
                                else if(a == 2){planeMesh.rotation.y = 4*angle;}
                                else{planeMesh.rotation.y = 5*angle;}
                            }

                            planeMesh.position.setX(Math.cos(2*Math.PI - a*angle)*planePos);
                            planeMesh.position.setZ(Math.sin(2*Math.PI - a*angle)*planePos);



                            if(i < dataIn[0].length - 1)
                            {
                                capGeo = new THREE.RingGeometry(dataOut[dataSelection[a]][i], dataOut[dataSelection[a]][(i+1)], guiControls.modelSegments, 1, -a*angle, angle);
                                capMesh = new THREE.Mesh(capGeo, material[dataSelection[a]]);
                                capMesh.position.setY(i * guiControls.thickness + guiControls.thickness/2);

                                //Fix cap face normals
                                capMesh.rotation.x = -3*Math.PI/2;
                                capsObject.add(capMesh);
                            }

                            planeMesh.position.setY(i* guiControls.thickness);
                            planesObject.add(planeMesh);


                        }
                        else if(division == 3){
                            planeMesh.rotation.y = a*angle + 30*Math.PI/180;

                            if(dataOut[dataSelection[a]][i] > dataOut[dataSelection[(a+1)%division]][i])
                            {
                                planePos = dataOut[dataSelection[a]][i] - difference/2;
                            }
                            else
                            {
                                planePos = dataOut[dataSelection[a]][i] + difference/2;
                                planeMesh.material = material[dataSelection[(a+1)%division]];
                            }

                            if(differenceRaw > 0)
                            {
                                if(a == 0){planeMesh.rotation.y = Math.PI + 30*Math.PI/180;}
                                else if(a == 1){planeMesh.rotation.y = Math.PI + 30*Math.PI/180 + angle;}
                                else{planeMesh.rotation.y = Math.PI + 30*Math.PI/180 + 2*angle;}
                            }

                            planeMesh.position.setX(Math.cos(2*Math.PI - (a*angle + 30*Math.PI/180))*planePos);
                            planeMesh.position.setZ(Math.sin(2*Math.PI - (a*angle + 30*Math.PI/180))*planePos);

                            if(i < dataIn[0].length - 1)
                            {
                                capGeo = new THREE.RingGeometry(dataOut[dataSelection[a]][i], dataOut[dataSelection[a]][(i+1)], guiControls.modelSegments, 1, -a*angle, angle);
                                capMesh = new THREE.Mesh(capGeo, material[dataSelection[a]]);
                                capMesh.position.setY(i * guiControls.thickness + guiControls.thickness/2);

                                capMesh.rotation.z = -(angle-Math.PI/2);
                                capMesh.rotation.x = -3*Math.PI/2;
                                capsObject.add(capMesh);
                            }

                            planeMesh.position.setY(i* guiControls.thickness);
                            planesObject.add(planeMesh);

                        }
                        else if(division == 2){
                            planeMesh.rotation.y = a*angle + 90*Math.PI/180;

                            if(dataOut[dataSelection[a]][i] > dataOut[dataSelection[(a+1)%division]][i])
                            {
                                planePos = dataOut[dataSelection[a]][i] - difference/2;
                            }
                            else
                            {
                                planePos = dataOut[dataSelection[a]][i] + difference/2;
                                planeMesh.material = material[dataSelection[(a+1)%division]];
                            }

                            if(differenceRaw > 0)
                            {
                                if(a == 0){planeMesh.rotation.y = angle + Math.PI/2;}
                                else if(a == 1){planeMesh.rotation.y = 2*angle + Math.PI/2;}
                            }

                            planeMesh.position.setX(Math.cos(2*Math.PI - (a*angle + 90*Math.PI/180))*planePos);
                            planeMesh.position.setZ(Math.sin(2*Math.PI - (a*angle + 90*Math.PI/180))*planePos);

                            if(i < dataIn[0].length - 1)
                            {
                                capGeo = new THREE.RingGeometry(dataOut[dataSelection[a]][i], dataOut[dataSelection[a]][(i+1)], guiControls.modelSegments, 1, -a*angle, angle);
                                capMesh = new THREE.Mesh(capGeo, material[dataSelection[a]]);
                                capMesh.position.setY(i * guiControls.thickness + guiControls.thickness/2);

                                capMesh.rotation.z = -(angle-Math.PI/2);
                                capMesh.rotation.x = -3*Math.PI/2;
                                capsObject.add(capMesh);
                            }

                            planeMesh.position.setY(i* guiControls.thickness);
                            planesObject.add(planeMesh);

                        }
                        else{

                            if(i < dataIn[0].length - 1)
                            {
                                capGeo = new THREE.RingGeometry(dataOut[dataSelection[a]][i], dataOut[dataSelection[a]][(i + 1)], guiControls.modelSegments, 1, 0, 2 * Math.PI);
                                capMesh = new THREE.Mesh(capGeo, material[dataSelection[a]]);
                                capMesh.position.setY(i * guiControls.thickness + guiControls.thickness / 2);
                                capMesh.rotation.x = -3 * Math.PI / 2;

                                capsObject.add(capMesh);
                            }

                        }

                    }

                }

                scene.add(cylindersObject);
                scene.add(planesObject);
                scene.add(capsObject);
                scene.add(endCapsObject);


                gridHelper.position.setY(-guiControls.thickness/2 - 20);
                cylindersObject.position.setY(-20);
                planesObject.position.setY(-20);
                capsObject.position.setY(-20);
                endCapsObject.position.setY(-20);

                selectorFirstElement = dataSelection[0];
                selectorLength = dataSelection.length;
                //Flush the arrays
                width = [];
            }

            else
            {
                removing();
            }

        }

        drawing();


        ////////////////////////////////////////////

        function removing() {

            scene.remove(scene.children[3]);
            scene.remove(scene.children[3]);
            scene.remove(scene.children[3]);
            scene.remove(scene.children[3]);

        }


        // Trackball Controls
        controlCamera = new THREE.TrackballControls(camera, renderer.domElement);

        controlCamera.maxDistance = 200;
        controlCamera.minDistance = 50;

        controlCamera.zoomSpeed = 0.05;
        //


        // RENDER THE SCENE
        function render()
        {
            cylindersObject.rotation.y += rotationSpeed;
            planesObject.rotation.y += rotationSpeed;
            capsObject.rotation.y += rotationSpeed;
            endCapsObject.rotation.y += rotationSpeed;

            controlCamera.update();
            renderer.render(scene, camera);
            requestAnimationFrame(render);
        }

        render();


        // CREATE LABELS PDF /////

        var doc;
        var selectorFirstElement;

        function generateLabel()
        {
            doc = new jsPDF();
            var prevSum = 0;
            var maxLength = 0;
            var textLength = 0;
            var fontSize = 0;
            var offset = 10;
            var thicknessTop = 0;
            var radius;

            function textWidth(text, font) {
                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext('2d');
                ctx.font = font;
                return ctx.measureText(text).width;
            }

            function fontIncrease(textInput, thicknessSource)
            {
                fontSize = fontSize + 0.1;
                textLength = textWidth(textInput, fontSize + 'px ' + 'arial');

                if(fontSize/4 < thicknessSource - 1)
                {
                    if(textLength/(2.75) < maxLength)
                    {
                        fontIncrease(textInput,thicknessSource);
                    }
                }
            }

            for(var i=0; i<names.length;i++)
            {

                //var text = dummy.text(0, 0, names[i]);
                if(division == 1)
                {
                    maxLength = 2*dataOut[selectorFirstElement][names.length-1-i]*Math.PI/2;
                }
                else
                {
                    maxLength = 2*dataOut[selectorFirstElement][names.length-1-i]*Math.PI/division;
                }

                fontIncrease(names[names.length-1-i],guiControls.thickness);
                doc.setFontSize(fontSize);

                //doc.line(10, prevSum + offset, 10+maxLength, prevSum + offset);
                //doc.line(10, prevSum + offset + guiControls.thickness, 10+maxLength, prevSum + offset + guiControls.thickness);
                doc.setDrawColor(200,200,200);
                doc.line(10, prevSum + offset, 10+textLength/(2.75), prevSum + offset);
                doc.line(10, prevSum + offset + guiControls.thickness, 10+textLength/(2.75), prevSum + offset + guiControls.thickness);
                doc.text(10.1, offset + prevSum + guiControls.thickness - (guiControls.thickness - fontSize/4)/2, names[names.length-1-i]);

                prevSum = prevSum + guiControls.thickness + 2;

                fontSize = 0;
            }


            // For printing the attribute names

            prevSum = 0;
            //console.log(dataOut);
            //console.log('font: ' + fontSize);

            for(var i=0; i<division;i++)
            {
                radius = dataOut[dataSelection[i]][dataOut[i].length - 1];

                if(division == 4)
                {
                    thicknessTop = (radius*Math.sqrt(2)/4);
                    maxLength = 2*(radius*Math.sqrt(2)/8)*5;
                }
                else if(division == 3)
                {
                    thicknessTop = radius/2;
                    maxLength = 2*(2*radius/3);
                }
                else if(division == 2)
                {
                    thicknessTop = radius/3;
                    maxLength = 2*(3*radius/4);
                }
                else if(division == 1)
                {
                    thicknessTop = 2*radius/4;
                    maxLength = 2*radius - 2;
                }

                fontIncrease(attributes[dataSelection[i]],thicknessTop);

                doc.setFontSize(fontSize);

                doc.setDrawColor(200,200,200);
                doc.line(100, prevSum + offset, 100+textLength/(2.75), prevSum + offset);
                doc.line(100, prevSum + offset + thicknessTop, 100+textLength/(2.75), prevSum + offset + thicknessTop);
                doc.text(100.1, offset + prevSum + thicknessTop - (thicknessTop - fontSize/4)/2, attributes[dataSelection[i]]);

                prevSum = prevSum + thicknessTop + 2;

                fontSize = 0;
            }

            dataSelection = [];
        }

        generateLabel();

        /////////////////////////////////////////////////////////////////////////

        ////////////////////////////////////////////////////////////////////////

        function saveSTL(scene) {


            if(selectorLength == 0)
            {
                alert('No model to be downloaded')
            }
            else
            {
                var zip = new JSZip();

                var exporter = new THREE.STLExporter();
                var stlString = exporter.parse(scene);

                var blob3D = new Blob([stlString], {type: 'application/octet-stream'});
                zip.file("DataSculpture" + ".stl", blob3D);

                var blobPDF = doc.output('blob');
                zip.file("Labels" + ".pdf", blobPDF);

                zip.generateAsync({type: "blob"})
                    .then(function (blob) {
                        saveAs(blob, "Files.zip");
                    });
            }

        }


        var myBtn = document.getElementById('save-btn');
        myBtn.addEventListener("click", function () {
            saveSTL(scene)
        });


        function clear() {

            removing();
            //Disable save button
            document.getElementById('save-btn').disabled = true;
            document.getElementById('file3D').value = "";
            //Enable file input button
            document.getElementById('file3D').disabled = false;
            //Default label of the input button
            document.getElementById('label3DFile').innerHTML = 'CHOOSE A FILE';
            //Enable the uploadButton
            document.getElementById('up').disabled = true;
            //Disable the clear button
            document.getElementById('clear').disabled = true;
            //Clear the GUI Controller
            datGUI.destroy();
            //Clean Controller and Attribute DIVs
            document.getElementById('gui3D').innerHTML = '';
            document.getElementById('content3D').style.color = "#777777";
            document.getElementById('content3D').innerHTML = 'PLEASE UPLOAD A CSV FILE';
            //Clear the arrays for new data
            document.getElementById('save-btn').removeEventListener('click',saveSTL);
        }

        document.getElementById('clear').addEventListener("click", clear);

    }
    else
    {
        document.getElementById('content3D').style.color = "red";
        document.getElementById('content3D').innerHTML = 'PLEASE UPLOAD A VALID CSV FILE';
        document.getElementById('up').disabled = false;
        document.getElementById('clear').disabled = true;

    }

}