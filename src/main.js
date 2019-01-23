import React from 'react';
import ReactDOM from 'react-dom';

import routes from './routes';
import render, { setNetworkLayer } from '@sketchpixy/rubix/lib/node/relay-router';

render(routes, () => {
  console.log('Completed rendering!');
});

if (module.hot) {
  module.hot.accept('./routes', () => {
    ReactDOM.unmountComponentAtNode(document.getElementById('app-container'));
    // reload routes again
    render(require('./routes').default);
  });
}
