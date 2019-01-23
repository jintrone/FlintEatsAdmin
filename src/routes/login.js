import React from 'react';
import classNames from 'classnames';
import ReactDOM from 'react-dom';
import { Link, withRouter } from 'react-router';
import MSU from '../msu';

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
export default class Login extends React.Component {
  constructor() {
    super();
    this.state = {currentUser: null, attempting: false};
  }

  submit(e) {
    e.preventDefault();
    e.stopPropagation();

    this.setState({attempting: true});

    var email = $(ReactDOM.findDOMNode(this.emailaddr))[0].value;
    var passwd = $(ReactDOM.findDOMNode(this.passwd))[0].value;

    MSU.login(email, passwd)
      .then(res => {
        this.setState({attempting: false});
        if (res) {
          //TODO: don't hardcode this...
          if(email === 'admin@etshost.com'
              || email === 'msu@etshost.com') {
            this.processLogin();
          } else {
            vex.dialog.alert('You are not authorized to access this resource');
          }
        }
      });
  }

  processLogin() {
    this.props.router.push('dashboard');
  }

  create() {
    vex.dialog.open({
      message: 'Please Enter Account Details:',
      input: ''
        + 'Card Number<br/>'
          + '<input name="card" type="number" placeholder="100001356098" required />'
        + 'State ID (Numbers Only)<br/>'
          + '<input name="puid" type="number" placeholder="100987123654" required '
            + 'data-toggle="tooltip" title="Enter Your State ID, include only numbers" />'
        + 'Email Address <br/>'
          + '<input name="email" type="email" placeholder="email@email.com" required />'
        + '',
      buttons: [
          $.extend({}, vex.dialog.buttons.YES, { text: 'Create Account' }),
          $.extend({}, vex.dialog.buttons.NO, { text: 'Cancel' })
      ],
      callback: (data) => {
        if (!data) {
          // cancel
        } else { 
          if (data.email != '' && data.puid != '' && data.card != '') {
            MCA.methodCall('mca.registerUser',
                [''+data.puid,
                 ''+data.card,
                 ''+data.email,
                 'https://admin.mydoubleup.com/password/'],
                function (error, value) {
              if (error) {
                console.log('error:', error);
                console.log('req headers:', error.req && error.req._header);
                console.log('res code:', error.res && error.res.statusCode);
                console.log('res body:', error.body);
              } else {
                if (Number(JSON.parse(value)) > 0) {
                  vex.dialog.alert('Account Created');
                } else {
                  vex.dialog.alert(value);
                }
              }
            }.bind(this));
          } else {
            vex.dialog.alert('Please fill in all fields.');
          }
        }
      }
    });
  }

  changeExpired() {
    vex.dialog.open({
      message: 'Your password has expired. Please enter a new password:',
      input: ''
        + 'New Password<br/><input name="pass1" type="password" required />'
        + 'Confirm Password<br/><input name="pass2" type="password" required />'
        + '',
      buttons: [
          $.extend({}, vex.dialog.buttons.YES, { text: 'Change Password' }),
          $.extend({}, vex.dialog.buttons.NO, { text: 'Cancel' })
      ],
      callback: (data) => {
        if (!data) {
          this.setState({attempting: false});
        } else {
          if (data.pass1 == data.pass2) {
            MCA.methodCall('mca.passwordChange',
                [this.state.currentUser.email, data.pass1],
                function (error, value) {
              if (error) {
                console.log('error:', error);
                console.log('req headers:', error.req && error.req._header);
                console.log('res code:', error.res && error.res.statusCode);
                console.log('res body:', error.body);
              } else {
                if (Number(value) > 0) {
                  vex.dialog.alert('Password Changed');
                  this.props.router.push('dashboard');
                } else {
                  this.changeExpired();
                  vex.dialog.alert(value);
                }
              }
            }.bind(this));
          } else {
            this.changeExpired();
            vex.dialog.alert('Passwords Do Not Match.');
          }
        }
      }
    });
  }

  reset() {
    vex.dialog.open({
      message: 'Please Enter Your Email Address:',
      input: ''
        + 'Email Address <br/>'
          + '<input name="email" type="email" placeholder="email@email.com" required />'
        + '',
      buttons: [
          $.extend({}, vex.dialog.buttons.YES, { text: 'Reset Password' }),
          $.extend({}, vex.dialog.buttons.NO, { text: 'Cancel' })
      ],
      callback: (data) => {
        if (!data) {
          // cancel
        } else {
          if (data.email != '') {
            MCA.methodCall('mca.passwordResetRequest',
                [''+data.email,'https://admin.mydoubleup.com/password/'],
                function (error, value) {
              if (error) {
                console.log('error:', error);
                console.log('req headers:', error.req && error.req._header);
                console.log('res code:', error.res && error.res.statusCode);
                console.log('res body:', error.body);
              } else {
                if (Number(value) > 0) {
                  vex.dialog.alert('Please check your email for your password reset link.');
                } else {
                  vex.dialog.alert('Password reset could not be completed; '
                    + 'please check your email and try again. '
                    + 'If issue persists, contact support. Reason: '+value);
                }
              }
            }.bind(this));
          } else {
            vex.dialog.alert('Please fill in all fields.');
          }
        }
      }
    });
  }

  componentDidMount() {
    $('html').addClass('authentication');
    $('body').css({
      backgroundImage: 'url(/imgs/app/splashes/splash'
                       + Math.floor(Math.random()*(4-1+1)+1)+'.jpg)',
      minHeight: '100%',
      backgroundSize: 'cover',
      position: 'fixed',
      width: '100%'
    });
  }

  componentWillUnmount() {
    $('html').removeClass('authentication');
    $('body').css({
      position: 'static'
    });
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
                          <h3 style={{margin: 0, padding: 25}}>Flint Eats Admin Portal</h3>
                        </div>
                        <div className='bg-hoverblue fg-black50 text-center' style={{padding: 12.5}}>
                          <div>Please Sign In</div>
                        </div>
                        <div>
                          <div style={{padding: 25, paddingTop: 0, paddingBottom: 0, margin: 'auto', marginBottom: 25, marginTop: 25}}>
                            <Form onSubmit={::this.submit}>
                              <FormGroup controlId='emailaddress'>
                                <InputGroup bsSize='large'>
                                  <InputGroup.Addon>
                                    <Icon glyph='icon-fontello-mail' />
                                  </InputGroup.Addon>
                                  <FormControl autoFocus ref={(c) => this.emailaddr = c}
                                      type='email' className='border-focus-blue' placeholder='user@email.com' />
                                </InputGroup>
                              </FormGroup>
                              <FormGroup controlId='password'>
                                <InputGroup bsSize='large'>
                                  <InputGroup.Addon>
                                    <Icon glyph='icon-fontello-key' />
                                  </InputGroup.Addon>
                                  <FormControl ref={(c) => this.passwd = c} type='password' className='border-focus-blue' placeholder='password' />
                                </InputGroup>
                              </FormGroup>
                              <FormGroup>
                                <Grid>
                                  <Row>
                                    <Col className='text-center'>
                                      <Button lg type='submit' bsStyle='blue' onClick={::this.submit} disabled={this.state.attempting}>Login</Button>
                                    </Col>
                                  </Row>
                                </Grid>
                              </FormGroup>
                            </Form>
                          </div>
                        </div>
                        <div className='bg-hoverblue fg-black50 text-center' style={{padding: 12.5}}>
                          <div id='reset_pwd' onClick={::this.reset} style={{cursor: 'pointer'}}>Click Here to Reset Your Password</div>
                        </div>
                        <div className='text-center bg-darkblue fg-white'>
                          Powered by Epic Technology Solutions, LLC
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
