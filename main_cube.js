// mainCube.js
"use strict";

var mainCubePositionsArray = [];
var mainCubeVertices = [
    vec4(-0.03, -0.35,  0.02, 1.0),  // front-bottom-left
    vec4(-0.03,  0.35,  0.02, 1.0),  // front-top-left
    vec4( 0.03,  0.35,  0.02, 1.0),  // front-top-right
    vec4( 0.03, -0.35,  0.02, 1.0),  // front-bottom-right
    vec4(-0.03, -0.35, -0.02, 1.0),  // back-bottom-left
    vec4(-0.03,  0.35, -0.02, 1.0),  // back-top-left
    vec4( 0.03,  0.35, -0.02, 1.0),  // back-top-right
    vec4( 0.03, -0.35, -0.02, 1.0)   // back-bottom-right
];

function quadMainCube(a, b, c, d) {
    mainCubePositionsArray.push(mainCubeVertices[a]);
    mainCubePositionsArray.push(mainCubeVertices[b]);
    mainCubePositionsArray.push(mainCubeVertices[c]);
    mainCubePositionsArray.push(mainCubeVertices[a]);
    mainCubePositionsArray.push(mainCubeVertices[c]);
    mainCubePositionsArray.push(mainCubeVertices[d]);
}

function colorMainCube() {
    quadMainCube(1, 0, 3, 2);
    quadMainCube(2, 3, 7, 6);
    quadMainCube(3, 0, 4, 7);
    quadMainCube(6, 5, 1, 2);
    quadMainCube(4, 5, 6, 7);
    quadMainCube(5, 4, 0, 1);
}
