
var gl;
var program;

var N = 7;  // The number of cubes will be (2N+1)^3 pre:5
var N3=10;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [ 0, 0, 0 ];
var paused = 0;
var depthTest = 1;
var eyePosition = [ 0, 0, 2 ];

// event handlers for mouse input (borrowed from "Learning WebGL" lesson 11)
var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;

var ball=0;

//random function -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
function usefloor(min,max) {

  return Math.floor(Math.random()*(max-min+1)+min);

  }


//stars-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
var starx=[]; //x,y,x,num
var stary=[];
var starz=[]
for(var i=0; i<100; i++)
  {
    starx.push(usefloor(-N3, N3));
    stary.push(usefloor(-N3, N3));
    starz.push(usefloor(-N3, N3));
  }

//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

var moonRotationMatrix = mat4();
function init() {  
  
  var canvas = document.getElementById("gl-canvas");  
  
  gl = initWebGL(canvas);       
  
  if (gl) {  
  
    gl.clearColor(1.0, 0.0, 0.0, 1.0);                        
  
    gl.enable(gl.DEPTH_TEST);                                
  
    gl.depthFunc(gl.LEQUAL);                                  
  
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);       
  
  }  
  
}
window.onload = init; 
function handleMouseDown(event) {
    mouseDown = true;
    lastMouseX = event.clientX;
	lastMouseY = event.clientY;
}

function handleMouseUp(event) {
    mouseDown = false;
}

function handleMouseMove(event) {
    if (!mouseDown) {
      return;
    }

    var newX = event.clientX;
    var newY = event.clientY;
    var deltaX = newX - lastMouseX;
    var newRotationMatrix = rotate(deltaX/10, 0, 1, 0);

    var deltaY = newY - lastMouseY;
    newRotationMatrix = mult(rotate(deltaY/10, 1, 0, 0), newRotationMatrix);

    moonRotationMatrix = mult(newRotationMatrix, moonRotationMatrix);

    lastMouseX = newX
    lastMouseY = newY;
}

// event handlers for button clicks
function rotateX() {
	paused = 0;
    axis = xAxis;
};
function rotateY() {
	paused = 0;
	axis = yAxis;
};
function rotateZ() {
	paused = 0;
	axis = zAxis;
};


// ModelView and Projection matrices
var modelingLoc, viewingLoc, projectionLoc, lightMatrixLoc;
var modeling, viewing, projection;

var volumeLoc;
var ballLoc;

var numVertices  = 36;

var pointsArray = [];
var colorsArray = [];
var normalsArray = [];
var bnormalsArray = [];
var tangentArray = [];
var texCoordsArray = [];

var texture;

var texCoord = [
    vec2(0, 2),
    vec2(0, 0),
    vec2(1, 0),
    vec2(1, 2)
];

var vertices = [
	vec4( -0.5, -0.5,  0.5, 1 ),
	vec4( -0.5,  0.5,  0.5, 1 ),
	vec4(  0.5,  0.5,  0.5, 1 ),
	vec4(  0.5, -0.5,  0.5, 1 ),
	vec4( -0.5, -0.5, -0.5, 1 ),
	vec4( -0.5,  0.5, -0.5, 1 ),
	vec4(  0.5,  0.5, -0.5, 1 ),
	vec4(  0.5, -0.5, -0.5, 1 )
];

// Using off-white cube for testing
var vertexColors = [
	vec4( 1.0, 1.0, 0.8, 1.0 ),  
	vec4( 1.0, 1.0, 0.8, 1.0 ),  
	vec4( 1.0, 1.0, 0.8, 1.0 ),  
	vec4( 1.0, 1.0, 0.8, 1.0 ),  
	vec4( 1.0, 1.0, 0.8, 1.0 ),  
	vec4( 1.0, 1.0, 0.8, 1.0 ),  
	vec4( 1.0, 1.0, 0.8, 1.0 ),  
	vec4( 1.0, 1.0, 0.8, 1.0 )
];

var lightPosition = vec4( 0.0, 100.0, 200.0, 1.0 );

var materialAmbient = vec4( 0.8, 0.8, 0.8, 1.0 );
var materialDiffuse = vec4( 0.8, 0.8, 0.8, 1.0);
var materialSpecular = vec4( 1.0, 1.0, 	0.0, 1.0 );
var materialShininess = 20.0;

function configureTexture( image ) {
    texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
}

function quad(a, b, c, d) {

     var t1 = subtract(vertices[b], vertices[a]);
     var t2 = subtract(vertices[c], vertices[b]);
     var normal = cross(t1, t2);  // cross returns vec3
     var normal = vec4(normal);
     normal = normalize(normal);
	 
	 var tangent = vec4(t1);
	 tangent = normalize(tangent);
	 
     var bnormal = cross(tangent, normal);
	 var bnormal = vec4(bnormal);
	 bnormal = normalize(bnormal);

    pointsArray.push(vertices[a]); 
	 colorsArray.push(vertexColors[a]);
     normalsArray.push(normal); 
	 bnormalsArray.push(bnormal); 
	 tangentArray.push(tangent);
     texCoordsArray.push(texCoord[0]);
    pointsArray.push(vertices[b]); 
	 colorsArray.push(vertexColors[b]);
     normalsArray.push(normal); 
	 bnormalsArray.push(bnormal); 
	 tangentArray.push(tangent);
     texCoordsArray.push(texCoord[1]);
    pointsArray.push(vertices[c]); 
	 colorsArray.push(vertexColors[c]);
     normalsArray.push(normal);   
     bnormalsArray.push(bnormal); 
	 tangentArray.push(tangent);	 
     texCoordsArray.push(texCoord[2]);

    pointsArray.push(vertices[a]);  
	 colorsArray.push(vertexColors[a]);
     normalsArray.push(normal); 
     bnormalsArray.push(bnormal); 
	 tangentArray.push(tangent);	
     texCoordsArray.push(texCoord[0]);
    pointsArray.push(vertices[c]); 
	 colorsArray.push(vertexColors[c]);
     normalsArray.push(normal); 
     bnormalsArray.push(bnormal); 
	 tangentArray.push(tangent);		 
     texCoordsArray.push(texCoord[2]);
    pointsArray.push(vertices[d]); 
	 colorsArray.push(vertexColors[d]);
     normalsArray.push(normal);
	 bnormalsArray.push(bnormal); 
	 tangentArray.push(tangent);	
     texCoordsArray.push(texCoord[3]);	 
}


function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

var analyser;
var frequencyData = new Uint8Array();

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

 //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
 // Experimenting with HTML5 audio
 
  var context = new AudioContext();
  var audio = document.getElementById('myAudio');
  var audioSrc = context.createMediaElementSource(audio);
  var sourceJs = context.createScriptProcessor(2048); // createJavaScriptNode() deprecated.
  

  analyser = context.createAnalyser();
  
  // we could configure the analyser: e.g. analyser.fftSize (for further infos read the spec)
    analyser.smoothingTimeConstant = 0.6;
	analyser.fftSize = 512;

  // we have to connect the MediaElementSource with the analyser 
	audioSrc.connect(analyser);
	analyser.connect(sourceJs);
	sourceJs.buffer = audioSrc.buffer;
	sourceJs.connect(context.destination);
	audioSrc.connect(context.destination);

 	sourceJs.onaudioprocess = function(e) {
		// frequencyBinCount tells you how many values you'll receive from the analyser
		frequencyData = new Uint8Array(analyser.frequencyBinCount);
		analyser.getByteFrequencyData(frequencyData);
	};

  //audio.play();
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

	//
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 0.0 );
    
    //  Load shaders and initialize attribute buffers
    
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

	// Generate pointsArray[], colorsArray[] and normalsArray[] from vertices[] and vertexColors[].
	// We don't use indices and ELEMENT_ARRAY_BUFFER (as in previous example)
	// because we need to assign different face normals to shared vertices.
	colorCube();
    
    // vertex array attribute buffer
    
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // color array atrribute buffer
    
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    // normal array atrribute buffer

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

	var bnBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bnBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(bnormalsArray), gl.STATIC_DRAW );
	
	var vBNormal = gl.getAttribLocation( program, "vBiNormal" );
    gl.vertexAttribPointer( vBNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vBNormal );
	
	var tanBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tanBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(tangentArray), gl.STATIC_DRAW );
	
	var vTangent = gl.getAttribLocation( program, "vTangent" );
    gl.vertexAttribPointer( vTangent, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTangent );
    // texture-coordinate array atrribute buffer

    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );
    
    var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );

    //
    // Initialize a texture
    //
    var image = new Image();
    image.onload = function() { 
        configureTexture( image );
    }
    image.src = "bump.jpg";

	// uniform variables in shaders
    modelingLoc   = gl.getUniformLocation(program, "modelingMatrix"); 
    viewingLoc    = gl.getUniformLocation(program, "viewingMatrix"); 
    projectionLoc = gl.getUniformLocation(program, "projectionMatrix"); 
    lightMatrixLoc= gl.getUniformLocation(program, "lightMatrix"); 

	volumeLoc = gl.getUniformLocation(program, "volume");
  ballLoc = gl.getUniformLocation(program, "ball");


    gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"), 
       flatten(lightPosition) );
    gl.uniform4fv( gl.getUniformLocation(program, "materialAmbient"),
       flatten(materialAmbient));
    gl.uniform4fv( gl.getUniformLocation(program, "materialDiffuse"),
       flatten(materialDiffuse) );
    gl.uniform4fv( gl.getUniformLocation(program, "materialSpecular"), 
       flatten(materialSpecular) );	       
    gl.uniform1f( gl.getUniformLocation(program, "shininess"), materialShininess);

    //event listeners for buttons 
    document.getElementById( "xButton" ).onclick = rotateX;
    document.getElementById( "yButton" ).onclick = rotateY;
    document.getElementById( "zButton" ).onclick = rotateZ;
    document.getElementById( "pButton" ).onclick = function() {paused=!paused;};
    //document.getElementById( "dButton" ).onclick = function() {depthTest=!depthTest;};
	
	// event handlers for mouse input (borrowed from "Learning WebGL" lesson 11)
	canvas.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
    document.onmousemove = handleMouseMove;

      render();
};

function render() {
	modeling = mult(rotate(theta[xAxis], 1, 0, 0),
	                mult(rotate(theta[yAxis], 0, 1, 0),rotate(theta[zAxis], 0, 0, 1)));
  gl.uniform4fv( gl.getUniformLocation(program, "materialAmbient"),
       flatten(materialAmbient));
  gl.uniform4fv( gl.getUniformLocation(program, "materialDiffuse"),
       flatten(materialDiffuse) );
  gl.uniform4fv( gl.getUniformLocation(program, "materialSpecular"), 
       flatten(materialSpecular) );     

	if (paused)	modeling = moonRotationMatrix;
	
	viewing = lookAt(eyePosition, [0,0,0], [0,1,0]);

	projection = perspective(45, 1.0, 1.0, 3.0);

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

  if (! paused) theta[axis] += 0.5; //2.0
	//if (depthTest) gl.enable(gl.DEPTH_TEST); else gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.DEPTH_TEST);
  gl.uniformMatrix4fv( viewingLoc,    0, flatten(viewing) );
	gl.uniformMatrix4fv( projectionLoc, 0, flatten(projection) );
	gl.uniformMatrix4fv( lightMatrixLoc,0, flatten(moonRotationMatrix) );

	// update data in frequencyData
    analyser.getByteFrequencyData(frequencyData);

	
  
	var N2 = 2*N+1;
	var step = 1.0/N2;
	var size = step * 0.6; //pre:0.6

/*
	for (i=-N; i<=N; i++) {
		// render frame based on values in frequencyData

		//for (j=-N; j<=N; j++) {
    for (j=-0; j<=0; j++) {
			//for (k=-0; k<=0; k++) {
      //for (k=-N; k<=N; k++) { 
      for (k=-0; k<=0; k++) {           
				//var cloned = mult(mult(translate(step*Math.cos(i * 2 * Math.PI), step* Math.sin(i * 2 * Math.PI), step*k), scale(size, size, size)), modeling);
        //var cloned = mult(mult(translate(step*i, step*j, step*k), scale(size, size, size)), modeling);
        var cloned = mult(modeling, mult(translate(step*i, step*j, step*k), scale(size, size, size)));
        //var cloned = mult(modeling, mult(translate(step*Math.cos(i * 100 * Math.PI), step* Math.sin(i * 100 * Math.PI), step*k), scale(size, size, size)));
				gl.uniform1f( volumeLoc, frequencyData[Math.floor(256/N2)*(i+N)] /255 * N*2 );  //add*2
				gl.uniformMatrix4fv( modelingLoc, 0, flatten(cloned) );
				gl.drawArrays( gl.TRIANGLES, 0, numVertices );
			}
		}
	}
  */

  /*
  for (i=0; i<=360; i+=30) {
        var angle = i/180*Math.PI;
        var cloned = mult(modeling, mult(translate(step*Math.cos(angle), step*Math.sin(angle), step), scale(size, size, size)));
        gl.uniform1f( volumeLoc, frequencyData[Math.floor(256/N2)*(i+N)] /255 * N*2 );  //add*2
        gl.uniformMatrix4fv( modelingLoc, 0, flatten(cloned) );
        gl.drawArrays( gl.TRIANGLES, 0, numVertices );
        
  }*/

//clone-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  
  var j=N;
  for (i=0; i<=N; i++) {
        var cloned = mult(modeling, mult(translate(step*i, step*j, 0), scale(size, size, size)));
        gl.uniform1f( volumeLoc, frequencyData[Math.floor(256/N2)*(i+N)] /255 * N*2 );  //add*2
        gl.uniformMatrix4fv( modelingLoc, 0, flatten(cloned) );
        gl.drawArrays( gl.TRIANGLES, 0, numVertices );
        j--;
  }
  
  j=0;
  for (i=N; i>=0; i--) {
        var cloned = mult(modeling, mult(translate(step*i, step*j, 0), scale(size, size, size)));
        gl.uniform1f( volumeLoc, frequencyData[Math.floor(256/N2)*(i+N)] /255 * N*2 );  //add*2
        gl.uniformMatrix4fv( modelingLoc, 0, flatten(cloned) );
        gl.drawArrays( gl.TRIANGLES, 0, numVertices );
        j--;
  }

  j=-N;
  for (i=0; i>=-N; i--) {
        var cloned = mult(modeling, mult(translate(step*i, step*j, 0), scale(size, size, size)));
        gl.uniform1f( volumeLoc, frequencyData[Math.floor(256/N2)*(i+N)] /255 * N*2 );  //add*2
        gl.uniformMatrix4fv( modelingLoc, 0, flatten(cloned) );
        gl.drawArrays( gl.TRIANGLES, 0, numVertices );
        j++;
  }
  j=0;
  for (i=-N; i<=0; i++) {
        var cloned = mult(modeling, mult(translate(step*i, step*j, 0), scale(size, size, size)));
        gl.uniform1f( volumeLoc, frequencyData[Math.floor(256/N2)*(i+N)] /255 * N*2 );  //add*2
        gl.uniformMatrix4fv( modelingLoc, 0, flatten(cloned) );
        gl.drawArrays( gl.TRIANGLES, 0, numVertices );
        j++;
  }


//stars-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
for (i=0; i<100; i++) {
        if(usefloor(0, 10)<8){
        var cloned = mult(modeling, mult(translate( step*starx[i], step*stary[i], step*starz[i]), scale(0.005, 0.005, 0.005)));

        gl.uniform1f( volumeLoc, 0);  //add*2
        gl.uniformMatrix4fv( modelingLoc, 0, flatten(cloned) );
        gl.drawArrays( gl.TRIANGLES, 0, numVertices );
      }
}
  
//whiteline-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  for (i=-10; i<=10; i++) {

  for(j=-10; j<=10; j++){
        if(usefloor(0, 1000)<2 && frequencyData[200] )
        //if(usefloor(0, 1000)<2 && frequencyData[160])

        {
        var cloned = mult(modeling, mult(translate( step*i, step*j, 0), scale(0.01, 0.01, 0.01)));

        gl.uniform1f( volumeLoc, frequencyData[200]*2);  //add*2
        gl.uniformMatrix4fv( modelingLoc, 0, flatten(cloned) );
        gl.drawArrays( gl.TRIANGLES, 0, numVertices );
      }
        }
  }


//middle ball-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

gl.uniform1f( ballLoc, 1.0);  

var NewAmbient = vec4( 1, 0.5, 0.5, 1.0 );
var NewDiffuse = vec4(0.8, 0.8, 0.8, 1.0);
var NewSpecular = vec4(10.0, 1.0, 1.0, 1.0);

gl.uniform1f( volumeLoc, 0);  //add*2
gl.uniform4fv( gl.getUniformLocation(program, "materialAmbient"),flatten(NewAmbient) );
gl.uniform4fv( gl.getUniformLocation(program, "materialDiffuse"),flatten(NewDiffuse) );
gl.uniform4fv( gl.getUniformLocation(program, "materialSpecular"),flatten(NewSpecular) );

for(j=-N/5;j<=N/5;j+=0.15)
{
 for(i=-N/5;i<=N/5;i+=0.15)
 {
   for(k=0;k<=0.9;k+=0.15){
     if(i*i+j<=(N/5)-k&&i*i-j<=(N/5)-k&&j*j+i<=(N/5)-k&j*j-i<=(N/5)-k)
     {
       var cloned = mult(modeling, mult(translate(step*i, step*j, step*k), scale(size*0.2, size*0.2, size*0.2)));
       gl.uniformMatrix4fv( modelingLoc, 0, flatten(cloned) );
       gl.drawArrays( gl.TRIANGLES, 0, numVertices );

     }
   }
   for(k=0;k>=-0.9;k-=0.15)
   {
     if(i*i+j<=(N/5)+k&&i*i-j<=(N/5)+k&&j*j+i<=(N/5)+k&j*j-i<=(N/5)+k)
     {
       var cloned = mult(modeling, mult(translate(step*i, step*j, step*k), scale(size*0.2, size*0.2, size*0.2)));
       gl.uniformMatrix4fv( modelingLoc, 0, flatten(cloned) );
       gl.drawArrays( gl.TRIANGLES, 0, numVertices );
     }
   }
 }
}
gl.uniform1f( ballLoc, 0.0);  

//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

/*circle
var twoPi = 2*Math.PI;
var objectsCount = 12;
var radius = N/2;

// you want to align objectsCount objects on the circular path
// with constant distance between neighbors
var change = twoPi/objectsCount;
for (var i=0; i < twoPi; i+=change) {
  var x = radius*Math.cos(i);
  var y = radius*Math.sin(i);
  // rotation of object in radians
  //var rotation = i;

var cloned = mult(modeling, mult(translate(step*x, step*y, step), scale(size, size, size)));
        gl.uniform1f( volumeLoc, frequencyData[Math.floor(256/N2)*(i+N)] /255 * N*2 );  //add*2
        gl.uniformMatrix4fv( modelingLoc, 0, flatten(cloned) );
        gl.drawArrays( gl.TRIANGLES, 0, numVertices );
// set the CSS properties to calculated values
}
*/

    requestAnimFrame( render );
}
