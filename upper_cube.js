// upperCube.js
"use strict";

var upperCubePositionsArray = [];
var upperCubeVertices = [
    vec4(-0.03, -0.25,  0.02, 1.0),  // front-bottom-left
    vec4(-0.03,  0.25,  0.02, 1.0),  // front-top-left
    vec4( 0.03,  0.25,  0.02, 1.0),  // front-top-right
    vec4( 0.03, -0.25,  0.02, 1.0),  // front-bottom-right
    vec4(-0.03, -0.25, -0.02, 1.0),  // back-bottom-left
    vec4(-0.03,  0.25, -0.02, 1.0),  // back-top-left
    vec4( 0.03,  0.25, -0.02, 1.0),  // back-top-right
    vec4( 0.03, -0.25, -0.02, 1.0)   // back-bottom-right
];

function quadUpperCube(a, b, c, d) {
    upperCubePositionsArray.push(upperCubeVertices[a]);
    upperCubePositionsArray.push(upperCubeVertices[b]);
    upperCubePositionsArray.push(upperCubeVertices[c]);
    upperCubePositionsArray.push(upperCubeVertices[a]);
    upperCubePositionsArray.push(upperCubeVertices[c]);
    upperCubePositionsArray.push(upperCubeVertices[d]);
}

function colorUpperCube() {
    quadUpperCube(1, 0, 3, 2);
    quadUpperCube(2, 3, 7, 6);
    quadUpperCube(3, 0, 4, 7);
    quadUpperCube(6, 5, 1, 2);
    quadUpperCube(4, 5, 6, 7);
    quadUpperCube(5, 4, 0, 1);
}
