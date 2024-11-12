// render.js
"use strict";

var lamp = function() {
    var canvas;
    var gl;

    var numPositionsMain = 36;
    var numPositionsUpper = 36;
    var numPositionsBase = baseCylinderPositionsArray.length;
    var numPositionsCone = conePositionsArray.length;
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

        // Build the main, upper cubes, base cylinder, and cone shade
        colorMainCube();
        colorUpperCube();
        colorCone();

        // Create and load buffer for the main cube
        var vBufferMain = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBufferMain);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(mainCubePositionsArray), gl.STATIC_DRAW);

        // Create and load buffer for the upper cube
        var vBufferUpper = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBufferUpper);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(upperCubePositionsArray), gl.STATIC_DRAW);

        // Create and load buffer for the base cylinder
        var vBufferBase = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBufferBase);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(baseCylinderPositionsArray), gl.STATIC_DRAW);

        // Create and load buffer for the cone shade
        var vBufferCone = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBufferCone);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(conePositionsArray), gl.STATIC_DRAW);

        var positionLoc = gl.getAttribLocation(program, "aPosition");
        gl.enableVertexAttribArray(positionLoc);

        modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");
        projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");
        colorUniformLoc = gl.getUniformLocation(program, "uColor");

        render(vBufferMain, vBufferUpper, vBufferBase, vBufferCone, positionLoc);
    }

    function render(vBufferMain, vBufferUpper, vBufferBase, vBufferCone, positionLoc) {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        eye = vec3(radius * Math.sin(theta) * Math.cos(phi),
                   radius * Math.sin(theta) * Math.sin(phi),
                   radius * Math.cos(theta));

        projectionMatrix = perspective(fovy, aspect, near, far);
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

        // Draw the base cylinder
        gl.bindBuffer(gl.ARRAY_BUFFER, vBufferBase);
        gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
        modelViewMatrix = mult(lookAt(eye, at, up), translate(0.0, -0.4, 0.0));
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        gl.uniform4fv(colorUniformLoc, flatten(vec4(0.3, 0.3, 0.3, 1.0))); // Gray color for the base
        gl.drawArrays(gl.TRIANGLES, 0, numPositionsBase);

        // Draw the main cube
        gl.bindBuffer(gl.ARRAY_BUFFER, vBufferMain);
        gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
        modelViewMatrix = mult(lookAt(eye, at, up), translate(0.0, 0.0, 0.0));
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        gl.uniform4fv(colorUniformLoc, flatten(vec4(0.0, 0.0, 0.0, 1.0))); // Black color
        gl.drawArrays(gl.TRIANGLES, 0, numPositionsMain);

        // Draw the upper cube
        gl.bindBuffer(gl.ARRAY_BUFFER, vBufferUpper);
        gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
        var upperCubeTransform = mult(translate(-0.175, 0.5, 0.0), rotateZ(45));
        modelViewMatrix = mult(lookAt(eye, at, up), upperCubeTransform);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        gl.uniform4fv(colorUniformLoc, flatten(vec4(0.5, 0.5, 0.5, 1.0))); // Gray color
        gl.drawArrays(gl.TRIANGLES, 0, numPositionsUpper);

        // Draw the cone shade hanging down from the top of the upper cube
        gl.bindBuffer(gl.ARRAY_BUFFER, vBufferCone);
        gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);

        // Step 1: Rotate the cone 180 degrees to point downward
        var coneRotation = rotateX(180);

        // Step 2: Position the cone relative to the top of the upper cube
        var coneTranslation = mult(translate(-0.65, 0.65, 0.0), rotateZ(90)); // Adjust to align with the top of the upper cube

        // Combine transformations: rotate cone and then translate to align with upper cube
        var coneTransform = mult(coneTranslation, coneRotation);
        modelViewMatrix = mult(lookAt(eye, at, up), coneTransform);

        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        gl.uniform4fv(colorUniformLoc, flatten(vec4(0.8, 0.8, 0.8, 1.0))); // Yellow color for the cone shade
        gl.drawArrays(gl.TRIANGLES, 0, numPositionsCone);

        requestAnimationFrame(() => render(vBufferMain, vBufferUpper, vBufferBase, vBufferCone, positionLoc));
    }

    // Initialize the rendering process
    init();
};

lamp();
