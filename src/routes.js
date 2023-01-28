const { dataHandler } = require('./handler');
const routes = [
  {
    method: 'POST', 
    path: '/data', 
    handler: dataHandler, 
  }, 
]

module.exports = routes;