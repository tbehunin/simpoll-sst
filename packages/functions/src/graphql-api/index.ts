import fastify from 'fastify';

export const init = () => {
  const app = fastify();
  app.get('/graphql', (request, reply) => reply.send({ hello: 'world' }));
  return app;
}

// if (require.main === module) {
//   // called directly i.e. "node app"
//   init().listen({ port: 3000 }, (err) => {
//     if (err) console.error(err);
//     console.log('server listening on 3000');
//   });
// } else {
//   // required as a module => executed on aws lambda
//   module.exports = init;
// }
