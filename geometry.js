// Geometry for basic 3d modeler
import * as THREE from 'three';

//creating some color constants for shape creation
const blue = new THREE.Color("rgb(0, 0, 255)");
const red = new THREE.Color("rgb(255, 0, 0)");

// Returns a cube
function addCube(x,y,z){
    var geometry = new THREE.BoxGeometry( 2,2,2);
    var material = new THREE.MeshStandardMaterial( { color: blue } );
    var cube = new THREE.Mesh( geometry, material );
    
    // Set the position of the cube
    cube.position.set(x, y, z);
    cube.geometry.name = "Cube";

    return cube;
}

// Returns a sphere
function addSphere(radius, segmentsWidth, segmentsHeight) {
    var geometry = new THREE.SphereGeometry(radius, segmentsWidth, segmentsHeight);
    var material = new THREE.MeshStandardMaterial({ color: blue});
    var sphere = new THREE.Mesh(geometry, material);
    
    // Set the position of the sphere   
    sphere.position.set(0, 0, 0);
    sphere.geometry.name = "Sphere";
    
    return sphere;
}

// Returns a sphere - only used for spheres that control vertices in vertec mode
function addSphere2(x, y, z) {
    var geometry = new THREE.SphereGeometry(0.1, 20, 20);
    var material = new THREE.MeshBasicMaterial({ color: red});
    var sphere = new THREE.Mesh(geometry, material);
    
    // Set the position of the sphere   
    sphere.position.set(x, y, z);
    sphere.geometry.name = "Sphere";
    
    return sphere;
}

// Returns a torus
 function addTorus(x, y, z) {
    const geometry = new THREE.TorusGeometry( 2.5, 1.25, 4, 25 ); 
    const material = new THREE.MeshStandardMaterial( { color: blue } ); 
    const torus = new THREE.Mesh( geometry, material );

    // Set the position of the torus
    torus.position.set(x, y, z);
    torus.geometry.name = "Torus";
    torus.geometry.attributes.position.needsUpdate = true

    return torus;
}


// Returns a tetrahedron
 function addTetrahedron(x, y, z){
    const geometry = new THREE.TetrahedronGeometry(1,0);
    const material = new THREE.MeshStandardMaterial( { color: blue} ); 
    const tetrahedron = new THREE.Mesh( geometry, material ); 
    
    // Set the position of the tetrahedron
    tetrahedron.position.set(x, y, z);
    tetrahedron.geometry.name = "Tetrahedron";

    return tetrahedron;

}

// Returns an octahedron
function addOctahedron(x, y, z){
    const geometry = new THREE.OctahedronGeometry(1,0);
    const material = new THREE.MeshStandardMaterial( { color: blue} ); 
    const octahedron = new THREE.Mesh( geometry, material ); 

    // Set the position of the octahedron
    octahedron.position.set(x, y, z);
    octahedron.geometry.name = "Octahedron";

    return octahedron;
}

// Returns an icosahedron
function addIcosahedron(x, y, z){
    const geometry = new THREE.IcosahedronGeometry(1,0);
    const material = new THREE.MeshStandardMaterial( { color: blue} ); 
    const icosahedron = new THREE.Mesh( geometry, material ); 

    // Set the position of the icosahedron
    icosahedron.position.set(x, y, z);
    icosahedron.geometry.name = "Icosahedron";

    return icosahedron;
}

export { addCube, addSphere, addTorus, addTetrahedron, addOctahedron, addIcosahedron, addSphere2 }
