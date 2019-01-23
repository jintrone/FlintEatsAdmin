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
  Checkbox,
  FormGroup,
  InputGroup,
  ControlLabel,
  FormControl
} from '@sketchpixy/rubix';

export default class CreateTransaction extends React.Component {
  constructor() {
    super();
    this.state = {obj: null};
  }

  componentDidMount() {
    $('#createTime').datetimepicker({
      inline: true,
      defaultDate: new Date(),
      sideBySide: true
    });
  }

  render() {
   return (
     <div id='transaction'>
      <Row>
        <Col xs={12}>
          <PanelContainer controls={false}>
            <Panel>
              <PanelBody>
                <Grid>
                  <Row>
                    <Col xs={12}>
                      <h3>New Transaction</h3>
                      <TransactionEditTableComponent />
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
class TransactionEditTableComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {attempting: false};
    this.realAddr = null;

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

    MCA.methodCall('mca.getAllowedVendors', [], function (error, value) {
      if (error) {
        console.log('error:', error);
        console.log('req headers:', error.req && error.req._header);
        console.log('res code:', error.res && error.res.statusCode);
        console.log('res body:', error.body);
      } else {
        value = JSON.parse(value);
        this.setState({myAllowedVendors: value});
      }
    }.bind(this));
  }

  createSubmit(e) {
    this.setState({attempting: true});
    e.preventDefault();
    e.stopPropagation();
    var newObj = new Object();


    newObj.creditor = $(ReactDOM.findDOMNode(this.creditor))[0].value;
    newObj.debitor = $(ReactDOM.findDOMNode(this.debitor))[0].value;
    newObj.market = $(ReactDOM.findDOMNode(this.market))[0].value;
    newObj.amount = $(ReactDOM.findDOMNode(this.amount))[0].value;
    newObj.commitMessage = $(ReactDOM.findDOMNode(this.commitMessage))[0].value;

// currency inherited from market
//    newObj.currency = 'DUFB';
    newObj.createTime = new Date($('#createTime').data('date')).getTime();


    var isToken = false;
    $('.isToken').find('input:checked').each(function() {
      isToken = $(this).val();
    });
    if (isToken == 'on') {
      newObj.isToken = true;
    } else {
      newObj.token = false;
    }

    var force = false;
    $('.force').find('input:checked').each(function() {
      force = $(this).val();
    });
    if (force == 'on') {
      newObj.force = true;
    } else {
      newObj.force = false;
    }

    MCA.methodCall('mca.transactionCreateAtTimeDryRun',
                   [newObj.debitor,
                    '<ex:i8>'+newObj.creditor+'</ex:i8>',
                    Number(newObj.amount),
                   /* newObj.currency, */
                    newObj.commitMessage,
                    '<ex:i8>'+newObj.createTime+'</ex:i8>',
                    newObj.isToken,
                    newObj.force],
                   function (error, val) {
      if (error) {
        console.log('error:', error);
        console.log('req headers:', error.req && error.req._header);
        console.log('res code:', error.res && error.res.statusCode);
        console.log('res body:', error.body);
      } else if (!isNaN(val)) {

        //TODO: refactor this to not have duplicate function call  
        MCA.methodCall('mca.transactionCreateAtTime',
                       [newObj.debitor,
                        '<ex:i8>'+newObj.creditor+'</ex:i8>',
                        Number(newObj.amount),
                      /* newObj.currency, */
                        newObj.commitMessage,
                        '<ex:i8>'+newObj.createTime+'</ex:i8>',
                        newObj.isToken,
                        newObj.force],
                       function (error, value) {
          if (error) {
            console.log('error:', error);
            console.log('req headers:', error.req && error.req._header);
            console.log('res code:', error.res && error.res.statusCode);
            console.log('res body:', error.body);
          } else {
            if (!isNaN(value)) {
              this.props.router.push('/transaction/view/'+value);
            } else {

              vex.dialog.alert(value);

              // reset colors
              $(ReactDOM.findDOMNode(this.creditor))[0].style.borderColor = 'initial';
              $(ReactDOM.findDOMNode(this.debitor))[0].style.borderColor = 'initial';
              $(ReactDOM.findDOMNode(this.market))[0].style.borderColor = 'initial';
              $(ReactDOM.findDOMNode(this.amount))[0].style.borderColor = 'initial';
              $(ReactDOM.findDOMNode(this.commitMessage))[0].style.borderColor = 'initial';

              var errorFields = JSON.parse(value);
              // show errors
              if (errorFields.indexOf('creditor') >= 0) {
                $(ReactDOM.findDOMNode(this.creditor))[0].style.borderColor = 'red';
              }
              if (errorFields.indexOf('debitor') >= 0) {
                $(ReactDOM.findDOMNode(this.debitor))[0].style.borderColor = 'red';
              }
              if (errorFields.indexOf('market') >= 0) {
                $(ReactDOM.findDOMNode(this.market))[0].style.borderColor = 'red';
              }
              if (errorFields.indexOf('amount') >= 0) {
                $(ReactDOM.findDOMNode(this.amount))[0].style.borderColor = 'red';
              }
              if (errorFields.indexOf('commitMessage') >= 0) {
                $(ReactDOM.findDOMNode(this.commitMessage))[0].style.borderColor = 'red';
              }
              this.setState({attempting: false});
            }
          }
        }.bind(this));
      } else { 
        vex.dialog.confirm({
          message: val,
          callback: (vval) => {
            if (!vval) {
              // cancel
            } else {
              //TODO: refactor this to not have duplicate function call  
              MCA.methodCall('mca.transactionCreateAtTime',
                             [newObj.debitor,
                              '<ex:i8>'+newObj.creditor+'</ex:i8>',
                              Number(newObj.amount),
                              /* newObj.currency, */
                              newObj.commitMessage,
                              '<ex:i8>'+newObj.createTime+'</ex:i8>',
                              newObj.isToken,
                              newObj.force],
                             function (error, value) {
                if (error) {
                  console.log('error:', error);
                  console.log('req headers:', error.req && error.req._header);
                  console.log('res code:', error.res && error.res.statusCode);
                  console.log('res body:', error.body);
                } else {
                  if (!isNaN(value)) {
                    this.props.router.push('/transaction/view/'+value);
                  } else {
                    vex.dialog.alert(value);

                    // reset colors
                    $(ReactDOM.findDOMNode(this.creditor))[0].style.borderColor = 'initial';
                    $(ReactDOM.findDOMNode(this.debitor))[0].style.borderColor = 'initial';
                    $(ReactDOM.findDOMNode(this.market))[0].style.borderColor = 'initial';
                    $(ReactDOM.findDOMNode(this.amount))[0].style.borderColor = 'initial';
                    $(ReactDOM.findDOMNode(this.commitMessage))[0].style.borderColor = 'initial';

                    var errorFields = JSON.parse(value);
                    // show errors
                    if (errorFields.indexOf('creditor') >= 0) {
                      $(ReactDOM.findDOMNode(this.creditor))[0].style.borderColor = 'red';
                    }
                    if (errorFields.indexOf('debitor') >= 0) {
                      $(ReactDOM.findDOMNode(this.debitor))[0].style.borderColor = 'red';
                    }
                    if (errorFields.indexOf('market') >= 0) {
                      $(ReactDOM.findDOMNode(this.market))[0].style.borderColor = 'red';
                    }
                    if (errorFields.indexOf('amount') >= 0) {
                      $(ReactDOM.findDOMNode(this.amount))[0].style.borderColor = 'red';
                    }
                    if (errorFields.indexOf('commitMessage') >= 0) {
                      $(ReactDOM.findDOMNode(this.commitMessage))[0].style.borderColor = 'red';
                    }
                    this.setState({attempting: false});
                  }
                }
              }.bind(this));
            }
          }
        });
      }
    }.bind(this));
  }

  getMarketVendors(event) {
    // get vendor dropdown
    var vDD = $(ReactDOM.findDOMNode(this.creditor))[0];
    vDD.disabled = true;
    // remove all vendors
    for (var i = 0; i < vDD.length; i++) {
      vDD.remove(i);
    }
    while (vDD.firstChild) {
      vDD.removeChild(vDD.firstChild);
    }

    // loading
    var loadOpt = document.createElement('option');
    loadOpt.appendChild(document.createTextNode('(Loading...)'));
    vDD.appendChild(loadOpt);

    var marketId = event.target.value;
    MCA.methodCall('mca.getVendorsAllowedAtMarket', ['<ex:i8>'+marketId+'</ex:i8>'], function (error, value) {
      if (error) {
        console.log('error:', error);
        console.log('req headers:', error.req && error.req._header);
        console.log('res code:', error.res && error.res.statusCode);
        console.log('res body:', error.body);
      } else {
        var renderVendors = JSON.parse(value);

        // remove all vendors
        for (var i = 0; i < vDD.length; i++) {
          vDD.remove(i);
        }
        while (vDD.firstChild) {
          vDD.removeChild(vDD.firstChild);
        }

        // add back wanted vendors
        for (var v in renderVendors) {
          if (renderVendors[v].status == "ACTIVE") {
            var opt = document.createElement('option');
            opt.appendChild(document.createTextNode(renderVendors[v].name+' ('+renderVendors[v].primaryMarket.name+')'));
            opt.value = renderVendors[v].id;
            vDD.appendChild(opt);
          }
        }

        // enable vendor select
        vDD.disabled = false;
      }
    }.bind(this));
  }

  validate(event) {
    var val = event.target.value;

    if (event.target.id == 'user') {
      var regex = /^\d{0,19}$|^$/;
      if (val.match(regex)) {
        this.setState({cardNum: val});
      } else {
        event.target.value = this.state.cardNum;
      }
    }

    if (event.target.id == 'amount') {
      var regex = /^-?\d{0,}$|^-?\d{0,}\.\d{0,2}$/;
      if (val.match(regex)) {
        this.setState({amount: val});
      } else {
        event.target.value = this.state.amount;
      }
    }
  }

  warn(event) {
    event.persist();
    if (event.target.checked) {
      vex.dialog.confirm({
        message: "WARNING: Forcing the transaction overrides program rules, and can cause exceeding of earn limits, negative balances, and/or inconsistencies in reporting.",
        callback: (value) => {
          if (!value) {
            event.target.checked = false;
          }
        }
      });
    }
  }

  render() {
    var marketItems = [];
    marketItems.push(<option value={-1} >{'<Select Market>'}</option>);
    for(var k in this.state.myAllowedMarkets) {
      if (this.state.myAllowedMarkets[k].name != 'null') {
        marketItems.push(<option key={this.state.myAllowedMarkets[k].id} value={this.state.myAllowedMarkets[k].id} >{this.state.myAllowedMarkets[k].name}</option>);
      }
    }

    var vendorItems = [];
    for(var k in this.state.myAllowedVendors) {
 //     vendorItems.push(<option key={this.state.myAllowedVendors[k].id} value={this.state.myAllowedVendors[k].id} >{this.state.myAllowedVendors[k].name+' ('+this.state.myAllowedVendors[k].primaryMarket.name+')'}</option>);
    }
    vendorItems.push(<option value={-1} >{'(Select Market First)'}</option>);
    

    return (
     <Form onSubmit={::this.createSubmit}>
       <FormGroup controlId='market'>
         <ControlLabel>Market</ControlLabel>
         <FormControl componentClass='select' ref={(c) => this.market = c} placeholder='<select>' onChange={this.getMarketVendors.bind(this)}>
           {marketItems}
         </FormControl>
       </FormGroup>
       <FormGroup controlId='vendor'>
         <ControlLabel>Vendor</ControlLabel>
         <FormControl disabled componentClass='select' ref={(c) => this.creditor = c} placeholder='<select>'>
           {vendorItems}
         </FormControl>
       </FormGroup>
       <FormGroup controlId='user'>
         <ControlLabel>Customer Card Number</ControlLabel>
         <InputGroup>
           <FormControl type='text' ref={(c) => this.debitor = c} placeholder='1234567890123' onFocus={this.validate.bind(this)} onChange={this.validate.bind(this)} />
         </InputGroup>
       </FormGroup>
       <FormGroup controlId='amount'>
         <ControlLabel>Amount Requested</ControlLabel>
         <InputGroup>
           <FormControl type='text' ref={(c) => this.amount = c} placeholder='3.50' onFocus={this.validate.bind(this)} onChange={this.validate.bind(this)} />
         </InputGroup>
       </FormGroup>
       <FormGroup controlId='commitMessage'>
         <ControlLabel>Reason for Change</ControlLabel>
         <InputGroup>
           <FormControl type='text' ref={(c) => this.commitMessage = c} />
         </InputGroup>
       </FormGroup>
       <FormGroup controlId='isToken'>
         <InputGroup>
           <Checkbox name='checkbox-options' className='isToken' key='isToken'>Is Token Redemption</Checkbox>
         </InputGroup>
       </FormGroup>
       <FormGroup controlId='createTime'>
         <ControlLabel>Create Time</ControlLabel>
         <Row>
           <Col xs={4} collapseRight>
             <div id="createTime"></div>
           </Col>
         </Row>
       </FormGroup>
       <FormGroup controlId='force'>
         <InputGroup>
           <Checkbox name='checkbox-options' className='force' key='force' onChange={this.warn.bind(this)}>Force Transaction</Checkbox>
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

