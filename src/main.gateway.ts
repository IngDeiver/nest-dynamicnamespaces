import {
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Namespace, Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MainGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  fakeNamespaces = [
    { name: 'ns-1', rooms: [{ roomId: 'room-1' }] },
    { name: 'ns-2', rooms: [{ roomId: 'room-2' }] },
  ];

  createNameSpace(name: string): Namespace {
    return this.server.of(name);
  }

  getNameSpace(name: string): Namespace | undefined {
    return this.server._nsps.get(name);
  }

  joinClientToRoom(room: string | Array<string>, client: any) {
    client.join(room);
  }

  clearRoomFromNameSpace(room: string, namespaceName: string) {
    const namespace: Namespace = this.getNameSpace(namespaceName);
    namespace.socketsLeave(room);
  }

  removeNameSpace(namespaceName: string) {
    const namespace: Namespace = this.getNameSpace(namespaceName);
    const connectedNameSpaceSockets = Object.keys(namespace.allSockets);

    connectedNameSpaceSockets.forEach((socketId) => {
      connectedNameSpaceSockets[socketId].disconnect(); // Disconnect Each socket
    });
    namespace.disconnectSockets();
    namespace.removeAllListeners(); // Remove all Listeners for the event emitter
    delete this.server._nsps[namespaceName]; // Remove from the server namespaces
  }

  emitEventToRoom(
    nameSpace: Namespace,
    room: string,
    event: string,
    data: any,
  ) {
    nameSpace.to(room).emit(event, data);
  }

  createConnectionsHandler(namespace: Namespace, callback) {
    namespace.on('connection', (client) => {
      console.log('New connection to namespace: ', client.nsp.name);
      callback(client);
    });
  }

  afterInit(server: Server) {
    console.log('Main gateway init');

    /// create dinamic namespaces (for example get from database)-----------
    this.fakeNamespaces.forEach((ns) => {
      const nameSpaceName = ns.name;
      const nameSpaceInstance: Namespace = this.createNameSpace(nameSpaceName);
      console.log('New namespace created: ', nameSpaceInstance.name);

      this.createConnectionsHandler(nameSpaceInstance, (client) => {
        // create dinamic rooms into namespaces (for example get from database)----
        const fakeRooms = this.fakeNamespaces.find(
          (ns) => ns.name === nameSpaceInstance.name.replace('/', ''),
        );
        fakeRooms.rooms.forEach((room) => {
          const roomId = `${nameSpaceInstance.name}/${room.roomId}`;

          // join client to room of a namespace-----------------
          this.joinClientToRoom(roomId, client);

          //  emit event to client into room of a namespace----------
          this.emitEventToRoom(
            nameSpaceInstance,
            roomId,
            'event/room',
            `room ${roomId}`,
          );
        });

        // listen events only into namespaces-------------
        client.on(`event${nameSpaceInstance.name}`, function (data) {
          console.log(data);
        });

        // client disconnect from namespace--------------
        client.on('disconnect', () => {
          console.log('disconnect to namespace: ', client.nsp.name);
          client.removeAllListeners();
        });
      });
    });
  }
}
