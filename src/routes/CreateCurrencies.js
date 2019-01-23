import React from 'react';
import ReactDOM from 'react-dom';
import { Link, withRouter } from 'react-router';
import MCA from '../mca';

import {
  PanelContainer,
  Panel,
  PanelBody,
  Grid,
  Table,
  Row,
  Col,
  Form,
  Icon,
  Button,
  FormGroup,
  InputGroup,
  ControlLabel,
  FormControl
} from '@sketchpixy/rubix';

export default class CreateCurrencies extends React.Component {
  constructor() {
    super();
    this.state = {obj: null};
  }

  render() {
   return (
     <div id="currency">
      <Row>
        <Col xs={8}>
          <PanelContainer controls={false}>
            <Panel>
              <PanelBody>
                <Grid>
                  <Row>
                    <Col xs={12}>
                      <h3>New Currency</h3>
                      <CurrencyEditTableComponent/>
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
class CurrencyEditTableComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {attempting: false};
  }

  createSubmit(e) {
    this.setState({attempting: true});
    e.preventDefault();
    e.stopPropagation();
    var newObj = new Object();

    if ($(ReactDOM.findDOMNode(this.name))[0].value != '') {
      newObj.name = $(ReactDOM.findDOMNode(this.name))[0].value;
    }
    if ($(ReactDOM.findDOMNode(this.code))[0].value != '') {
      newObj.code = $(ReactDOM.findDOMNode(this.code))[0].value;
    }
    if ($(ReactDOM.findDOMNode(this.dailyLimit))[0].value != '') {
      newObj.dailyLimit = $(ReactDOM.findDOMNode(this.dailyLimit))[0].value;
    }

    MCA.methodCall('mca.create', ['currency',JSON.stringify(newObj)], function (error, value) {
      if (error) {
        console.log('error:', error);
        console.log('req headers:', error.req && error.req._header);
        console.log('res code:', error.res && error.res.statusCode);
        console.log('res body:', error.body);
      } else {
        if (!isNaN(value)) {
          this.props.router.push('/currency/view/'+value);
        } else {

          // reset colors
          $(ReactDOM.findDOMNode(this.name))[0].style.borderColor = 'initial';
          $(ReactDOM.findDOMNode(this.code))[0].style.borderColor = 'initial';
          $(ReactDOM.findDOMNode(this.dailyLimit))[0].style.borderColor = 'initial';

          var errorFields = JSON.parse(value);
          // show errors
          if (errorFields.indexOf('name') >= 0) {
            $(ReactDOM.findDOMNode(this.name))[0].style.borderColor = 'red';
          }
          if (errorFields.indexOf('code') >= 0) {
            $(ReactDOM.findDOMNode(this.code))[0].style.borderColor = 'red';
          }
          if (errorFields.indexOf('dailyLimit') >= 0) {
            $(ReactDOM.findDOMNode(this.dailyLimit))[0].style.borderColor = 'red';
          }
          this.setState({attempting: false});
        }
      }

    }.bind(this));
  }

  validate(event) {
    var val = event.target.value;

    if (event.target.id == 'dailyLimit') {
      var regex = /^-?\d{0,}$|^-?\d{0,}\.\d{0,2}$/;
      if (val.match(regex)) {
        this.setState({amount: val});
      } else {
        event.target.value = this.state.amount;
      }
    }
  }


  render() {
    return (
     <Form onSubmit={::this.createSubmit}>
       <FormGroup controlId='name'>
         <ControlLabel>Name</ControlLabel>
         <InputGroup>
           <FormControl type='text' ref={(c) => this.name = c} placeholder='Double Up (MI)' />
         </InputGroup>
       </FormGroup>
       <FormGroup controlId='code'>
         <ControlLabel>Code</ControlLabel>
         <InputGroup>
           <FormControl type='text' ref={(c) => this.code = c} placeholder='DUFB_MI' />
         </InputGroup>
       </FormGroup>
       <FormGroup controlId='dailyLimit'>
         <ControlLabel>Daily Limit ($)</ControlLabel>
         <InputGroup>
           <FormControl type='text' ref={(c) => this.dailyLimit = c} placeholder='20.00'/>
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
