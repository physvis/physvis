document.getElementById('content').innerHTML = 'PLEASE UPLOAD A CSV FILE';


var fileSign = document.getElementById("fileSign");
fileSign.addEventListener('change', function()
{
    if(fileSign.files.length > 0)
    {
        document.getElementById("upSign").disabled = false;
        document.getElementById('labelSignFile').innerHTML = fileSign.value;
    }
});

document.getElementById('upSign').addEventListener('click',function () {

    //Disable the upload button
    var uploadButton = document.getElementById("upSign");
    uploadButton.disabled = true;

    //Parse the CSV file
    var p = new Promise(function(resolve, reject)
    {
        Papa.parse(fileSign.files[0],
            {header: false, dynamicTyping: true, worker: true, complete: function(results)
            {
                resolve(results.data)
            }
            });
    });

    p.then(function (response)
    {
        //console.log("Parse results:", response);
        newDrawing(response)
    })
    
});