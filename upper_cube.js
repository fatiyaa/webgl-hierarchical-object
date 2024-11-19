// upperCube.js
"use strict";

var upperCubePositionsArray = [];
var texCoordsUpperCubeArray = [];

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

var texCoord = [
    vec2(0, 0),
    vec2(-0.7071, 0.7071),
    vec2(0, 1.4142),
    vec2(0.7071, 0.7071)
];

function quadUpperCube(a, b, c, d) {
    upperCubePositionsArray.push(upperCubeVertices[a]);
    texCoordsUpperCubeArray.push(texCoord[0]);

    upperCubePositionsArray.push(upperCubeVertices[b]);
    texCoordsUpperCubeArray.push(texCoord[1]);

    upperCubePositionsArray.push(upperCubeVertices[c]);
    texCoordsUpperCubeArray.push(texCoord[2]);

    upperCubePositionsArray.push(upperCubeVertices[a]);
    texCoordsUpperCubeArray.push(texCoord[0]);

    upperCubePositionsArray.push(upperCubeVertices[c]);
    texCoordsUpperCubeArray.push(texCoord[2]);

    upperCubePositionsArray.push(upperCubeVertices[d]);
    texCoordsUpperCubeArray.push(texCoord[3]);
}

function colorUpperCube() {
    quadUpperCube(1, 0, 3, 2);
    quadUpperCube(2, 3, 7, 6);
    quadUpperCube(3, 0, 4, 7);
    quadUpperCube(6, 5, 1, 2);
    quadUpperCube(4, 5, 6, 7);
    quadUpperCube(5, 4, 0, 1);
}
