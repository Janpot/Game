# To do

## multiplayer

1. create level file structure + async loading:
  * necessary to be able to load levels on client and server (server doesn't need 3D)
  * separation of 2D and 3D structures. e.g.

        {
          "scene": "/scenemodel.js",
          "walls": [
            {
              "corners": [
                [x, y],
                [x, y]
              ]
            },
            {
              "corners": [
                [x, y],
                [x, y]
              ]
            }
          ]
        }

2. find a way to share code between server and clients (http://caolanmcmahon.com/posts/writing_for_node_and_the_browser/)
3. create infrastructure to start games on the server and join games (unique urls?)
4. send input buffers from clients and simulate games on the server, use prediction on clients and correct positions when necessary
5. use lag compensation on the server for shooting and calculate hits on the server

## graphics

* create shader for obscuring parts of the world, use shadow mapping algorithm
* create Cinema 4S plugin to export models/scenes/levels
* animate players