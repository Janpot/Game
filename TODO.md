# To do

## multiplayer

1. create or find a three.js compatible commonjs 2D library so we can use it on the server
2. create infrastructure to start games on the server and join games (unique urls?)
3. separate controls from PlayerController to reuse playercontroller on the server
4. send input buffers from clients and simulate games on the server, use prediction on clients and correct positions when necessary
5. use lag compensation on the server for shooting and calculate hits on the server

## graphics

* create shader for obscuring parts of the world, use shadow mapping algorithm
* create Cinema 4D plugin to export models/scenes/levels
* animate players