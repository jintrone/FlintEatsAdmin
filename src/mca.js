import React from 'react';
require('es6-promise').polyfill();
require('isomorphic-fetch');

// dev
//const URL = 'https://chass-dev.etshost.com:8444/msu';
// prod
const URL = 'https://flinteats.etshost.com:8443/msu';
 
class Msu extends React.Component {
  constructor () {
    super();
    this.URL = URL;
  }

  componentDidMount() {
  }

  delete(path, params = null) {
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');

    if (params) {
      var data = new URLSearchParams();
      for (p in params) {
        data.append(p, params[p]);
      }
    }
    path = URL + path;
    if (data) {
      path += data.toString();
    }
    return fetch(path,
        {
          method: 'DELETE',
          headers: headers,
          credentials: 'include',
        })
      .then(res => {
        return res.text();
      }, err => {
        console.log('error: ' + err);
      });
  }

  get(path, params = null) {
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');

    if (params) {
      var data = new URLSearchParams();
      for (p in params) {
        data.append(p, params[p]);
      }
    }
    path = URL + path;
    if (data) {
      path += data.toString();
    }
    return fetch(path,
        {
          method: 'GET',
          headers: headers,
          credentials: 'include',
        })
      .then(res => {
        return res.text();
      }, err => {
        console.log('error: ' + err);
      });
  }

  post(path, params = null) {
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return fetch(URL+path,
        {
          method: 'POST',
          headers: headers,
          credentials: 'include',
          body: JSON.stringify(params)
        })
      .then(res => {
        return res.text();
      }, err => {
        console.log('error: ' + err);
      });
  }

  put(path, params = null) {
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return fetch(URL+path,
        {
          method: 'PUT',
          headers: headers,
          credentials: 'include',
          body: JSON.stringify(params)
        })
      .then(res => {
        return res.text();
      }, err => {
        console.log('error: ' + err);
      });
  }

  login(username, password) {
    var headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded;encoding=utf-8');

    var data = new URLSearchParams();
    data.append('j_username', username);
    data.append('j_password', password);
    return fetch(URL+'/resources/j_spring_security_check',
        {
          method: 'POST',
          headers: headers,
          credentials: 'include',
          body: data
        })
      .then(res => {
        return res.text();
      }, err => {
        console.log('error: ' + err);
      });

  }
}

const MCA = new Msu();
export default MCA;
