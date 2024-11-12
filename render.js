// render.js
"use strict";

var lamp = function() {
    var canvas;
    var gl;

    var numPositionsMain = 36;
    var numPositionsUpper = 36;
    var modelViewMatrixLoc, projectionMatrixLoc, colorUniformLoc;
    var modelViewMatrix, projectionMatrix;
    var eye;

    var near = 0.1;
    var far = 10.0;
    var radius = 2.0;
    var theta = 0.0;
    var phi = 0.0;
    var fovy = 45.0;
    var aspect;

    const at = vec3(0.0, 0.0, 0.0);
    const up = vec3(0.0, 1.0, 0.0);

    function init() {
        canvas = document.getElementById("gl-canvas");

        var realWidth = canvas.clientWidth;
        var realHeight = canvas.clientHeight;
        var pixelRatio = window.devicePixelRatio || 1;
        canvas.width = realWidth * pixelRatio;
        canvas.height = realHeight * pixelRatio;

        gl = canvas.getContext("webgl2");
        if (!gl) alert("WebGL 2.0 isn't available");

        gl.viewport(0, 0, canvas.width, canvas.height);
        aspect = canvas.width / canvas.height;
        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        gl.enable(gl.DEPTH_TEST);

        var program = initShaders(gl, "vertex-shader", "fragment-shader");
        gl.useProgram(program);

        // Build the main and upper cubes
        colorMainCube();
        colorUpperCube();

        // Create and load buffer for the main cube
        var vBufferMain = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBufferMain);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(mainCubePositionsArray), gl.STATIC_DRAW);

        // Create and load buffer for the upper cube
        var vBufferUpper = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBufferUpper);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(upperCubePositionsArray), gl.STATIC_DRAW);

        var positionLoc = gl.getAttribLocation(program, "aPosition");
        gl.enableVertexAttribArray(positionLoc);

        modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");
        projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");
        colorUniformLoc = gl.getUniformLocation(program, "uColor");

        render(vBufferMain, vBufferUpper, positionLoc);
    }

    function render(vBufferMain, vBufferUpper, positionLoc) {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        eye = vec3(radius * Math.sin(theta) * Math.cos(phi),
                   radius * Math.sin(theta) * Math.sin(phi),
                   radius * Math.cos(theta));

        projectionMatrix = perspective(fovy, aspect, near, far);
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

        // Draw the main cube
        gl.bindBuffer(gl.ARRAY_BUFFER, vBufferMain);
        gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
        modelViewMatrix = mult(lookAt(eye, at, up), translate(0.0, 0.0, 0.0));
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        gl.uniform4fv(colorUniformLoc, flatten(vec4(0.0, 0.0, 0.0, 1.0))); // Black color
        gl.drawArrays(gl.TRIANGLES, 0, numPositionsMain);

        // Draw the upper cube, aligned and pivoted at the top of the main cube
        gl.bindBuffer(gl.ARRAY_BUFFER, vBufferUpper);
        gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);

        // Step 1: Translate the upper cube to align its bottom with the top of the main cube
        var alignUpperCubeWithMainCube = translate(-0.175, 0.5, 0.0); // Adjust based on mainCube's height

        // Step 2: Apply the rotation at this pivot point (top of the main cube)
        var rotationAroundPivot = rotateZ(45);

        // Combine the translation and rotation to pivot exactly at the connection point
        var upperCubeTransform = mult(alignUpperCubeWithMainCube, rotationAroundPivot);
        modelViewMatrix = mult(lookAt(eye, at, up), upperCubeTransform);

        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        gl.uniform4fv(colorUniformLoc, flatten(vec4(0.5, 0.5, 0.5, 1.0))); // Gray color
        gl.drawArrays(gl.TRIANGLES, 0, numPositionsUpper);

        requestAnimationFrame(() => render(vBufferMain, vBufferUpper, positionLoc));
    }

    // Initialize the rendering process
    init();
};

lamp();
