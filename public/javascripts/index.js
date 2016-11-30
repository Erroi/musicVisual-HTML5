function $(s) {
    return document.querySelectorAll(s);
}

var lis = $("#list li");

//从服务器端加载歌名
for (var i = 0; i < lis.length; i++) {
    lis[i].onclick = function() {
        for (var j = 0; j < lis.length; j++) {
            lis[j].className = "";
        }
        this.className = "selected";
        load('/media/' + this.title);
    }
}

//从服务器端获取数据
var xhr = new XMLHttpRequest();

//播放音频
var ac = new(window.AudioContext || window.webkitAudioContext)(); //兼容创建AudioContext对象

//创建音量大小
var gainNode = ac[ac.createGain ? "createGain" : "createGainNode"]();
gainNode.connect(ac.destination); //连接到destination

//停止其他播放
var source = null;

var count = 0;

//分析音频
var analyser = ac.createAnalyser();
analyser.fftSize = 512;
analyser.connect(ac.destination);

//box音频可视化
var box = $("#box")[0];
var size = 128;
analyser.fftSize = size * 2;
var height, width;
var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');
box.appendChild(canvas);
var Dots = [];

function random(m, n) {
    return Math.round(Math.random() * (n - m) + m);
}

function getDots() {
    for (var i = 0; i < size; i++) {
        var x = random(0, width);
        var y = random(0, height);
        var color = "rgba(" + random(0, 255) + "," + random(0, 255) + "," + random(0, 255) + ",0.2)";
        Dots.push({
            x: x,
            y: y,
            dx:random(1,4),
            color: color
        });
    }
}

var line;

function resize() {
    height = box.clientHeight;
    width = box.clientWidth;
    canvas.height = height;
    canvas.width = width;
    line = ctx.createLinearGradient(0, 0, 0, height); //创建渐线
    line.addColorStop(0, 'red')
    line.addColorStop(0.5, 'yellow');
    line.addColorStop(1, 'green');
    //ctx.fillStyle = line;
    getDots();
}
resize();

window.onresize = resize;

//draw()距行可视化图形
function draw(arr) {
    ctx.clearRect(0, 0, width, height)
    var w = width / size;
    ctx.fillStyle = line;
    for (var i = 0; i < size; i++) {
            var o = Dots[i];
        if (draw.type == 'column') {
            var h = arr[i] / 256 * height;
            ctx.fillRect(w * i, height - h, w * 0.6, h); //柱状图
        } else if (draw.type == 'dot') {
            ctx.beginPath();    //声明重新绘制
            var r = 10 + arr[i] / 256 * (height>width ? width : height) / 10;
            ctx.arc(o.x, o.y, r, 0, Math.PI * 2, true);
            //ctx.strokeStyle = "#fff";
            //ctx.stroke();
            //创建渐变色
            var g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, r);
            g.addColorStop(0, "#fff");
            g.addColorStop(1, o.color);
            ctx.fillStyle = g;
            ctx.fill();
            o.x += o.dx;
            o.x = o.x > width ? 0 : o.x;
        }
    }
}
draw.type = "column";


//圆点可视化切换
var types = $('#type li');
for (var i = 0; i < types.length; i++) {
    types[i].onclick = function() {
        for (var j = 0; j < types.length; j++) {
            types[j].className = "";
        }
        this.className = "selected";
        draw.type = this.getAttribute('data-type');
    }
}


function load(url) {
    var n = ++count;
    source && source[source.stop ? 'stop' : 'noteOff']();
    xhr.abort(); //停止上次的请求
    xhr.open('GET', url);
    xhr.responseType = "arraybuffer";
    xhr.onload = function() {
        if (n != count) return;
        ac.decodeAudioData(xhr.response, function(buffer) { //解码存在xhr.respnse的资源，
            if (n != count) return;
            var bufferSource = ac.createBufferSource(); //成功时创建bufferSource
            bufferSource.buffer = buffer; //定义bufferSource的资源
            bufferSource.connect(analyser);
            //bufferSource.connect(gainNode);
            //bufferSource.connect(ac.destination);           //所有的都必须连接到 destination属性上
            bufferSource[bufferSource.start ? "start" : "noteOn"](0); //播放资源 兼容
            source = bufferSource;
            //visualize();
        }, function(err) {
            console.log(err);
        });
    }
    xhr.send();
}

function changeVolume(percent) {
    //gainNode.gain.value = percent * percent;
    gainNode.gain.setValue = percent * percent;
}

$('#volume')[0].onchange = function() {
    //changeVolume(this.value/this.max);
    changeVolume(this.setValue / this.max);
}
$('#volume')[0].onchange();

//分析音频
function visualize() {
    var arr = new Uint8Array(analyser.frequencyBinCount);
    //analyser.getByteFrequencyData(arr);     //得到音频数据个数
    //console.log(arr);
    //实时分析音频数据个数
    requestAnimationFrame = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame;

    function v() {
        analyser.getByteFrequencyData(arr);
        //console.log(arr);
        draw(arr);
        requestAnimationFrame(v);
    }

    requestAnimationFrame(v);
}

visualize(); //拿到外面 不至于重复调用
