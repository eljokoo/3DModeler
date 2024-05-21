// See below relevant imports for the functionality of the modeler
/* START FUNCTION IMPORTATION*/

import { addCube, addSphere, addTorus, addSphere2 } from './geometry.js'
import { addTetrahedron, addOctahedron, addIcosahedron } from './geometry.js'
import { rotateVector, makeQuaternion } from './quat.js'
import * as THREE from 'three'
import { DragControls } from 'three/addons/controls/DragControls.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js'
import Stats from 'three/examples/jsm/libs/stats.module.js'

/* END FUNCTION IMPORTATION*/


// set div containing rendering canvas
var container = document.getElementById( 'canvas' );

/* START INITIALISING VARIABLES */

// initialise  controls
let controls;
let intensity = 0.8; // Initialise light intensity

//0=camera mode, 1=drag mode, 2=vertex mode
let controlState;

// initialize scene
const scene = new THREE.Scene()
const exporter = new OBJExporter()
const stats = new Stats()

// initialise controls
function initializeControls() {
    controls = new OrbitControls(camera, renderer.domElement)
    controlState = 0;
    intensity = 0.8
    document.getElementById("button1").style.backgroundColor = "#ffffff"
    document.getElementById("button1").style.color = "black"
    document.getElementById("button1").style.fontWeight = "bold"
}

// initialize global lists
//shapeslist stores all of the shapes in the scene
var shapesList = []
//spherelist stores all of the spheres which are created in vertex movement mode
var sphereList = []
//vertexdict is used in vertex movement mode, see documentation of its functionality in its creation function
var vertexDict = {}
//initialize selectedShape -- use this for changing lots of stuff
let selectedShape = null;
//initialize 
let lightList = []

/* END INITIALISING VARIABLES */


/* START MODEL FUNCTIONALITY */

//x y z are desired increments in that direction
function moveVertex(shape, indexList, x, y, z){
    var currx = shape.geometry.attributes.position.getX(indexList[0])
    var curry = shape.geometry.attributes.position.getY(indexList[0])
    var currz = shape.geometry.attributes.position.getZ(indexList[0])
    
    // Iterate over indexList
    for (var i = 0; i < indexList.length; i++){
        //update list
        var sc;
        //here we initialize scale and check if it is null. if not, we set it to the right value, otherwise default to 1
        //only need to check one of the scales as they are all incremented the same in our implementation
        if (shape.scale.x != null) {
            sc = shape.scale.x
        }
        else {
            sc = 1
        }
        // Set new values and ensure that the position is updated
        shape.geometry.attributes.position.setX(indexList[i], currx + x/sc)
        shape.geometry.attributes.position.setY(indexList[i], curry + y/sc)
        shape.geometry.attributes.position.setZ(indexList[i], currz + z/sc)
        shape.geometry.attributes.position.needsUpdate = true
    }
}

// Initialise camera
const camera = new THREE.PerspectiveCamera(
    75,
    container.offsetWidth / container.offsetHeight,
    0.1,
    1000
)

// Set the camera position
function setCamera(x,y,z){
    camera.position.x = x;
    camera.position.y = y;
    camera.position.z = z;
}

setCamera(5, 5, 5)

// Add axes, input is compatible with add grid below
function addAxes(size){
    scene.add(new THREE.AxesHelper(size * 5))
}

// Add grid for the user interface 
function addGrid(size) {
    var grid = new THREE.GridHelper( size * 10, size * 5 )
    grid.position.y -= 0.001
    
    scene.add( grid )
}

// Convert xyz to a string for dictionary lookup
function makeString(x, y, z) {
    return x + "," + y + "," + z
}

// Convert back to a position, returns array
function makePos(stringy) {
    return stringy.split(",")
}

// For vertex movement mode, we need to build a dictionary which stores each of the vertices. The keys are the positions of the vertices, the values are the shape
// and a list of indices of the vertices at that position in the shape
function buildDict(shapesList) {
    // Initialise dictionary
    let dict = {}
    // Iterate through shapeslist and then the vertices of each shape in a nested for loop
    for (let i = 0; i < shapesList.length; i++) {
        for (let j = 0; j < shapesList[i].geometry.attributes.position.count; j++) {
            // Initialise new vector and store from the current shape
            let vec = new THREE.Vector3();
            vec.x = shapesList[i].geometry.attributes.position.getX(j)
            vec.y = shapesList[i].geometry.attributes.position.getY(j)
            vec.z = shapesList[i].geometry.attributes.position.getZ(j)
            
            // Bring local to world 
            shapesList[i].localToWorld( vec )
            
            // Create string for dictionary entry
            let stringy = makeString(vec.x, vec.y, vec.z)

            // If already in dict then push to indices, otherwise create a new pair
            if (stringy in dict) {
                dict[stringy].indices.push(j)
            } else {
                let pair = { 'shape': shapesList[i], 'indices': [j] }
                dict[stringy] = pair
            }
            
        }
    }
    // Return the dictionary once it's built
    return dict
}

// Using the above dict, we make spheres at each of the vertices
function buildSphereList(dict) {
    let sphereList = []
    for (let key in dict) {
        let position = makePos(key)
        sphereList.push(addSphere2(position[0], position[1], position[2]))
    }

    return sphereList
}

// Here we initialize globals vdict, sdict, and controls as needed to get things ready for vertex movement mode
function initializeVertexMode() {
    vertexDict = buildDict(shapesList)
    sphereList = buildSphereList(vertexDict)
    controls = new DragControls(sphereList, camera, renderer.domElement)
    // Add a sphere at each vertex of the shape
    for (var i in sphereList){
        scene.add(sphereList[i])
    }
}

// Initialise renderer
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( container.offsetWidth, container.offsetHeight );
container.appendChild( renderer.domElement );


// Add all the shapes from shapes list to the scene
function addShapes(){
    for (var i = 0; i < shapesList.length; i++){
        scene.add(shapesList[i])
    }  

}

// Function to toggle whether a shape is in wireframe mode or not, tethered to the UI 
function toggleSelectedShapeWireframe(){
    if (selectedShape != null){
        if (selectedShape.material.wireframe == false){
            selectedShape.material.wireframe = true;
        }
        else{
            selectedShape.material.wireframe = false;
        }
    }
}

// Initialise the toggle from the label given in the html file
const toggle = document.getElementById('toggle');
const label = document.querySelector('.switch');

// Add on-click event listener to the label
label.addEventListener('click', toggleSelectedShapeWireframe );

// Find an item's index in shapesList for use in, e.g., delete shape
function findShapeIndex(shape){
    // Iterate through shapes list returning the index
    for (var i = 0; i<shapesList.length; i++){
        if (shapesList[i] == shape){
            return i
        }
    }
    // If not in it then return null
    return null
}

// Funtion to set the colour of a shape
function setShapeColor(shape, color){
    // If not null then update colour
    if (shape != null) {
        shape.material.color = color
    } 
}

// Initialise colour picker, from to html
const colorPicker = document.getElementById( 'colorpicker' );

// Here we use the existing colorpicker and take its input to update the selectedShape's color
document.addEventListener('DOMContentLoaded', function() {
    // Add event listener for user input
    colorPicker.addEventListener('input', function() {
        // Get the color picker's value
        const colorValue = colorPicker.value;
        // Make it a three color object
        const useColor = new THREE.Color(colorValue);
        // Set shape color
        setShapeColor(selectedShape, useColor);
    });
});

// EVENT LISTENERS AND HTML UPDATES

// On window resize, we also resize the canvas
window.addEventListener('resize', onWindowResize, false)

// When we resize the window, update the projection matrix and update teh renderer and camera aspect, then render
function onWindowResize() {
    camera.updateProjectionMatrix()
    renderer.setSize(container.offsetWidth, container.offsetHeight)
    camera.aspect = container.offsetWidth / container.offsetHeight
    render()
}

// Runs every 10 milliseconds to update various elements of the HTML
setInterval(function(){

    // If there is a selected shape, we print its details
    if (selectedShape != null) {
        document.getElementById("shape-info").innerHTML = selectedShape.geometry.name + "<br>(" + selectedShape.position.x.toFixed(3) + ", " + selectedShape.position.y.toFixed(3) + ", " + selectedShape.position.z.toFixed(3) + ")";
    }

}, 10);

// Gets reference to elements of rotation function in the HTML
let rotate = document.getElementById("rotate")
let x = document.getElementById("x")
let y = document.getElementById("y")
let z = document.getElementById("z")

// Runs if rotate button is clicked
rotate.addEventListener("click", () => {
    if (x.value != null && y.value != null && z.value != null && selectedShape != null) {
        // For every vertex of the selected shape
        for (var k = 0; k < selectedShape.geometry.attributes.position.count; k++){
            var x1 = selectedShape.geometry.attributes.position.getX(k)
            var y1 = selectedShape.geometry.attributes.position.getY(k)
            var z1 = selectedShape.geometry.attributes.position.getZ(k)
            
            // We rotate the vertex based on quaternion
            let rotated = rotateVector([x1, y1, z1], makeQuaternion(x.value, y.value, z.value))

            selectedShape.geometry.attributes.position.setX(k, rotated[0])
            selectedShape.geometry.attributes.position.setY(k, rotated[1])
            selectedShape.geometry.attributes.position.setZ(k, rotated[2])
            selectedShape.geometry.attributes.position.needsUpdate = true
 
        }

        // If we are in vertex mode we update the spheres
        if (controlState == 2) {
            for (var i = 0; i < sphereList.length; i++){
                scene.remove(sphereList[i])
            }

            initializeVertexMode()
            var clickedPoint = new THREE.Vector3();

            // Event listener for when you click
            let center = ""
            controls.addEventListener('dragstart', function(event) {
                // Store the clicked coordinates
                clickedPoint.copy(event.object.position)

                center = makeString(clickedPoint.x, clickedPoint.y, clickedPoint.z)
            });
            
            controls.addEventListener('drag', function(event) {
                if (center != "") {
                        
                    moveVertex(vertexDict[center].shape, vertexDict[center].indices, event.object.position.x - clickedPoint.x, event.object.position.y - clickedPoint.y, event.object.position.z - clickedPoint.z)
                    
                    clickedPoint.copy(event.object.position)                            
                }
            });

            controls.addEventListener('dragend', function(event) {
                if (center != "") {
                    let endPoint = new THREE.Vector3();
                    endPoint.copy(event.object.position)

                    let pair = { 'shape': vertexDict[center].shape, 'indices': vertexDict[center].indices }
                    delete vertexDict[center]

                    vertexDict[makeString(endPoint.x, endPoint.y, endPoint.z)] = pair
                }
            });
        } 
    }
})

// Store from html UI, control modes
let cam = document.getElementById("button1")
let mov = document.getElementById("button2")
let ver = document.getElementById("button3")

// Add event listener on-click
cam.addEventListener("click", () => {
    // If control state is 0 then just return
    if (controlState == 0) {
        return
    }

    // Debugging -- dispose of prior control
    controls.dispose()

    // If control state is 2 then we can delete
    if (controlState == 2) {
        //delete the circles
        for (var i = 0; i < sphereList.length; i++){
            scene.remove(sphereList[i])
        }
    }  

    // Initialise orbits, then reset and update
    controls = new OrbitControls(camera, renderer.domElement)
    controls.reset()
    controls.update()

    document.getElementById("button1").style.backgroundColor = "#ffffff"
    document.getElementById("button1").style.color = "black"
    document.getElementById("button1").style.fontWeight = "bold"
    document.getElementById("button2").style.backgroundColor = "#333"
    document.getElementById("button2").style.color = "#fff"
    document.getElementById("button2").style.fontWeight = "normal"
    document.getElementById("button3").style.backgroundColor = "#333"
    document.getElementById("button3").style.color = "#fff"
    document.getElementById("button3").style.fontWeight = "normal"
    // New drag control for a given shape, the list of spheres being the vertices
    //controls = new DragControls(spheresList, camera, render.domElement)
    controlState = 0
})

// Add on-click event listener for move mode, just return if control state is 1
mov.addEventListener("click", () => {
    if (controlState == 1) {
        return
    }
    
    // Dispose controls
    controls.dispose()

    // If control state is 2
    if (controlState == 2) {
        //delete the circles
        for (var i = 0; i < sphereList.length; i++){
            scene.remove(sphereList[i])
        }
    }

    // Create new drag controls and set state to 1
    controls = new DragControls(shapesList, camera, renderer.domElement)
    controlState = 1
    // Add event listener for drag start
    controls.addEventListener('dragstart', function(event) {
        // Store the clicked coordinates
        selectedShape = event.object
        let color = new THREE.Color(selectedShape.material.color)
        colorPicker.value = "#" + color.getHexString()

        // Ensure wireframe clicker is in right position
        if (selectedShape.material.wireframe == false) {
            toggle.checked = false
        } else {
            toggle.checked = true
        }
    });

    document.getElementById("button1").style.backgroundColor = "#333"
    document.getElementById("button1").style.color = "#fff"
    document.getElementById("button1").style.fontWeight = "normal"
    document.getElementById("button3").style.backgroundColor = "#333"
    document.getElementById("button3").style.color = "#fff"
    document.getElementById("button3").style.fontWeight = "normal"
    document.getElementById("button2").style.backgroundColor = "#ffffff"
    document.getElementById("button2").style.color = "black"
    document.getElementById("button2").style.fontWeight = "bold"
})

// Add event listener for vertex mode on-click
ver.addEventListener("click", () => {
    if (controlState == 2) {
        return
    }
    
    // Dispose of prior controls
    controls.dispose()

    // Now initialise vertex mode and set control state to 2, store the curerntly clicked point
    initializeVertexMode()
    controlState = 2
    var clickedPoint = new THREE.Vector3();

    // Event listener for when you click
    let center = ""
    controls.addEventListener('dragstart', function(event) {
        // Store the clicked coordinates
        clickedPoint.copy(event.object.position)
        // Store the center of the point as a string, for the UI 
        center = makeString(clickedPoint.x, clickedPoint.y, clickedPoint.z)
    });
    
    // Add event listener on drag
    controls.addEventListener('drag', function(event) {
        // If the center string isn't empty
        if (center != "") {
            // Move vertex   
            moveVertex(vertexDict[center].shape, vertexDict[center].indices, event.object.position.x - clickedPoint.x, event.object.position.y - clickedPoint.y, event.object.position.z - clickedPoint.z)
            // And update clicked point
            clickedPoint.copy(event.object.position)                            
        }
    });
    
    // Add event listener for the end of the dragging
    controls.addEventListener('dragend', function(event) {
        if (center != "") {
            // Initialise vec to represent end point, then copy in object position
            let endPoint = new THREE.Vector3();
            endPoint.copy(event.object.position)
            // Initialise pair and then delete the old position in the dicitonary
            let pair = { 'shape': vertexDict[center].shape, 'indices': vertexDict[center].indices }
            delete vertexDict[center]
            // Store pair in vertex dict
            vertexDict[makeString(endPoint.x, endPoint.y, endPoint.z)] = pair
        }
    });
    
    document.getElementById("button1").style.backgroundColor = "#333"
    document.getElementById("button1").style.color = "#fff"
    document.getElementById("button1").style.fontWeight = "normal"
    document.getElementById("button2").style.backgroundColor = "#333"
    document.getElementById("button2").style.color = "#fff"
    document.getElementById("button2").style.fontWeight = "normal"
    document.getElementById("button3").style.backgroundColor = "#ffffff"
    document.getElementById("button3").style.color = "black"
    document.getElementById("button3").style.fontWeight = "bold"
})

// Add event listener for export text click
document.getElementById("export").addEventListener("click", () => {
    const data = exporter.parse( scene );

    // Create an element which allows downloading the data parsed by the exporter
    // inspired by examples in https://stackoverflow.com/questions/3665115/how-to-create-a-file-in-memory-for-user-to-download-but-not-through-server
    const a = document.createElement('a') // Create "a" element
    const blob = new Blob([data], {type: "model/obj"})
    const url = URL.createObjectURL(blob)
    a.setAttribute('href', url)
    a.setAttribute('download', "scene.obj")
    a.click()
}) 

// USER INPUT HANDLER

// Add shape based on user input, and handle multiple other inputs
function userAddShape() {
    document.onkeydown = function(e) {
        switch (e.key) {
            case "c":
                var c = addCube(0,0,0)
                shapesList.push(c)
                scene.add( shapesList.at(-1) );
                break;
            case "s":
                shapesList.push(addSphere(1,10,10))
                scene.add( shapesList.at(-1) );
                break;
            case "t":
                shapesList.push(addTorus(0,0,0))
                scene.add( shapesList.at(-1) );
                break;
            case "h":
                shapesList.push(addTetrahedron(0,0,0))
                scene.add( shapesList.at(-1) );
                break;
            case "o":
                shapesList.push(addOctahedron(0,0,0))
                scene.add( shapesList.at(-1) );
                break;
            case "i":
                shapesList.push(addIcosahedron(0,0,0))
                scene.add( shapesList.at(-1) );
                break;
            // Delete mode
            case "d":
                // If you have selected a shape to delete 
                if (selectedShape != null) {
                    // find the index of that shape and splice it out of the list, then remove
                    var i = findShapeIndex(selectedShape)
                    shapesList.splice(i, 1)
                    scene.remove(selectedShape)
                    if (controlState == 2) { // if we are in vertex movement mode, we need to recalculate stuff
                        for (var i = 0; i < sphereList.length; i++){
                            scene.remove(sphereList[i])
                        }
                        initializeVertexMode()
                    }

                    // If there are other shapes in the scene, pressing d will delete them 
                    if (shapesList.length > 0) {
                        selectedShape = shapesList[0]
                    } // Otherwise wait for the user to select another shape  
                    else {
                        selectedShape = null
                        document.getElementById("shape-info").innerHTML = "No shape<br>(0, 0, 0)";
                    }
                }
                break;

            // Move lookat position with arrow keys
            case "ArrowLeft":
                if (controlState == 0) {
                    controls.target.set(controls.target.x - 0.5, controls.target.y, controls.target.z)
                    controls.update()
                }
                
                break;
            case "ArrowRight":
                if (controlState == 0) {
                    controls.target.set(controls.target.x + 0.5, controls.target.y, controls.target.z)
                    controls.update()
                }

                break;
            case "ArrowUp":
                if (controlState == 0) {
                    controls.target.set(controls.target.x, controls.target.y, controls.target.z - 0.5)
                    controls.update()
                }

                break;
            case "ArrowDown":
                if (controlState == 0) {
                    controls.target.set(controls.target.x, controls.target.y, controls.target.z + 0.5)
                    controls.update()
                }
               
                break;
                
            // Reset lookat position to origin
            case "r":
                controls.reset();
                break;
            
            // Scale up the size of the shape
            case "q":
                if (selectedShape != null){
                    if (selectedShape.scale.x < 80) {
                        selectedShape.scale.x += 0.1
                        selectedShape.scale.y += 0.1
                        selectedShape.scale.z += 0.1
                    }
                    if (controlState == 2) {
                        for (var i = 0; i < sphereList.length; i++){
                            scene.remove(sphereList[i])
                        }
                        initializeVertexMode()
                        var clickedPoint = new THREE.Vector3();
                        // Event listener for when you click
                        let center = ""
                        controls.addEventListener('dragstart', function(event) {
                            // Store the clicked coordinates
                            clickedPoint.copy(event.object.position)

                            center = makeString(clickedPoint.x, clickedPoint.y, clickedPoint.z)
                        });
                        
                        controls.addEventListener('drag', function(event) {
                            if (center != "") {
                                    
                                moveVertex(vertexDict[center].shape, vertexDict[center].indices, event.object.position.x - clickedPoint.x, event.object.position.y - clickedPoint.y, event.object.position.z - clickedPoint.z)
                                
                                clickedPoint.copy(event.object.position)                            
                            }
                        });

                        controls.addEventListener('dragend', function(event) {
                            if (center != "") {
                                let endPoint = new THREE.Vector3();
                                endPoint.copy(event.object.position)

                                let pair = { 'shape': vertexDict[center].shape, 'indices': vertexDict[center].indices }
                                delete vertexDict[center]

                                vertexDict[makeString(endPoint.x, endPoint.y, endPoint.z)] = pair
                            }
                        });
                    }
                    
                }
                break;
            // Scale down the size of the shape
            case "a":
                if (selectedShape != null){
                    if (selectedShape.scale.x > 0.2) {
                        selectedShape.scale.x -= 0.1
                        selectedShape.scale.y -= 0.1
                        selectedShape.scale.z -= 0.1
                    }
                    if (controlState == 2) {
                        for (var i = 0; i < sphereList.length; i++){
                            scene.remove(sphereList[i])
                        }
                        initializeVertexMode()
                        var clickedPoint = new THREE.Vector3();
                        let center = ""
                        controls.addEventListener('dragstart', function(event) {
                            // Store the clicked coordinates
                            clickedPoint.copy(event.object.position)

                            center = makeString(clickedPoint.x, clickedPoint.y, clickedPoint.z)
                        });
                        
                        controls.addEventListener('drag', function(event) {
                            if (center != "") {
                                    
                                moveVertex(vertexDict[center].shape, vertexDict[center].indices, event.object.position.x - clickedPoint.x, event.object.position.y - clickedPoint.y, event.object.position.z - clickedPoint.z)
                                
                                clickedPoint.copy(event.object.position)                            
                            }
                        });

                        controls.addEventListener('dragend', function(event) {
                            if (center != "") {
                                let endPoint = new THREE.Vector3();
                                endPoint.copy(event.object.position)

                                let pair = { 'shape': vertexDict[center].shape, 'indices': vertexDict[center].indices }
                                delete vertexDict[center]

                                vertexDict[makeString(endPoint.x, endPoint.y, endPoint.z)] = pair
                            }
                        });
                    }
                }
                break;  
        }
    }
}

// Add statistics
function addStats(){
    document.body.appendChild(stats.dom)
    
}

// Main animation function
function animate() {
    requestAnimationFrame(animate)
    render()
    stats.update()
}

// Render function
function render() {
    renderer.render(scene, camera)
    stats.update()
}

// Read in light intensity from the slider in the html doc
document.addEventListener('DOMContentLoaded', () => {
    const readIntensity = document.getElementById('range');
    
    readIntensity.addEventListener('input', () => {
        // Divide by 10 and add a small constant in order to properly scale intensity for desired output
        intensity = (readIntensity.value / 10) + 0.2
        // Set light intensity
        setLightIntensity(intensity)
    });
});

// Function to add a light to the scene, x,y,z will be hardcoded, intensity responding to the slider in the UI 
function addLight(x,y,z,intensity) {
    var light = new THREE.PointLight(0xffffff, 1);
    light.position.set(x, y, z);
    light.intensity = intensity
    lightList.push(light)
}

// Adds the lights into the list
function setLightScene() {
    for (var i = 0; i < lightList.length; i++){
        scene.add(lightList[i]);
    }
}

// Sets the light intensity to whichever number is passed
function setLightIntensity(intensity) {
    for (var i = 0; i < lightList.length; i++){
        lightList[i].intensity = intensity
    }
}

// Creates the lights in the scene. Here we hardcode instead of giving the user the ability to create light sources as we thought this
// made for a better user experience. Lighting is arbitrarily defined here
var light1 = addLight(10, 10, 10, intensity)
var light2 = addLight(10, 10, -10, intensity)
var light3 = addLight(10, -10, -10, intensity)
var light4 = addLight(-10, -10, -10, intensity)

// main function, handles calling all methods that deal with scene and rendering
function main(){
    addStats()
    initializeControls() 
    setLightScene()

    addGrid(10)
    addAxes(10)

    userAddShape()
    addShapes()

    animate()
}

main()