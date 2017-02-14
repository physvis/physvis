document.getElementById('content3D').innerHTML = 'PLEASE UPLOAD A CSV FILE';

var file3D = document.getElementById("file3D");
file3D.addEventListener('change', function(){
    if(file3D.files.length > 0)
    {
        document.getElementById("up").disabled = false;
        //var backsLash= file3D.value.lastIndexOf("\\");
        //var filename = file3D.value.substr(backsLash+1);
        document.getElementById('label3DFile').innerHTML = file3D.value;
    }

});

document.getElementById('up').addEventListener('click',function () {

    //Disable the upload button
    document.getElementById("up").disabled = true;

    //Parse the CSV file
    var p = new Promise(function(resolve, reject)
    {
        Papa.parse(file3D.files[0],
            {header: false, dynamicTyping: true, worker: true, complete: function(results)
            {
                resolve(results.data)
            }
            });
    });

    p.then(function (response)
    {
        //console.log("Parse results:", response);
        document.getElementById('content3D').innerHTML = '';
        new3D(response)
    })

});