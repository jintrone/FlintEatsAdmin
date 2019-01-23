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

export default class CreateMarket extends React.Component {
  constructor() {
    super();
    this.state = {obj: null};
  }

  render() {
   return (
     <div id="market">
      <Row>
        <Col xs={8}>
          <PanelContainer controls={false}>
            <Panel>
              <PanelHeader className='bg-darkblue'>
               <Grid>
                  <Row>
                    <Col xs={12} className='fg-white'>
                      <div className='text-center fg-white'>
                        <h3 style={{margin: 0, padding: 25}}>New Market</h3>
                      </div>
                    </Col>
                  </Row>
                </Grid>
              </PanelHeader>
              <PanelBody style={{padding: 0}}>
                <Grid>
                  <Row>
                    <Col xs={12}>
                      {<MarketEditTableComponent/>}
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
class MarketEditTableComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {attempting: false};
  }

  createSubmit(e) {
    this.setState({attempting: true});
    e.preventDefault();
    e.stopPropagation();

    var createObj = new Object();

    if ($(ReactDOM.findDOMNode(this.name))[0].value != '') {
      createObj.name = $(ReactDOM.findDOMNode(this.name))[0].value;
    }
    if ($(ReactDOM.findDOMNode(this.email))[0].value != '') {
      createObj.email = $(ReactDOM.findDOMNode(this.email))[0].value;
    }
    if ($(ReactDOM.findDOMNode(this.phone))[0].value != '') {
      createObj.phone = $(ReactDOM.findDOMNode(this.phone))[0].value;
    }
    if ($(ReactDOM.findDOMNode(this.address))[0].value != '') {
      createObj.address = $(ReactDOM.findDOMNode(this.address))[0].value;
    }
    if ($(ReactDOM.findDOMNode(this.url))[0].value != '') {
      createObj.url = $(ReactDOM.findDOMNode(this.url))[0].value;
    }
    if ($(ReactDOM.findDOMNode(this.hours))[0].value != '') {
      createObj.hours = $(ReactDOM.findDOMNode(this.hours))[0].value;
    }

    MSU.post('/markets/create', createObj)
      .then(res => {
        if (!isNaN(res) && Number(res) > 0) {
          this.props.router.push('/markets/view/'+res);
        } else {
          vex.dialog.alert('Error: ' + res);
        }
      });
  }

  render() {
    return (
      <Form onSubmit={::this.createSubmit}>
        <FormGroup controlId='name'>
          <ControlLabel>Name</ControlLabel>
          <InputGroup>
            <FormControl type='text' ref={(c) => this.name = c} placeholder='Market' />
          </InputGroup>
        </FormGroup>
        <FormGroup controlId='email'>
          <ControlLabel>Email</ControlLabel>
          <InputGroup>
            <FormControl type='email' ref={(c) => this.email = c} placeholder='market@example.com' />
          </InputGroup>
        </FormGroup>
        <FormGroup controlId='phone'>
          <ControlLabel>Phone</ControlLabel>
          <InputGroup>
            <FormControl type='text' ref={(c) => this.phone = c} placeholder='(555)555-5555' />
          </InputGroup>
        </FormGroup>
        <FormGroup controlId='address'>
          <ControlLabel>Address</ControlLabel>
          <InputGroup>
            <FormControl type='text' ref={(c) => this.address = c} placeholder='123 N Main St Flint, MI 12345' />
          </InputGroup>
        </FormGroup>
        <FormGroup controlId='url'>
          <ControlLabel>URL</ControlLabel>
          <InputGroup>
            <FormControl type='text' ref={(c) => this.url = c} placeholder='www.example.com' />
          </InputGroup>
        </FormGroup>
        <FormGroup controlId='hours'>
          <ControlLabel>Hours</ControlLabel>
          <InputGroup>
            <FormControl type='text' ref={(c) => this.hours = c} placeholder='08:00 – 21:00' />
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


