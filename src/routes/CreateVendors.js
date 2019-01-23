import React from 'react';
import ReactDOM from 'react-dom';
import { Link, withRouter } from 'react-router';
import ReactTooltip from 'react-tooltip';
import MCA from '../mca';

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

export default class CreateVendor extends React.Component {
  constructor() {
    super();
    this.state = {obj: null};
  }

  render() {
   return (
     <div id="vendor">
      <Row>
        <Col xs={8}>
          <PanelContainer controls={false}>
            <Panel>
              <PanelHeader className='bg-green'>
               <Grid>
                  <Row>
                    <Col xs={12} className='fg-white'>
                      <div className='text-center fg-white'>
                        <h3 style={{margin: 0, padding: 25}}>New Vendor</h3>
                      </div>
                    </Col>
                  </Row>
                </Grid>
              </PanelHeader>
              <PanelBody>
                <Grid>
                  <Row>
                    <Col xs={12} collapseRight>
                      {<VendorEditTableComponent />}
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
class VendorEditTableComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {attempting: false, roles: null};

    MCA.methodCall('mca.listConcise', ['currency'], function (error, value) {
      if (error) {
        console.log('error:', error);
        console.log('req headers:', error.req && error.req._header);
        console.log('res code:', error.res && error.res.statusCode);
        console.log('res body:', error.body);
      } else {
        value = JSON.parse(value);
        this.setState({allCurrencies: value});
      }
    }.bind(this));

    MCA.methodCall('mca.getAllowedCurrencies', [], function (error, value) {
      if (error) {
        console.log('error:', error);
        console.log('req headers:', error.req && error.req._header);
        console.log('res code:', error.res && error.res.statusCode);
        console.log('res body:', error.body);
      } else {
        value = JSON.parse(value);
        this.setState({myAllowedCurrencies: value});
      }
    }.bind(this));

    MCA.methodCall('mca.listConcise', ['market'], function (error, value) {
      if (error) {
        console.log('error:', error);
        console.log('req headers:', error.req && error.req._header);
        console.log('res code:', error.res && error.res.statusCode);
        console.log('res body:', error.body);
      } else {
        value = JSON.parse(value);
        this.setState({allMarkets: value});
      }
    }.bind(this));

    MCA.methodCall('mca.getAllowedMarkets', [], function (error, value) {
      if (error) {
        console.log('error:', error);
        console.log('req headers:', error.req && error.req._header);
        console.log('res code:', error.res && error.res.statusCode);
        console.log('res body:', error.body);
      } else {
        value = JSON.parse(value);
        this.setState({myAllowedMarkets: value});
      }
    }.bind(this));

    MCA.methodCall('mca.getRoles', [], function (error, value) {
      if (error) {
        console.log('error:', error);
        console.log('req headers:', error.req && error.req._header);
        console.log('res code:', error.res && error.res.statusCode);
        console.log('res body:', error.body);
      } else {
        value = JSON.parse(value);
        if (!this.state.roles) {
          this.setState({roles: value});
        }
      }
    }.bind(this));

    // if admin, allow for all roles
    MCA.methodCall('mca.getAllRoles', [], function (error, value) {
      if (error) {
        console.log('error:', error);
        console.log('req headers:', error.req && error.req._header);
        console.log('res code:', error.res && error.res.statusCode);
        console.log('res body:', error.body);
      } else if (value != -1) {
        value = JSON.parse(value);
        this.setState({roles: value});
      }
    }.bind(this));

  }

  getCurrencies() {
    var currencies = [];
    $('.currencies').find('input:checked').each(function() {
      currencies.push($(this).val());
    });
    this.allowedCurrencies = currencies;
  }

  getMarkets() {
    var markets = [];
    $('.markets').find('input:checked').each(function() {
      markets.push($(this).val());
    });
    this.allowedMarkets = markets;
  }

  getCreditDebitDUFB() {
//TODO: there's probably a cleaner way to do this
    var creditDUFB = false;
    var debitDUFB = false;

    $('.creditDUFB').find('input:checked').each(function() {
      creditDUFB = $(this).val();
    });
    if (creditDUFB == 'true') {
      this.creditDUFB = true;
    } else {
      this.creditDUFB = false;
    }

    $('.debitDUFB').find('input:checked').each(function() {
      debitDUFB = $(this).val();
    });
    if (debitDUFB == 'true') {
      this.debitDUFB = true;
    } else {
      this.debitDUFB = false;
    }
  }

  getRoles() {
    var roles = [];
    $('.roles').find('input:checked').each(function() {
      roles.push($(this).val());
    });
    this.roles = roles;
  }
 
  createSubmit(e) {
    this.setState({attempting: true});
    e.preventDefault();
    e.stopPropagation();
    this.getCurrencies();
    this.getMarkets();
    this.getCreditDebitDUFB();
    this.getRoles();

    var newObj = new Object();

    newObj.firstName = $(ReactDOM.findDOMNode(this.firstName))[0].value;
    newObj.lastName = $(ReactDOM.findDOMNode(this.lastName))[0].value;
    newObj.email = $(ReactDOM.findDOMNode(this.email))[0].value;
//    newObj.primaryCurrency = $(ReactDOM.findDOMNode(this.primaryCurrency))[0].value;
//    newObj.allowedCurrencies = this.allowedCurrencies;
    newObj.primaryMarket = $(ReactDOM.findDOMNode(this.primaryMarket))[0].value;
    newObj.allowedMarkets = this.allowedMarkets;
    newObj.roles = this.roles;
    newObj.creditDUFB = this.creditDUFB;
    newObj.debitDUFB = this.debitDUFB;

    MCA.methodCall('mca.create', ['vendor',JSON.stringify(newObj)], function (error, value) {
      if (error) {
        console.log('error:', error);
        console.log('req headers:', error.req && error.req._header);
        console.log('res code:', error.res && error.res.statusCode);
        console.log('res body:', error.body);
      } else {
        if (!isNaN(value)) {
          this.props.router.push('/vendor/view/'+value);
        } else {
          // reset colors
          $(ReactDOM.findDOMNode(this.email))[0].style.borderColor = 'initial';

          var errorFields = JSON.parse(value);
          // show errors
          if (errorFields.indexOf('email') >= 0) {
            $(ReactDOM.findDOMNode(this.email))[0].style.borderColor = 'red';
          }
          this.setState({attempting: false});
        }
      }
    }.bind(this));
  }

  render() {

    var allowedCurrencyItems = [];
    for (var k in this.state.allCurrencies) {
      if (this.state.allCurrencies[k].name != 'null'
      && this.state.myAllowedCurrencies != null) {

        var allowed = false;
        // logged-in user must have access to markets
        for (var m in this.state.myAllowedCurrencies) {
          if (this.state.myAllowedCurrencies[m].id == this.state.allCurrencies[k].id) {
            allowed = true;
          }
        }

//TODO: do this better
        if (allowed) {
          allowedCurrencyItems.push(
            <Checkbox name='checkbox-options' className='currencies'
                key={this.state.allCurrencies[k].id} defaultValue={this.state.allCurrencies[k].id}>
              {this.state.allCurrencies[k].name}
            </Checkbox>
          );
        } else {
          allowedCurrencyItems.push(
            <Checkbox name='checkbox-options' className='currencies'
                key={this.state.allCurrencies[k].id} defaultValue={this.state.allCurrencies[k].id} disabled>
              {this.state.allCurrencies[k].name}
            </Checkbox>
          );
        }
      }
    }

    var currencyItems = [];
    for(var k in this.state.myAllowedCurrencies) {
      if (this.state.myAllowedCurrencies[k].name != 'null') {
        currencyItems.push(
          <option key={this.state.myAllowedCurrencies[k].id}
              value={this.state.myAllowedCurrencies[k].id}>
            {this.state.myAllowedCurrencies[k].name}
          </option>
        );
      }
    }

    var allowedMarketItems = [];
    for (var k in this.state.allMarkets) {
      if (this.state.allMarkets[k].name != 'null'
      && this.state.myAllowedMarkets != null) {

        var allowed = false;
        // logged-in user must have access to markets
        for (var m in this.state.myAllowedMarkets) {
          if (this.state.myAllowedMarkets[m].id == this.state.allMarkets[k].id) {
            allowed = true;
          }
        }

//TODO: do this better
        if (allowed) {
          allowedMarketItems.push(
            <Checkbox name='checkbox-options' className='markets'
                key={this.state.allMarkets[k].id} defaultValue={this.state.allMarkets[k].id}>
              {this.state.allMarkets[k].name}
            </Checkbox>
          );
        } else {
          allowedMarketItems.push(
            <Checkbox name='checkbox-options' className='markets'
                key={this.state.allMarkets[k].id} defaultValue={this.state.allMarkets[k].id} disabled>
              {this.state.allMarkets[k].name}
            </Checkbox>
          );
        }
      }
    }

    var marketItems = [];
    for(var k in this.state.myAllowedMarkets) {
      if (this.state.myAllowedMarkets[k].name != 'null') {
        marketItems.push(
          <option key={this.state.myAllowedMarkets[k].id}
              value={this.state.myAllowedMarkets[k].id}>
            {this.state.myAllowedMarkets[k].name}
          </option>
        );
      }
    }

    var roleItems = [];
    for(var k in this.state.roles) {
      roleItems.push(
        <div data-tip={this.state.roles[k].description}>
          <Checkbox name='checkbox-options' className='roles'
              key={this.state.roles[k].id} defaultValue={this.state.roles[k].id}>
          {this.state.roles[k].name}
          </Checkbox>
        </div>
      );
    }

/*
 * we inherit currencies from market for now
        <FormGroup controlId='primaryCurrency'>
          <ControlLabel>Currency</ControlLabel>
          <FormControl componentClass='select' ref={(c) => this.primaryCurrency = c} placeholder='<select>'>
            {currencyItems}
          </FormControl>
        </FormGroup>
        <FormGroup controlId='allowedCurrencies'>
          <ControlLabel>Allowed Currencies</ControlLabel>
          <InputGroup>
            {allowedCurrencyItems}
          </InputGroup>
        </FormGroup>
*/

    return (
      <Form onSubmit={::this.createSubmit}>
        <FormGroup controlId='name'>
          <ControlLabel>Name</ControlLabel>
          <InputGroup>
            <FormControl type='text' ref={(c) => this.firstName = c} placeholder='Jon' />
            <FormControl type='text' ref={(c) => this.lastName = c} placeholder='Doe' />
          </InputGroup>
        </FormGroup>
        <FormGroup controlId='email'>
          <ControlLabel>Email</ControlLabel>
          <InputGroup>
            <FormControl type='email' ref={(c) => this.email = c} placeholder='user@example.com' />
          </InputGroup>
        </FormGroup>
        <FormGroup controlId='primaryMarket'>
          <ControlLabel>Market</ControlLabel>
          <FormControl componentClass='select' ref={(c) => this.primaryMarket = c} placeholder='<select>'>
            {marketItems}
          </FormControl>
        </FormGroup>
        <FormGroup controlId='allowedMarkets'>
          <ControlLabel>Allowed Markets</ControlLabel>
          <InputGroup>
            {allowedMarketItems}
          </InputGroup>
        </FormGroup>
        <FormGroup controlId='roles'>
          <ControlLabel>Roles</ControlLabel>
          <InputGroup>
                {roleItems}
            <ReactTooltip effect='solid' />
          </InputGroup>
        </FormGroup>
        {ReactTooltip.rebuild()}
        <FormGroup controlId='creditDebitDUFB'>
          <ControlLabel>Allowed to Process Earn/Spend Transactions</ControlLabel>
          <InputGroup>
            <Checkbox name='checkbox-options' className='creditDUFB' key='creditDUFB' defaultValue='true' >Earn</Checkbox>
            <Checkbox name='checkbox-options' className='debitDUFB' key='debitDUFB' defaultValue='true' >Spend</Checkbox>
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
