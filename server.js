var http = require('http'); //http模块
var fs = require('fs'); //fs模块,文件读写
var path = require('path'); //path模块,路径
var mime = require('mime'); //根据文件扩展名推出mime类型
var cache = {}; //缓存文件内容的对象

function send404(response) { //发送404错误
    response.writeHead(404, { 'Content-Type': 'text/plain' });
    response.write('Error 404: resource not found.');
    response.end();
}

function sendFile(response, filePath, fileContents) { //文件数据服务函数,发送文件的内容
    response.writeHead(
        200, { "conteng-type": mime.lookup(path.basename(filePath)) }
    );
    response.end(fileContents);
}

function serveStatic(response, cache, absPath) { //静态文件服务
    if (cache[absPath]) { //检查文件是否在内存中
        sendFile(response, absPath, cache[absPath]); //从内存中返回文件
    } else {
        fs.exists(absPath, function(exists) { //检查文件是否存在
            if (exists) {
                fs.readFile(absPath, function(err, data) { //从硬盘中读取文件
                    if (err) {
                        send404(response); //都没有就返回404错误
                    } else {
                        cache(absPath) = data;
                        sendFile(response, absPath, data);
                    }
                });
            }
        });
    }
}

//创建服务器
var server = http.createServer(function(request, response) { //创建http服务器,用callback函数定义对每个请求的处理
    var filePath = false;

    if (request.url == '/') {
        filePath = 'public/index.html'; //确定返回的默认html文件
    } else {
        filePath = 'public' + request.url; //将url转化为文件的相对路径
    }
    var absPath = './' + filePath;
    serveStatic(response, cache, absPath); //返回静态文件
});

server.listen(3000, function() {
    console.log("Server listening on port 3000.");
});