// general set up
const URL = "https://teachablemachine.withgoogle.com/models/0Xf2aiL3N/";
let model, webcam, labelContainer, maxPredictions;

// canvas and context for camCanvas 
var camCanvas = document.getElementById("camCanvas");
var camContext = camCanvas.getContext("2d");
var camCanvasWidth, camCanvasHeight;

// canvas and context for oceanCanvas
var oceanCanvas = document.getElementById("oceanCanvas");
var oceanContext = oceanCanvas.getContext("2d");
var oceanCanvasWidth, oceanCanvasHeight;

// canvas and context for flowerCanvas
var flowerCanvas = document.getElementById("flowerCanvas");
var flowerContext = flowerCanvas.getContext("2d");
var flowerCanvasWidth, flowerCanvasHeight;

// resize canvas when broswer size changes
window.onload = window.onresize = function resize() {
    
    // for camCanvas
    camCanvasWidth = (window.innerWidth)/4.8;
    camCanvasHeight = 3*camCanvasWidth/3;
    camCanvas.setAttribute("width", camCanvasWidth);
    camCanvas.setAttribute("height", camCanvasHeight);
  
    // for oceanCanvas
    oceanCanvasWidth = 3.05*(window.innerWidth/4);
    oceanCanvasHeight = window.innerHeight;
    oceanCanvas.setAttribute("width", oceanCanvasWidth);
    oceanCanvas.setAttribute("height", oceanCanvasHeight);
    oceanContext.translate(0, window.innerHeight);
    oceanContext.rotate(-90*Math.PI/180);
    
    // for the flowerCanvas
    flowerCanvasWidth = 3*(window.innerWidth/4);
    flowerCanvasHeight = window.innerHeight;
    flowerCanvas.setAttribute("width", flowerCanvasWidth);
    flowerCanvas.setAttribute("height", flowerCanvasHeight);
    
}

// functions for webcam

async function init() {
    
    var description = document.getElementById("description");
    description.style.display = "none";
    
    var startButton = document.getElementById("startButton");
    startButton.style.display = "none";
    
    var backButton = document.getElementById("backButton");
    backButton.style.display = "block";
    
    camCanvas.style.display = "block";
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
    model = await tmPose.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    // function to setup a webcam
    const flip = true; // whether to flip the webcam
    webcam = new tmPose.Webcam(camCanvas.width, camCanvas.height, flip);
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(loop);
    labelContainer = document.getElementById("label");
    
    for (let i = 0; i < maxPredictions; i++) { // and class labels
        labelContainer.appendChild(document.createElement("div"));
    }
    
}

async function loop(timestamp) {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);    
}

async function predict() {
    // Prediction #1: run input through posenet
    // estimatePose can take in an image, video or canvas html element
    const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
    // Prediction 2: run input through teachable machine classification model
    const prediction = await model.predict(posenetOutput);

    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + (prediction[i].probability.toFixed(2));
        labelContainer.childNodes[i].innerHTML = classPrediction;
    }
    
    // if the Pua class is in between 0.5 to 1.0
    if (prediction[0] && prediction[0].probability.toFixed(2) > 0.5) {
        
        // laptop kept on crashing when using this while loop
        //while (prediction[0].probability.toFixed(2) > 0.5) {
            setInterval (function() {
                addFlower();    
            }, 2000);
        //}
        
    }
    
    // finally draw the poses
    drawPose(pose);

} // if statement in here
    
function drawPose(pose) {
    if (webcam.canvas) {
        camContext.drawImage(webcam.canvas, 0, 0);
        // draw the keypoints and skeleton
        if (pose) {
            const minPartConfidence = 0.5;
            tmPose.drawKeypoints(pose.keypoints, minPartConfidence, camContext);               tmPose.drawSkeleton(pose.keypoints, minPartConfidence, camContext);
        }
    }
}

// code for flower

var flowerArray = [];

// choose a random x and y coordinate on the flowerCanvas
var xArray = [];
var yArray = [];

for(var x = flowerCanvas.width*0.5; x < flowerCanvas.width*3; x += 50){
    xArray.push(x);
}

for(var y = flowerCanvas.height*0.5; y < flowerCanvas.height*2.3; y += 50){
    yArray.push(y);
}

var randomX = xArray[Math.floor(Math.random() * xArray.length)]+100;
var randomY = yArray[Math.floor(Math.random() * yArray.length)];

// choose a random radius between 30 and 60
var radius = Math.floor((Math.random()*31)+30);

// choose a random [n, d] combo
var combination = [
    [2, 1], [3, 1], [4, 1], [5, 1],[6, 1],
    [3, 2],
    [5, 3],[7, 3]
    //[5, 2], [7, 2], [2, 3], [4, 3], [3, 4],[7, 4]
];           

var randomCombo = combination[Math.floor(Math.random()*combination.length)]; 
var n = randomCombo[0];
var d = randomCombo[1];

// choose a random color
var colorArray = ["#C8FF64", "#FF7800", "#50E696", "#8C50C8", "#005000", "#FF82AA", "#FF502D", "#FF7800", "#50E696", "#FF5082"];

var randomColor = colorArray[Math.floor(Math.random()*colorArray.length)];

function drawFlower() {
            
    var twoPi = Math.PI*2;
    var points = 1000;
    var spacing = twoPi/points;
    
    flowerContext.clearRect(0, 0, flowerCanvasWidth, flowerCanvasHeight);
    flowerContext.beginPath();
    //flowerContext.fillStyle = "blue";
    //flowerContext.fillRect(300*3, 300*2.2, 10, 10);
    
    for (var i = 0; i < points; i++) {
                
        flowerContext.lineTo((Math.cos(spacing*i*n)*Math.cos(spacing*i*d)*radius)+randomX,(Math.cos(spacing*i*n)*Math.sin(spacing*i*d)*radius)+randomY);
           
    }
    
    flowerContext.fillStyle = randomColor;
    flowerContext.fill();
    //flowerContext.strokeStyle = randomStrokeColor;
    //flowerContext.lineWidth = 2;
    //flowerContext.stroke();
            
    flowerContext.closePath();
    
    flowerContext.beginPath();
    flowerContext.fillStyle = "#FFE13C";
    flowerContext.arc(randomX, randomY, 10, 0, twoPi);
    flowerContext.fill();
    flowerContext.closePath();
    
    //requestAnimationFrame(drawFlower);
            
}

function addFlower() {

    var newFlower = {
        randomX: xArray[Math.floor(Math.random() * xArray.length)]+100,
        randomY: yArray[Math.floor(Math.random() * yArray.length)],
        radius: Math.floor((Math.random()*31)+30),
        n: randomCombo[0],
        d: randomCombo[1],
        randomColor: colorArray[Math.floor(Math.random()*colorArray.length)]
    };
    
    // 30 flowers into flowerArray
    for (var i = 0; i < 30; i++) {
        flowerArray.push(newFlower);
    } 
    
    requestAnimationFrame(drawFlower);

}
    
/*
var strokeColor = ["#C8FF64", "#FFE13C", "#FF7800", "#50E696", "#8C50C8", "#005000"];
var fillColor = ["#FF82AA", "#FF502D", "#C8FF64", "#FFE13C", "#FF7800", "#50E696", "#FF5082"];
var randomStrokeColor = strokeColor[Math.floor(Math.random()*7)];
var randomFillColor = fillColor[Math.floor(Math.random()*8)];
more flower variables
var radius = Math.sin(counter)*100;        
requestAnimationFrame(drawFlower);
*/

// code for ocean wave

var waves;

function loadOcean() {
    waves = new Waves(oceanCanvas, oceanCanvasHeight, oceanCanvasWidth);
    setInterval( "runOcean()", 80);
}
       
function runOcean(){
   waves.update( );
   waves.draw( );
}
       
window.addEventListener('load', loadOcean, false);

function Wave(oceanCanvas, $x, $colour){
    
    this.force = 0;
    this.wavePower = 30;
    this.count = $x;
    this.x = $x + Waves.globalX;
    this.alpha = 0.4;
   
    this.update = function(){
        this.x = $x + Waves.globalX - oceanCanvasWidth*0.485;
        this.force = Math.sin(this.count);
        this.count += 0.03;
    }
    
    this.draw = function(){
        oceanContext.fillStyle = "rgba(252, 222, 168, 0.1)";
        oceanContext.fillRect(0, 0, oceanCanvasHeight, oceanCanvasWidth);
        oceanContext.fillStyle = "rgba("+$colour+", "+this.alpha+")";
        oceanContext.beginPath();
        oceanContext.moveTo(0, this.x);
        oceanContext.quadraticCurveTo(Waves.width/4, this.x + (this.wavePower * this.force), Waves.width / 2, this.x);
        oceanContext.quadraticCurveTo(Waves.width * 0.75, this.x - (this.wavePower * this.force), Waves.width, this.x);
        oceanContext.lineTo(Waves.width, Waves.height);
        oceanContext.lineTo(0, Waves.height);
        oceanContext.lineTo(0, this.x);
        oceanContext.closePath();
        oceanContext.fill();
    }
}

function Waves($canvas, $width, $height){
    this.numberOfWaves = 5;
    this.waveGap = 20;
    this.width = Waves.width = $width;
    this.height = Waves.height = $height;
    Waves.globalX = 0;
    this.move = 0;
   
    this.colour = 85+", "+181+", "+202;
    
    this.wavesArray = new Array();
   
    this.beginingX = Waves.height / 2;
    
    while(this.numberOfWaves--){
        this.wavesArray.push(new Wave($canvas, this.beginingX, this.colour));
        this.beginingX += this.waveGap;
    }
   
    this.update = function(){
        var bL = this.wavesArray.length;
        while( bL-- ){
            this.wavesArray[ bL ].update( );
        }
        Waves.globalX += this.move;
        if(Waves.globalX > (Waves.height / 2)-50){
            this.move = -1;
        }else if(Waves.globalX < -(Waves.height / 2)){
            this.move = 1;
        }
    }
   
    this.draw = function(){
        oceanContext.save();
        var bL = this.wavesArray.length;
        while( bL-- ){
            this.wavesArray[ bL ].draw( );
        }
        oceanContext.restore();
    }
}