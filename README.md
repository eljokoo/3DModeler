# CS77-Final

In this readme we will explain how to use the program as well as what each file in the CS77-final folder does. All of the other folders in the CS77-Final-v2 folder contain files which we imported from three.js. CS77-final contains all of the work we did for the project.

[deployed link](https://threedmodeler.onrender.com)

## User instructions

To start the program run proj.html using a live server.

Camera mode (default):
Use the mouse to move the camera in orbit fashion, and zoom in/out using the trackpad to zoom in/out. Use the arrow keys to adjust the angle of the camera from its current position.

Move mode:
  In move mode, click and drag any shape to move it. The most recently clicked shape is the 'selected shape'

Vertex mode:
  In vertex mode, you will see each of the vertices of each shape represented by a red sphere. Click and drag any of them to morph the object's shape.

Shape creation:
  Push 'C' to create a new cube
  Push 'S' to create a new sphere
  Push 'T' to create a new torus
  Push 'H' to create a new tetrahedron
  Push 'O' to create a new octahedron
  Push 'I' to create a new icosahedron
  Push 'D' to delete the currently selected shape

Selected Shape Functionality:
  Push 'Q' to increase the size of the selected shape
  Push 'A' to decrease the size of the selected shape
  Click the toggle wireframe button to toggle whether the selected shape is wireframe or not
  Use the colorpicker to set the selected shape's color
  Use the text fields to rotate the selected shape around the desired axis/axes by the desired degrees
  Push 'D' to delete the selected shape. Continuing to press 'D' will continue to delete items in the scene until the scene is empty.

Export:
  Click "Sam, Eljo, and Will's Basic 3D Modeler"
  
Other:
  Click the 🦧 for a fun surprise :)

## geometry.js

This file contains all of the shape creation functions. Here we levergaed three.js functions to create the geometry, material, and mesh of each of the shapes. Each of the shape creation functions are exported for importation in script.js. See the document for more specific documentation.

## quat.js

This file contains the functions necessary for rotating a selected shape using quaternions. Each of the functions are exported for importation in script.js. See the document for more specific documentation.

## script.js

This file contains all of the code necessary for creating the 3D modeler and implementing its functions. This is the primary backend file of the project. See the document for more specific documentation.

## proj.html

This file contains all of the code for implementing our 3D modeler as a website. Everything on screen outside of the main modeler window is created in this file. It is the main frontend file of the project.

## style.css

This file determines the style of the elements of the UI.

## Thank you for using our program!
🦧 - Eljo, Will, and Sam
