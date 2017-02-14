function dataArrangefunc(names,attributes,dataLowerLimit,dataUpperLimit,dataIn,data)
{
    
    if(String(data[0][0]).toLowerCase() == 'auto')
    {
        // Put parsed CSV data into arrays
        for(var i = 0; i < data[0].length - 1; i++)
        {
            attributes[i] = data[0][i+1];
        }

        var dataInAlias = [];

        for(var i = 0; i < data.length - 1; i++)
        {
            names[i] = data[i+1][0];

            dataIn[i] = new Array(data[1].size);

            for(var a = 0; a < data[1].length-1 ; a++)
            {
                dataIn[i][a] = data[i+1][a+1];
            }

            dataInAlias = [];
            dataInAlias = dataIn;
        }


        dummy = [];

        for(var a = 0; a < dataInAlias[0].length ; a++)
        {
            for(var i = 0; i< dataInAlias.length; i++)
            {
                dummy.push(dataInAlias[i][a]);
            }
            
            dataLowerLimit.push(Math.min.apply(Math, dummy));
            dataUpperLimit.push(Math.max.apply(Math, dummy));

            dummy = [];
        }

        //Make sure that attributes and names are in string type
        for(var i=0; i<attributes.length;i++)
        {
            attributes[i] = String(attributes[i]);
        }

        for(var i=0; i<names.length;i++)
        {
            names[i] = String(names[i]);
        }

    }

    else if(String(data[0][0]).toLowerCase() == 'manual')
    {
        // Put parsed CSV data into arrays
        for(var i = 0; i < data[0].length - 1; i++)
        {
            attributes[i] = data[0][i+1];
        }


        for(var i = 0; i < data.length - 3; i++)
        {
            names[i] = data[i+1][0];

            dataIn[i] = new Array(data[1].size);

            for(var a = 0; a < data[1].length-1 ; a++)
            {
                dataIn[i][a] = data[i+1][a+1];
            }
        }


        for(var i = 0; i< data[0].length - 1; i++)
        {
            dataLowerLimit.push(data[data.length-2][i+1]);
            dataUpperLimit.push(data[data.length-1][i+1]);
        }

        //Make sure that attributes and names are in string type
        for(var i=0; i<attributes.length;i++)
        {
            attributes[i] = String(attributes[i]);
        }

        for(var i=0; i<names.length;i++)
        {
            names[i] = String(names[i]);
        }
    }

    else if(String(data[0][0]).toLowerCase() == '%')
    {
        // Put parsed CSV data into arrays
        for(var i = 0; i < data[0].length - 1; i++)
        {
            attributes[i] = data[0][i+1];
        }


        for(var i = 0; i < data.length - 1; i++)
        {
            names[i] = data[i+1][0];

            dataIn[i] = new Array(data[1].size);

            for(var a = 0; a < data[1].length-1 ; a++)
            {
                dataIn[i][a] = data[i+1][a+1];
            }
        }

        for(var i = 0; i< dataIn.length; i++)
        {
            dataLowerLimit.push(0);
            dataUpperLimit.push(100);
        }

        //Make sure that attributes and names are in string type
        for(var i=0; i<attributes.length;i++)
        {
            attributes[i] = String(attributes[i]);
        }

        for(var i=0; i<names.length;i++)
        {
            names[i] = String(names[i]);
        }
    }

}