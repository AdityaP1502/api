const Hapi = require('@hapi/hapi');
const routes = require('./routes');
const process = require('process');
const {data, writeData} = require('./handler');

const init = async () => {
  const server = Hapi.server({
    port: 5000,
    host: 'localhost',
    routes: {
      cors: true,
    },
  });

  server.route(routes);
  await server.start();

  console.log(`Server berjalan pada ${server.info.uri}`);
};


init();
process.on('SIGINT', async () => {
  console.log("Caught interrupt signal");
  if (data.length != 0) {
    console.log('There are data in buffer');
    console.log('Saving...');
    await writeData(data);
  }
  console.log('exiting...');
  process.exit();
});