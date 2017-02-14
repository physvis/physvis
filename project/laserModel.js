function newDrawing(data)
{
    // Input Check
    var valid = true;

    if(String(data[0][0]).toLowerCase() != 'auto' && String(data[0][0]).toLowerCase() != 'manual' && String(data[0][0]).toLowerCase() != '%')
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
        if(data[0].length > 7)
        {
            alert('Number of attributes is more than 6');
            valid = false;
            break;
        }
    }
    
    //If input is OK
    if(valid)
    {

        // DOM Initializations
        //document.getElementById('attributeList').innerHTML = 'Attributes';
        //document.getElementById('gui').innerHTML = 'Controllers';
        document.getElementById('clearSign').disabled = false;
        document.getElementById('fileSign').disabled = true;
        document.getElementById('save-btnSign').disabled = false;
        document.getElementById('controllers').style.display = "block";
        document.getElementById('container').style.opacity = "1";
        document.getElementById('next').style.display = "block";
        document.getElementById('prev').style.display = "block";


        // Put parsed CSV data into arrays
        var names = [];
        var attributes = [];
        var dataLowerLimit = [];
        var dataUpperLimit = [];
        var dataIn = [];
        var counter = 0;

        var dataOffset;
        var dataRange;
        var smoothness = 0;
        var area = true;

        dataArrangefunc(names,attributes,dataLowerLimit,dataUpperLimit,dataIn,data);

        ///////////////////////////////////////////

        //Lengths in unit of milimeter[mm]
        var numberOfObjects = names.length;

        var baseCircleRadius = 35;
        // Actual armWidth is equal to 2*armWidth
        var armWidth = 5;

        ////////////////////////////////////
        var maxRadius = baseCircleRadius;
        var minRadius = armWidth;

        var circleStroke = 2;
        var textMargin = 4;
        var fontSize = 10;
        var fontSizeLabel = 3.5;
        ///////////////////////////////////
        var dataOut = [];
        var signToggle = true;
        var holderToggle = true;
        var dataSelection = [];
        var thickness = 2;

        for(var i=0; i<attributes.length; i++)
        {
            dataSelection.push(i);
        }

        var dataSelectionLength = dataSelection.length;
        
        //Maps data value to predefined upper and lower bounds /////////////////
        function mapping()
        {
            for (var i = 0; i<dataIn.length; i++)
            {
                dataOut[i] = new Array(dataIn[0].size);

                for (var a = 0; a<dataIn[0].length; a++)
                {
                    //console.log(dataUpperLimit[a]);
                    //console.log(dataLowerLimit[a]);

                    dataRange = dataUpperLimit[a] - dataLowerLimit[a];
                    dataOffset = dataRange*smoothness;

                    dataOut[i][a] = ((dataIn[i][a]+dataOffset)-dataLowerLimit[a])*((maxRadius-minRadius)/((dataUpperLimit[a]+2*dataOffset)-dataLowerLimit[a])) + minRadius;

                    if(area == true)
                    {
                        //Area with median as reference point
                        dataOut[i][a] = ((maxRadius-minRadius)/2) * Math.sqrt(dataOut[i][a] / ((maxRadius-minRadius)/2));
                    }

                    //dataOut[i][a] = ((dataIn[i][a]+dataOffset)-dataLowerLimit[i])*((maxRadius-minRadius)/((dataUpperLimit[i]+2*dataOffset)-dataLowerLimit[i])) + minRadius;


                    /*
                     // Area
                     dataRange = Math.sqrt(dataUpperLimit[a]/Math.PI) - Math.sqrt(dataLowerLimit[a]/Math.PI)
                     dataOffset = dataRange*guiControls.smoothness;

                     dataOut[i][a] = ((Math.sqrt(dataIn[i][a]/Math.PI)+dataOffset)-Math.sqrt(dataLowerLimit[a]/Math.PI))*((maxRadius-minRadius)/((Math.sqrt(dataUpperLimit[a]/Math.PI)+2*dataOffset)-Math.sqrt(dataLowerLimit[a]/Math.PI))) + minRadius;
                     */
                }
            }

            console.log(dataOut);
        }

        mapping();


        function draw()
        {
            if(dataSelectionLength == 0)
            {
                document.getElementById('content').style.color = "#777777";
                document.getElementById('content').innerHTML = "No Attribute Selected"
            }
            else
            {
                drawingFinal.drawAll(dataSelectionLength, baseCircleRadius, circleStroke, armWidth, dataOut[counter], textMargin, names[counter], fontSize, attributes,fontSizeLabel,'content',signToggle,holderToggle,dataSelection);

            }
        }

        draw();

        document.getElementById('number').innerHTML = (counter+1) + '/' + numberOfObjects;


        // ATTRIBUTES CONTROLS /////////////////////////////////////
        for(var i=0; i<attributes.length; i++)
        {
            var box = document.createElement('div');
            var content = document.createElement('input');
            content.type = 'text';
            content.className = 'attributeInput';
            //content.setAttribute("maxlength",'10');

            var checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'checkBox';
            checkbox.setAttribute("checked",'true');
            
            content.value = attributes[i];
            box.appendChild(checkbox);
            document.getElementById('attributeList').appendChild(box);
            box.appendChild(content);
            document.getElementById('attributeList').appendChild(box);

        }

        function checkBoxState()
        {
            dataSelection = [];

            var checks = document.querySelectorAll('.checkBox');
            for(var i = 0; i < checks.length; i++)
            {
                if(checks[i].checked){
                    dataSelection.push(i);
                }
            }

            dataSelectionLength = dataSelection.length;

            draw();
        }

        //Apply button's eventListener function
        function refresh()
        {
            var inputs = document.querySelectorAll('.attributeInput');
            for (var i = 0; i < inputs.length; i++)
            {
                attributes[i] = inputs[i].value;
            }

            draw();

        }

        document.getElementById('refresh').addEventListener("click",refresh);

        //Add eventListener to class of checkBox
        checkBoxClass = document.getElementsByClassName('checkBox');

        for (var i = 0; i < checkBoxClass.length; i++)
        {
            checkBoxClass[i].addEventListener("click", checkBoxState);
        }

        /////////////////

        // GUI CONTROLS ////////////////////////////////////////////
        var guiControls = new function () {

            this.BaseRadius = baseCircleRadius;
            this.ArmWidth = armWidth*2;
            this.Margin = textMargin;
            this.Stroke = circleStroke;
            this.FontSize = fontSize;
            this.LabelFontSize = fontSizeLabel;
            this.thickness = thickness;
            this.smoothness = smoothness;
            this.AlignmentToggle = true;
            this.holderToggle = true;

            this.reset = function ()
            {

                guiControls.BaseRadius = 35;
                guiControls.ArmWidth = 10;
                guiControls.Margin = 4;
                guiControls.Stroke = 2;
                guiControls.FontSize = 10;
                guiControls.LabelFontSize = 3.5;
                guiControls.thickness = 2;
                guiControls.smoothness = 0;
                guiControls.AlignmentToggle = true;
                guiControls.holderToggle = true;

                baseCircleRadius = guiControls.BaseRadius;
                maxRadius = guiControls.BaseRadius;
                textMargin = guiControls.Margin;
                armWidth = guiControls.ArmWidth/2;
                minRadius = guiControls.ArmWidth/2;
                circleStroke = guiControls.Stroke;
                fontSize = guiControls.FontSize;
                thickness = guiControls.thickness;
                fontSizeLabel = guiControls.LabelFontSize;
                signToggle = guiControls.AlignmentToggle;
                holderToggle = guiControls.holderToggle;
                smoothness = guiControls.smoothness;

                mapping();
                draw();
            };

        };

        var datGUI = new dat.GUI({ autoPlace: false });
        document.getElementById('gui').appendChild(datGUI.domElement);

        datGUI.add(guiControls,'BaseRadius',25,50).listen().name('Base Radius').onFinishChange(function (value)
        {
            baseCircleRadius = value;
            maxRadius = value;
            mapping();
            draw();
        });

        datGUI.add(guiControls,'ArmWidth',5,15).listen().name('Arm Width').onFinishChange(function (value)
        {
            armWidth = value/2;
            minRadius = value/2;
            mapping();
            draw();
        });

        datGUI.add(guiControls,'Stroke',1,5).listen().name('Stroke').onFinishChange(function (value)
        {
            circleStroke = value;
            draw();
        });



        datGUI.add(guiControls,'FontSize',1,20).listen().name('Font Size').onFinishChange(function (value)
        {
            fontSize = value;
            draw();
        });

        datGUI.add(guiControls,'LabelFontSize',3,6).listen().name('Label Font Size').onFinishChange(function (value)
        {
            fontSizeLabel = value;
            draw();
        });

        datGUI.add(guiControls,'Margin',4,10).listen().name('Label Offset').onFinishChange(function (value)
        {
            textMargin = value;
            draw();
        });

        datGUI.add(guiControls,'AlignmentToggle').listen().name('Reference Sign').onFinishChange(function (value)
        {
            signToggle = value;
            draw();
        });
        datGUI.add(guiControls,'holderToggle').listen().name('Holder Toggle').onFinishChange(function (value)
        {
            holderToggle = value;
            draw();
        });
        datGUI.add(guiControls,'thickness',2,10).listen().name('Thickness').onFinishChange(function (value)
        {
            thickness = value;
            draw();
        });
        datGUI.add(guiControls,'smoothness',0,1,0.1).listen().name('Smoothness').onFinishChange(function (value)
        {
            smoothness = value;
            mapping();
            draw();
        });

        datGUI.add(guiControls,'reset').name('Reset');

        //////////////////////////////////////////////////////////

        // NEXT - PREV Buttons + Range SLIDER/ ////////////////////////////////////
        
        function decrease()
        {

            if(counter > 0) --counter;

            draw();
            document.getElementById('number').innerHTML = (counter+1) + '/' + numberOfObjects
            document.getElementById('sliderBar').value = counter+1
        }

        function increase()
        {

            if(counter < numberOfObjects -1 ) ++counter;

            draw();
            document.getElementById('number').innerHTML = (counter+1) + '/' + numberOfObjects
            document.getElementById('sliderBar').value = counter+1
        }

        function slide()
        {
            counter = document.getElementById('sliderBar').value - 1;
            draw();
            document.getElementById('number').innerHTML = (counter+1) + '/' + numberOfObjects

        }

        var prevButton = document.getElementById('prev');
        prevButton.addEventListener("click", decrease);

        var nextButton = document.getElementById('next');
        nextButton.addEventListener("click", increase);

        var slider = document.getElementById('sliderBar');
        slider.min = 1;
        slider.max = names.length;
        slider.addEventListener("input", slide);

        /////////////////////////////////////////////////////////////////////

        ///SAVE BUTTON //////////////////////////////////////////////////////

        function save()
        {
            if(dataSelectionLength == 0)
            {
                alert('No model to be downloaded')
            }
            else
            {
                drawingFinal.downloadAll(dataSelectionLength, baseCircleRadius, circleStroke, armWidth, dataOut, textMargin, names, fontSize, attributes, fontSizeLabel,signToggle,holderToggle,dataSelection,thickness);
                document.getElementById('save-btnSign').disabled = true;
            }
        }

        document.getElementById('save-btnSign').addEventListener('click', save);


        /////////////////////////////////////////////////////////////////////


        ///CLEAR BUTTON /////////////////////////////////////////////////////

        function clear() {

            document.getElementById('labelSignFile').innerHTML = 'CHOOSE A FILE';
            document.getElementById('upSign').disabled = true;
            document.getElementById('clearSign').disabled = true;
            document.getElementById('save-btnSign').disabled = true;
            document.getElementById('fileSign').disabled = false;
            document.getElementById('fileSign').value = "";

            //Set the visibility of the container and hide the buttons
            document.getElementById('container').style.opacity = "0.6";
            document.getElementById('next').style.display = "none";
            document.getElementById('prev').style.display = "none";
            //Reshow the initial Message
            document.getElementById('content').style.color = "#777777";
            document.getElementById('content').innerHTML = 'PLEASE UPLOAD A CSV FILE';
            document.getElementById('number').innerHTML = '';
            //Clear the GUI Controller
            datGUI.destroy();
            //Clean Controller and Attribute DIVs
            document.getElementById('controllers').style.display = "none";
            document.getElementById('gui').innerHTML = '';
            document.getElementById('attributeList').innerHTML = '';
            //Clear the arrays for new data
            document.getElementById('prev').removeEventListener('click', decrease);
            document.getElementById('next').removeEventListener('click', increase);
            document.getElementById('refresh').removeEventListener('click',refresh);
            document.getElementById('save-btnSign').removeEventListener('click',save);

            //Reset the porgress bar
            //document.getElementById('myBar').style.width = 0 + '%';

            //Reset the slider
            document.getElementById('sliderBar').value = 1;
            document.getElementById('sliderBar').min = 0;
            document.getElementById('sliderBar').max = 0;

        }

        document.getElementById('clearSign').addEventListener('click', clear);

    }
    else
    {
        document.getElementById('content').style.color = "#ff0000";
        document.getElementById('content').innerHTML = 'PLEASE UPLOAD A VALID CSV FILE';
        document.getElementById('upSign').disabled = false;
        document.getElementById('clearSign').disabled = true;
    }

}

