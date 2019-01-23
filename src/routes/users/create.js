import React from 'react';
import ReactDOM from 'react-dom';
import { Link, withRouter } from 'react-router';

import MSU from '../../msu';

import {
  PanelContainer,
  Panel,
  PanelBody,
  PanelHeader,
  Grid,
  Table,
  Row,
  Col,
  Form,
  Icon,
  Button,
  Checkbox,
  FormGroup,
  InputGroup,
  ControlLabel,
  FormControl
} from '@sketchpixy/rubix';

export default class CreateUser extends React.Component {
  constructor() {
    super();
    this.state = {obj: null};
  }

  render() {
   return (
     <div id="user">
      <Row>
        <Col xs={8}>
          <PanelContainer controls={false}>
            <Panel>
              <PanelHeader className='bg-darkblue'>
               <Grid>
                  <Row>
                    <Col xs={12} className='fg-white'>
                      <div className='text-center fg-white'>
                        <h3 style={{margin: 0, padding: 25}}>New User</h3>
                      </div>
                    </Col>
                  </Row>
                </Grid>
              </PanelHeader>
              <PanelBody style={{padding: 0}}>
                <Grid>
                  <Row>
                    <Col xs={12}>
                      {<UserEditTableComponent/>}
                      <br/>
                    </Col>
                  </Row>
                </Grid>
              </PanelBody>
            </Panel>
          </PanelContainer>
        </Col>
      </Row>
     </div>
    );
  }
}

@withRouter
class UserEditTableComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {attempting: false};
  }

  createSubmit(e) {
    this.setState({attempting: true});
    e.preventDefault();
    e.stopPropagation();

    var createObj = new Object();

    if ($(ReactDOM.findDOMNode(this.username))[0].value != '') {
      createObj.username = $(ReactDOM.findDOMNode(this.username))[0].value;
    }
    if ($(ReactDOM.findDOMNode(this.email))[0].value != '') {
      createObj.email = $(ReactDOM.findDOMNode(this.email))[0].value;
    }
    if ($(ReactDOM.findDOMNode(this.notificationFrequency))[0].value != '') {
      createObj.notificationFrequency = $(ReactDOM.findDOMNode(this.notificationFrequency))[0].value;
    }

    var gisOn = false;
    $('.gis').find('input:checked').each(function() {
      gisOn = $(this).val();
    });
    if (gisOn == 'true') {
      createObj.gisOn = true;
    } else {
      createObj.gisOn = false;
    }

    MSU.post('/users/create', createObj)
      .then(res => {
        if (!isNaN(res) && Number(res) > 0) {
          this.props.router.push('/users/view/'+res);
        } else {
          vex.dialog.alert('Error: ' + res);
        }
      });
  }

  render() {
    var notifItems = [];
    notifItems.push(
      <option key={0}
          value={'NEVER'}>
        NEVER
      </option>
    );
    notifItems.push(
      <option key={1}
          value={'DAILY'}>
        DAILY
      </option>
    );
    notifItems.push(
      <option key={2}
          value={'WEEKLY'}>
        WEEKLY
      </option>
    );
    notifItems.push(
      <option key={3}
          value={'MONTHLY'}>
        MONTHLY
      </option>
    );

    var gis = (<Checkbox
                  name='checkbox-options'
                  className='gis'
                  key='gis'
                  defaultValue='true' >
                GIS?
              </Checkbox>);


    return (
      <Form onSubmit={::this.createSubmit}>
        <FormGroup controlId='username'>
          <ControlLabel>Username</ControlLabel>
          <InputGroup>
            <FormControl type='text' ref={(c) => this.username = c} placeholder='xXx_username_xXx' />
          </InputGroup>
        </FormGroup>
        <FormGroup controlId='email'>
          <ControlLabel>Email</ControlLabel>
          <InputGroup>
            <FormControl type='email' ref={(c) => this.email = c} placeholder='user@example.com' />
          </InputGroup>
        </FormGroup>
        <FormGroup controlId='notif'>
          <ControlLabel>Notifications</ControlLabel>
          <FormControl componentClass="select" ref={(c) => this.notificationFrequency = c} placeholder=". . .">
            {notifItems}
          </FormControl>
        </FormGroup>
        <FormGroup>
          <ControlLabel>GIS</ControlLabel>
          <InputGroup>
            {gis}
          </InputGroup>
        </FormGroup>
        <FormGroup>
          <Grid>
            <Row>
              <Col xs={6} collapseLeft collapseRight className='text-right'>
                <Button outlined lg type='submit' bsStyle='blue' onClick={::this.createSubmit} disabled={this.state.attempting}>Save</Button>
              </Col>
            </Row>
          </Grid>
        </FormGroup>
      </Form>
    );
  }
}


