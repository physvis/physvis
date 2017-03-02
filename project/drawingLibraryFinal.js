(function(window){
    'use strict';
    
    function Library(){

        var makerjs = require('makerjs');
        
        var LibraryObject = {};

        //Angles and positions for data circles
        var angles = [];
        var positions = [];

        //Angles and positions for labels
        var labelAngles = [];

        var armAngleArray = [];

        //Positions of the lower and upper arms on the base circle
        var upperPositions = [];
        var lowerPositions = [];

        //Parameter arrays for data circles and arms
        var startAngle = [];
        var endAngle = [];
        var endPointsLower = [];
        var endPointsUpper = [];
        var dummy;
        var path = [];

        LibraryObject.drawShape = function (numberOfAngles, baseCircleRadius, circleStroke, armWidth, data, labelOffset, signToggle, holderToggle, dataSelection) {

            //Clear the global arrays for multiple calls of the function
            angles = [];
            positions = [];
            labelAngles = [];
            armAngleArray = [];
            upperPositions = [];
            lowerPositions = [];
            startAngle = [];
            endAngle = [];
            endPointsLower = [];
            endPointsUpper = [];
            path = [];


            var finalModel = {paths:{},models:{}};

            //Alignment Sign parameters
            var signRadius = baseCircleRadius/20;
            // isosceles Triangle R^2 = m^2 + r^2 to find the alignAlpha
            var m = Math.sqrt(Math.pow(baseCircleRadius,2)-Math.pow(signRadius/2,2));
            var alignAlpha = 2*Math.atan2(signRadius/2,m); // 2 times, since the result is half of the angle
            var alignGamma = Math.PI/2 - alignAlpha/2;
            var alignBeta = Math.PI/numberOfAngles;
            var alignTheta = alignGamma-alignBeta;

            var alignStartAngle = Math.PI - alignTheta;
            var alignEndAngle = alignStartAngle + 2*alignGamma;

            var interAngle1 = (alignBeta - alignAlpha)*180/Math.PI;
            var interAngle2 = (alignBeta + alignAlpha)*180/Math.PI;

            //Upper and lower angles for arms
            var length = Math.sqrt(Math.pow(baseCircleRadius,2) - Math.pow(armWidth,2));
            var armAlpha = Math.atan2(armWidth,length)*(180/Math.PI);

            //Generating parameters
            for (var i = 0; i<numberOfAngles; i++)
            {
                //Data circle angles
                angles.push(i*(360/numberOfAngles));
                //Position for data circles
                positions[i] = [baseCircleRadius*Math.cos(angles[i]*(Math.PI/180)), baseCircleRadius*Math.sin(angles[i]*(Math.PI/180))];
                //Arm angles
                armAngleArray[i] = [angles[i] + armAlpha, angles[i] - armAlpha];
                //Position of upper arm
                upperPositions[i] = [baseCircleRadius*Math.cos((Math.PI/180)*armAngleArray[i][0]),baseCircleRadius*Math.sin((Math.PI/180)*armAngleArray[i][0])];
                //Position of lower arm
                lowerPositions[i] = [baseCircleRadius*Math.cos((Math.PI/180)*armAngleArray[i][1]),baseCircleRadius*Math.sin((Math.PI/180)*armAngleArray[i][1])];

                //Starting and ending angles for data circles
                dummy = Math.sqrt(Math.pow(data[dataSelection[i]],2)-Math.pow(armWidth,2));
                startAngle.push((angles[i] - 90) - Math.atan2(dummy,armWidth)*180/Math.PI);
                endAngle.push((angles[i] + 90) + Math.atan2(dummy,armWidth)*180/Math.PI);

                //End Position for arms
                endPointsLower[i] = [2*positions[i][0] + data[dataSelection[i]]*Math.cos(startAngle[i]*Math.PI/180), 2*positions[i][1] + data[dataSelection[i]]*Math.sin(startAngle[i]*Math.PI/180)];
                endPointsUpper[i] = [2*positions[i][0] + data[dataSelection[i]]*Math.cos(endAngle[i]*Math.PI/180), 2*positions[i][1] + data[dataSelection[i]]*Math.sin(endAngle[i]*Math.PI/180)];

            }

            //Drawing the shape
            if(signToggle)
            {
                //Special condition due to armAngles with 1 attribute selected
                if(dataSelection.length == 1)
                {
                    path.push(new makerjs.paths.Arc([0,0],baseCircleRadius,armAngleArray[0][0],interAngle1));
                    path.push(new makerjs.paths.Arc([0,0],baseCircleRadius,interAngle2,armAngleArray[0][1]));
                }
                else
                {
                    path.push(new makerjs.paths.Arc([0,0],baseCircleRadius,armAngleArray[0][0],interAngle1));
                    path.push(new makerjs.paths.Arc([0,0],baseCircleRadius,interAngle2,armAngleArray[1][1]));
                }

            }

            for (var i = 0; i<numberOfAngles; i++)
            {
                //Base circle arcs
                if(signToggle && i == 0)
                {
                    //Alignment sign
                    path.push(new makerjs.paths.Arc([baseCircleRadius*Math.cos(alignBeta),baseCircleRadius*Math.sin(alignBeta)],signRadius,alignStartAngle*180/Math.PI,alignEndAngle*180/Math.PI));

                    //Draw other arcs as usual
                    if(i < numberOfAngles-1)
                    {
                        path.push(new makerjs.paths.Arc([0,0],baseCircleRadius,armAngleArray[i+1][0],armAngleArray[((i+2)%(numberOfAngles))][1]));
                    }
                }
                else
                {
                    path.push(new makerjs.paths.Arc([0,0],baseCircleRadius,armAngleArray[i][0],armAngleArray[((i+1)%(numberOfAngles))][1]));
                }
                
                //Data circles
                path.push(new makerjs.paths.Arc([2*positions[i][0],2*positions[i][1]],data[dataSelection[i]],startAngle[i],endAngle[i]));
                //Lower arms
                path.push(new makerjs.paths.Line([lowerPositions[i][0],lowerPositions[i][1]],[endPointsLower[i][0],endPointsLower[i][1]]));
                //Upper arms
                path.push(new makerjs.paths.Line([upperPositions[i][0],upperPositions[i][1]],[endPointsUpper[i][0],endPointsUpper[i][1]]));
                //Stroke Circles
                path.push(new makerjs.paths.Circle([2*baseCircleRadius*Math.cos(angles[i]*Math.PI/180),2*baseCircleRadius*Math.sin(angles[i]*Math.PI/180)],(data[dataSelection[i]]-circleStroke)));
            }

            //var finalModel = {paths: path, units:makerjs.unitType.Millimeter}

            //Model holder
            if(holderToggle)
            {
                path.push(new makerjs.paths.Circle([0,-baseCircleRadius/2],baseCircleRadius/12));
                path.push(new makerjs.paths.Circle([0,baseCircleRadius/2],baseCircleRadius/12));
            }


            // LABELING //////////////////////////////////////////

            for (var i = 0; i<path.length; i++)
            {
                finalModel.paths[i] = path[i];
            }

            finalModel.units = makerjs.unitType.Millimeter;


            return finalModel
        };


        LibraryObject.curvedText = function (font, text, fontSize, arcRadius, onTop) {

            //generate the text using a font
            var textModel = new makerjs.models.Text(font, text, fontSize, false, true);

            //measure height of the text from the baseline
            var measure = makerjs.measure.modelExtents(textModel);
            var height = measure.high[1];
            var h2 = height / 2;
            var left = measure.low[0];
            var right = measure.high[0];
            var textWidth = right - left;

            //Calculate the angles dynamically
            var alpha = (textWidth*360)/(2*Math.PI*arcRadius);
            var startAngle = (180 - alpha)/2;
            var endAngle = (alpha + (180 - alpha)/2);

            var arc = new makerjs.paths.Arc([0, 0], arcRadius, startAngle, endAngle);

            //save all of these in the model
            this.models = {text: textModel};


            //move each character to a percentage of the total arc
            var span = makerjs.angle.ofArcSpan(arc);
            for (var i = 0; i < text.length; i++) {
                var char = textModel.models[i];

                //get the x distance of each character as a percentage
                var distFromFirst = char.origin[0] - left;
                var center = distFromFirst / textWidth;

                //set a new origin at the center of the text
                var o = makerjs.point.add(char.origin, [0, h2]);
                makerjs.model.originate(char, o);

                //project the character x position into an angle
                var angle = center * span;
                var angleFromEnd = onTop ? endAngle - angle : startAngle + angle;
                var p = makerjs.point.fromAngleOnCircle(angleFromEnd, arc);
                char.origin = p;

                //rotate the char to 90 from tangent
                makerjs.model.rotate(char, onTop ? angleFromEnd - 90 : angleFromEnd + 90, p);
            }

            return textModel
        };


        LibraryObject.loadFont = function (fontDir) {
            return new Promise(function (resolve, reject) {
                opentype.load(fontDir, function (err, font) {
                    if (err) {
                        reject(alert('Could not load font: ' + err));
                    }
                    else {
                        resolve(font);
                    }
                });
            });
        };


        LibraryObject.drawAll = function(numberOfAngles, baseCircleRadius, circleStroke, armWidth, data, labelOffset, name, fontSize, attribute,fontSizeLabel,div,signToggle,holderToggle,dataSelection)
        {
            //Base model assigned to a variable
            var shape = LibraryObject.drawShape(numberOfAngles, baseCircleRadius, circleStroke, armWidth, data, labelOffset,signToggle,holderToggle,dataSelection);
            //Async function call
            LibraryObject.loadFont('fonts/Geo.otf').then(function(font){
                shape.models[0] = new makerjs.models.Text(font, name, fontSize, false);
                makerjs.model.center(shape.models[0]);


                for(var i=0; i<angles.length; i++)
                {

                    if(angles[i] >= 0 && angles[i] <=180){
                        labelAngles[i] = angles[i]-90;
                        shape.models[i+1] = LibraryObject.curvedText(font, attribute[dataSelection[i]], fontSizeLabel, baseCircleRadius-labelOffset, true);
                    }
                    else{
                        labelAngles[i]= angles[i]-90;
                        shape.models[i+1] = LibraryObject.curvedText(font, attribute[dataSelection[i]], fontSizeLabel, baseCircleRadius-labelOffset, false);
                    }

                    makerjs.model.rotate(shape.models[i+1],labelAngles[i]);
                }

                /*
                //Holder hole
                if(holderToggle)
                {
                    shape.models[angles.length+1] = new makerjs.models.RoundRectangle(2*baseCircleRadius/10, 2*baseCircleRadius/20, 1*baseCircleRadius/35);
                    shape.models[angles.length+1] = new makerjs.models.Circle([0,0],2*baseCircleRadius/10)
                    shape.models[angles.length+1].origin = [-baseCircleRadius/10,(-baseCircleRadius/3) -baseCircleRadius/10]
                    shape.models[angles.length+1].center;
                }
                */


                document.getElementById(div).innerHTML = makerjs.exporter.toSVG(shape);
            })
        };

        LibraryObject.downloadAll = function(numberOfAngles, baseCircleRadius, circleStroke, armWidth, data, labelOffset, name, fontSize, attribute,fontSizeLabel,signToggle,holderToggle,dataSelection,thickness)
        {
            var zip = new JSZip();

            //var element = document.getElementById("myBar");
            var width = 0;
            //element.style.width = width + '%';
            var max = 100/(name.length-1);
            
            //Async function call
            LibraryObject.loadFont('fonts/Geo.otf').then(function(font){

                document.getElementById('clearSign').disabled = true;

                function processLargeArray() {
                    var chunk = 1;
                    var a = 0;
                    function doChunk() {
                        var cnt = chunk;
                        while (cnt-- && a < name.length) {
                            //
                            //Base model assigned to a variable
                            var shape = LibraryObject.drawShape(numberOfAngles, baseCircleRadius, circleStroke, armWidth, data[a], labelOffset,signToggle,holderToggle,dataSelection);

                            shape.models[0] = new makerjs.models.Text(font, name[a], fontSize, false);
                            makerjs.model.center(shape.models[0]);

                            for (var i = 0; i < angles.length; i++) {

                                if (angles[i] >= 0 && angles[i] <= 180) {
                                    labelAngles[i] = angles[i] - 90;
                                    shape.models[i + 1] = LibraryObject.curvedText(font, attribute[dataSelection[i]], fontSizeLabel, baseCircleRadius-labelOffset, true);
                                }
                                else {
                                    labelAngles[i] = angles[i] - 90;
                                    shape.models[i + 1] = LibraryObject.curvedText(font, attribute[dataSelection[i]], fontSizeLabel, baseCircleRadius-labelOffset, false);
                                }

                                makerjs.model.rotate(shape.models[i + 1], labelAngles[i]);

                            }

                            /*
                            if(holderToggle)
                            {
                                shape.models[angles.length+1] = new makerjs.models.RoundRectangle(2*baseCircleRadius/10, 2*baseCircleRadius/10, 2);
                                shape.models[angles.length+1].origin = [-baseCircleRadius/10,(-baseCircleRadius/2.5) -baseCircleRadius/10]
                                shape.models[angles.length+1].center;
                            }
                            */

                            zip.file("DXFs/" + name[a] + ".dxf", makerjs.exporter.toDXF(shape));


                            width = a*max;
                            //element.style.width = width + '%';

                            console.log(a*max);
                            //
                            ++a;
                        }
                        if (a < name.length) {
                            // set Timeout for async iteration
                            setTimeout(doChunk, 1);
                        }
                        else
                        {
                            initializeSave();
                        }
                    }
                    doChunk();
                }

                processLargeArray();
    
            })

            //////// 3D HOLDER MODEL /////////////////////////////

            if(holderToggle)
            {
                // Scene
                var scene = new THREE.Scene();
                // Camera
                var camera = new THREE.PerspectiveCamera(45, 1, 1000);
                // Renderer
                var renderer = new THREE.WebGLRenderer({antialias: true});

                var segment = 256;
                var margin = 0.1;
                var thicknessOfMat = thickness;
                var numOfObj = name.length;

                var cylinderGeoBase = new THREE.CylinderGeometry(baseCircleRadius,baseCircleRadius, thicknessOfMat, segment, 1, false, 0, 2*Math.PI);
                var cylinderGeo1 = new THREE.CylinderGeometry(baseCircleRadius/12 - margin ,baseCircleRadius/12 - margin, thicknessOfMat*numOfObj + 3, 256, 1, true, 0, 2*Math.PI);
                var cylinderGeo2 = new THREE.CylinderGeometry(baseCircleRadius/12 - margin ,baseCircleRadius/12 - margin, thicknessOfMat*numOfObj + 3, 256, 1, true, 0, 2*Math.PI);
                var cylinderCap1 = new THREE.CircleGeometry(baseCircleRadius/12 - margin, segment);
                var cylinderCap2 = new THREE.CircleGeometry(baseCircleRadius/12 - margin, segment);

                var cylinderBaseMesh = new THREE.Mesh(cylinderGeoBase);
                var cylinderGeo1Mesh = new THREE.Mesh(cylinderGeo1);
                var cylinderGeo2Mesh = new THREE.Mesh(cylinderGeo2);
                var cylinderCap1Mesh = new THREE.Mesh(cylinderCap1);
                var cylinderCap2Mesh = new THREE.Mesh(cylinderCap2);


                cylinderGeo1Mesh.position.setZ(-baseCircleRadius/2);
                cylinderGeo2Mesh.position.setZ(baseCircleRadius/2);
                cylinderGeo1Mesh.position.setY((thicknessOfMat*numOfObj + 3)/2 + thicknessOfMat/2);
                cylinderGeo2Mesh.position.setY((thicknessOfMat*numOfObj + 3)/2 + thicknessOfMat/2);

                cylinderCap1Mesh.position.setZ(-baseCircleRadius/2);
                cylinderCap2Mesh.position.setZ(baseCircleRadius/2);
                cylinderCap1Mesh.position.setY(thicknessOfMat/2 + (thicknessOfMat*numOfObj + 3));
                cylinderCap2Mesh.position.setY(thicknessOfMat/2 + (thicknessOfMat*numOfObj + 3));
                cylinderCap1Mesh.rotation.x = -Math.PI/2;
                cylinderCap2Mesh.rotation.x = -Math.PI/2;

                var allObjects = new THREE.Object3D();

                allObjects.add(cylinderBaseMesh);
                allObjects.add(cylinderGeo1Mesh);
                allObjects.add(cylinderGeo2Mesh);
                allObjects.add(cylinderCap1Mesh);
                allObjects.add(cylinderCap2Mesh);

                scene.add(allObjects);
                renderer.render(scene, camera);

                ///////////////////////////////////////////////////////

                var exporter = new THREE.STLExporter();
                var stlString = exporter.parse(allObjects);
                var blob = new Blob([stlString], {type: 'application/octet-stream'});
                zip.file("holderModel" + ".stl", blob);
            }

            //////// LABEL GENERATOR /////////////////////////////

            function generateLabel()
            {
                var doc = new jsPDF();
                var prevSum = 0;
                var maxLength = 0;
                var textLength = 0;
                var fontSize = 0;
                var offset = 10;

                function textWidth(text, font) {
                    var canvas = document.createElement('canvas');
                    var ctx = canvas.getContext('2d');
                    ctx.font = font;
                    return ctx.measureText(text).width;
                }

                function fontIncrease()
                {
                    fontSize = fontSize + 0.1;
                    textLength = textWidth(name[name.length-1-i], fontSize + 'px ' + 'arial');

                    if(fontSize/4 < thickness - 1)
                    {
                        if(textLength/(2.75) < maxLength)
                        {
                            fontIncrease();
                        }
                    }
                }

                for(var i=0; i<name.length;i++)
                {

                    if(numberOfAngles > 1){
                        maxLength = 2*Math.PI*baseCircleRadius*(armAngleArray[1][1]-armAngleArray[0][0])/360;

                    }
                    else{
                        maxLength = 2*Math.PI*baseCircleRadius*(120)/360;
                    }
                    fontIncrease();
                    doc.setFontSize(fontSize);

                    doc.setDrawColor(200,200,200);
                    doc.line(10, prevSum + offset, 10+textLength/(2.75), prevSum + offset);
                    doc.line(10, prevSum + offset + thickness, 10+textLength/(2.75), prevSum + offset + thickness);
                    doc.text(10.1, offset + prevSum + thickness - (thickness - fontSize/4)/2, name[name.length-1-i]);

                    prevSum = prevSum + thickness + 2;

                    fontSize = 0;
                }

                var blobPDF = doc.output('blob');
                zip.file("Labels" + ".pdf", blobPDF);
            }

            generateLabel();

            //////// GENERATE THE ZIP FILE /////////////////////////////

            function initializeSave()
            {
                zip.generateAsync({type: "blob"})
                    .then(function (blob) {
                        saveAs(blob, "Files.zip");
                    });

                document.getElementById('clearSign').disabled = false;
                document.getElementById('save-btnSign').disabled = false;
            }
        };

        return LibraryObject;
    }

    // We need that our library is globally accessible, then we save in the window
    if(typeof(window.drawingFinal) === 'undefined'){
        window.drawingFinal = Library();
    }
})(window); // We send the window variable within our function