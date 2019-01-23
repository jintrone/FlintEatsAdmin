import React from 'react';
import classNames from 'classnames';
import ReactDOM from 'react-dom';
import cookie from 'react-cookie';
import { Link, withRouter } from 'react-router';
import MCA from '../mca';

import {
  Row,
  Col,
  Icon,
  Grid,
  Form,
  Badge,
  Panel,
  Button,
  PanelBody,
  FormGroup,
  InputGroup,
  FormControl,
  ButtonGroup,
  ButtonToolbar,
  PanelContainer,
} from '@sketchpixy/rubix';

@withRouter
export default class XmlrpcTest extends React.Component {
  constructor() {
    super();
  }
  back(e) {
    e.preventDefault();
    e.stopPropagation();

    var method = $(ReactDOM.findDOMNode(this.method))[0].value;
    var args = JSON.parse($(ReactDOM.findDOMNode(this.args))[0].value);
    $('#process').text('Processing');

const HOST = 'chass-dev.etshost.com';
const PORT = 443;
const NAME = '/msu';
const PATH = NAME + '/xmlrpc';
// ---

var xmlrpc = require('xmlrpc');
var clientOps = {
        host: HOST,
        port: PORT,
        path: PATH,
};
const MSU = xmlrpc.createSecureClient(clientOps);


    MSU.methodCall(method, args, function (error, value) {
      if (error) {
        console.log(MSU);
        console.log('error:', error);
        console.log('req headers:', error.req && error.req._header);
        console.log('res code:', error.res && error.res.statusCode);
        console.log('res body:', error.body);
      } else {
        console.log(value);
        $('#process').text('Finished Processing, Check Console');
      }
    }.bind(this));

  }

  getPath(path) {
    var dir = this.props.location.pathname.search('rtl') !== -1 ? 'rtl' : 'ltr';
    path = `/${dir}/${path}`;
    return path;
  }

  render() {
    return (
      <div id='auth-container' className='login'>
        <div id='auth-row'>
          <div id='auth-cell'>
            <Grid>
              <Row>
                <Col sm={6} smOffset={2} xs={10} xsOffset={1} collapseLeft collapseRight>
                  <PanelContainer controls={false}>
                    <Panel>
                      <PanelBody style={{padding: 0}}>
                        <div className='text-center bg-darkblue fg-white'>
                          <h3 style={{margin: 0, padding: 25}}>XMLRPC Test</h3>
                        </div>
                        <div className='bg-hoverblue fg-black50 text-center' style={{padding: 12.5}}>
                          <div id="process"></div>
                        </div>
                        <div>
                          <div style={{padding: 25, paddingTop: 0, paddingBottom: 0, margin: 'auto', marginBottom: 25, marginTop: 25}}>
                            <Form onSubmit={::this.back}>
                              <FormGroup controlId='method'>
                                <p>Method:</p>
                                <InputGroup bsSize='large'>
                                  <FormControl autoFocus ref={(c) => this.method = c} type='text' className='border-focus-blue' placeholder='mca.view' size={64}/>
                                </InputGroup>
                              </FormGroup>
                              <FormGroup controlId='args'>
                                <p>Arguments (JS Array)</p>
                                <InputGroup bsSize='large'>
                                  <FormControl ref={(c) => this.args = c} type='text' className='border-focus-blue' placeholder='["<ex:i8>6</ex:i8>"]' size={64}/>
                                </InputGroup>
                              </FormGroup>
                              <FormGroup>
                                <Grid>
                                  <Row>
                                    <Col xs={6} collapseLeft collapseRight className='text-right'>
                                      <Button outlined lg type='submit' bsStyle='blue' onClick={::this.back}>Run</Button>
                                    </Col>
                                  </Row>
                                </Grid>
                              </FormGroup>
                            </Form>
                          </div>
                        </div>
                      </PanelBody>
                    </Panel>
                  </PanelContainer>
                </Col>
              </Row>
            </Grid>
          </div>
        </div>
      </div>
    );
  }
}
