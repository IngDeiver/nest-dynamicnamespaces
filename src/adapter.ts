import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { instrument } from '@socket.io/admin-ui';

export default class MainAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);

    server.use((socket, next) => {
      //auth -> socket.handshake.auth
      const nameSpace = socket.nsp.name
      

      if(nameSpace === '/'){
        console.log("unauthorized: ", nameSpace);
        next(new Error("Unauthorized to connect main namespace"))
      }
      next();
    });

    instrument(server, {
      auth: false,
    });

    return server;
  }
}
