import React from 'react';
import classNames from 'classnames';
import ReactDOM from 'react-dom';
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
export default class Password extends React.Component {
  constructor() {
    super();
    this.state = {email: null};
  }

  back(e) {
    e.preventDefault();
    e.stopPropagation();
    var passwd = $(ReactDOM.findDOMNode(this.password))[0].value;
    var passwdConfirm = $(ReactDOM.findDOMNode(this.passwordConfirm))[0].value;
    var email = $(ReactDOM.findDOMNode(this.email))[0].value;

    if (passwd != passwdConfirm) {
      vex.dialog.alert('Passwords do not match, please check them and try again.');
    } else if (this.props.params.token != '' && this.state.email != null) {
      vex.dialog.alert('Password modification key does not match; check your link and try again.'
          + 'If issue persists, try account creation/password reset again.');
    } else {
      MCA.methodCall('mca.passwordReset', [email, passwd, this.props.params.token], function (error, value) { //Password Reset
        if (error) {
          console.log('error:', error);
          console.log('req headers:', error.req && error.req._header);
          console.log('res code:', error.res && error.res.statusCode);
          console.log('res body:', error.body);
        } else {
          if (Number(value) > 0) {
            vex.dialog.alert({message: 'Password Change Sucessful.', callback: function() { this.props.router.push('/'); }.bind(this) });
          } else {
            vex.dialog.alert('Password Change Failed:<br/>' + value);
          }
        }
      }.bind(this));
    }
  }

  processLogin() {
    if ($.isNumeric(this.state.currentUser.id) && this.state.currentUser.email == $(ReactDOM.findDOMNode(this.emailaddr))[0].value) {
      this.props.router.push('dashboard');
    }
  }

  componentDidMount() {
    $('html').addClass('authentication');
    $('#auth-container').css({backgroundImage: 'url(/imgs/app/splashes/splash'+Math.floor(Math.random()*(4-1+1)+1)+'.jpg)', minHeight: '100%', backgroundSize: 'cover', position: 'fixed'});
      MCA.methodCall('mca.passwordResetRequestValidate', [this.props.params.token], function (error, value) {
        if (error) {
          console.log('error:', error);
          console.log('req headers:', error.req && error.req._header);
          console.log('res code:', error.res && error.res.statusCode);
          console.log('res body:', error.body);
        } else {
          if (value == "Invalid token." || value == "Token expired.") {
            vex.dialog.alert(value);
          } else {
            $(ReactDOM.findDOMNode(this.email))[0].value = value;
          }
        }
      }.bind(this));
  }

  componentWillUnmount() {
    $('html').removeClass('authentication');
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
                <Col sm={4} smOffset={4} xs={10} xsOffset={1} collapseLeft collapseRight>
                  <PanelContainer controls={false}>
                    <Panel>
                      <PanelBody style={{padding: 0}}>
                        <div className='text-center bg-darkblue fg-white'>
                          <h3 style={{margin: 0, padding: 25}}>{this.props.type == 'create'? 'Setup' : 'Reset'} Password</h3>
                        </div>
                        <div className='bg-hoverblue fg-black50 text-center' style={{padding: 12.5}}>
                          <div>Please choose a password.</div>
                        </div>
                        <div>
                          <div style={{padding: 25, paddingTop: 0, paddingBottom: 0, margin: 'auto', marginBottom: 25, marginTop: 25}}>
                            <Form onSubmit={::this.back}>
                              <FormGroup controlId='email'>
                                <InputGroup bsSize='large'>
                                  <InputGroup.Addon>
                                    <Icon glyph='icon-fontello-mail' />
                                  </InputGroup.Addon>
                                  <FormControl autoFocus ref={(c) => this.email = c} type='email' className='border-focus-blue' placeholder='user@email.com' readOnly />
                                </InputGroup>
                              </FormGroup>
                              <FormGroup controlId='password'>
                                <InputGroup bsSize='large'>
                                  <InputGroup.Addon>
                                    <Icon glyph='icon-fontello-key' />
                                  </InputGroup.Addon>
                                  <FormControl autoFocus ref={(c) => this.password = c} type='password' className='border-focus-blue' placeholder='Password' />
                                </InputGroup>
                              </FormGroup>
                              <FormGroup controlId='passwordConfirm'>
                                <InputGroup bsSize='large'>
                                  <InputGroup.Addon>
                                    <Icon glyph='icon-fontello-key' />
                                  </InputGroup.Addon>
                                  <FormControl ref={(c) => this.passwordConfirm = c} type='password' className='border-focus-blue' placeholder='Confirm Password' />
                                </InputGroup>
                              </FormGroup>
                              <FormGroup>
                                <Grid>
                                  <Row>
                                    <Col xs={6} collapseLeft collapseRight style={{paddingTop: 10}}>
                                    </Col>
                                    <Col xs={6} collapseLeft collapseRight className='text-right'>
                                      <Button outlined lg type='submit' bsStyle='blue' onClick={::this.back}>Submit</Button>
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
