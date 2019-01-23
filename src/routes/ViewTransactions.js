import React from 'react';
import ReactDOM from 'react-dom';
import MCA from '../mca';
import { URL as MCA_URL } from '../mca';

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

export default class ViewTransaction extends React.Component {
  constructor() {
    super();
    this.state = {obj: null, edit: null};
  }

  componentDidMount() {
    this.loadObj();
  }

  toggleEdit() {
    this.setState({edit: !this.state.edit});
    this.setState({obj: null});
    this.loadObj();
  }

  showObjHistory() {
    vex.dialog.open({
      message: '<div style="height:160px;width:516px;overflow:auto;">'
          + '<table id="revisions" class="display" cellspacing="0" width="100%">'
            + '<thead>'
              + '<tr>'
                + '<th>Version</th>'
                + '<th>Revision Date</th>'
              + '</tr>'
            + '</thead>'
            + '<tbody style="cursor: pointer"></tbody>'
          + '</table>'
        + '</div>',
      buttons: [
        $.extend({}, vex.dialog.buttons.NO, {text: 'Cancel'})
      ],
      callback: (data) => {}
    });

    var table = $('#revisions')
      .dataTable({
        responsive: true,
        processing: true,
        serverSide: true,
        searching: false,
        lengthChange: false,
        ajax: {
          url: MCA_URL + 'datatables/ver/' + this.props.params.id,
          xhrFields: {
              withCredentials: true
          }
        },
        columns: [
          { name: "version" },
          { name: "createtime" }
        ],
        columnDefs: [
          { targets: [0], className: 'text-right' },
          { targets: [1], render: function (datum) {
                                    return moment.utc(datum).local().format('YYYY-MM-DD kk:mm:ss');
                                  } }
        ],
    });
    let that = this;
    $('#revisions tbody').on('click', 'tr', function() {
      var tableapi = table.DataTable();
      var data = tableapi.row(this).data();
      console.log('clicked' + data);
      window.location.href='/transaction/view/' + that.props.params.id + '/' + data[0];
    });
  }

  backToPresent() {
    window.location.href='/transaction/view/' + this.props.params.id;
  }

  status() {
    vex.dialog.confirm({
      message: 'Are you sure you want to '
                + (this.state.obj.status == 'ACTIVE' ? 'deactivate' : 're-activate')
                + ' this transaction?',
      callback: (value) => {
        if (!value) {
          // cancel
        } else {
          MCA.methodCall((this.state.obj.status == 'ACTIVE'
                            ? 'mca.deactivate'
                            : 'mca.reactivate'),
                         ['<ex:i8>'+this.state.obj.id+'</ex:i8>'],
                         function (error, value) {
            if (error) {
              console.log('error:', error);
              console.log('req headers:', error.req && error.req._header);
              console.log('res code:', error.res && error.res.statusCode);
              console.log('res body:', error.body);
            } else {
              if (Number(value) > 0) {
                vex.dialog.alert((this.state.obj.status == 'ACTIVE'
                                                            ? 'De-Activation'
                                                            : 'Re-Activation')
                                    +' Completed.');
                this.loadObj();
              } else {
                vex.dialog.alert('Status Change Failed.');
              }
            }
          }.bind(this));
        }
      }
    });
  }

  loadObj() {
    let params = ['<ex:i8>'+this.props.params.id+'</ex:i8>'];
    if (this.props.params.ver) {
      params.push(Number(this.props.params.ver));
    }
    MCA.methodCall('mca.view', params, function (error, value) {
      if (error) {
        console.log('error:', error);
        console.log('req headers:', error.req && error.req._header);
        console.log('res code:', error.res && error.res.statusCode);
        console.log('res body:', error.body);
      } else {
        this.setState({obj: JSON.parse(value)});
      }
    }.bind(this));
  }

  render() {
    if (!this.state.obj) {
      return <div>Loading...</div>;
    }
    if (this.props.params.ver) {
      return (
        <div id="transaction">
          <Row>
            <Col xs={8}>
              <PanelContainer controls={false}>
                <Panel>
                  <PanelHeader className='bg-red'>
                    <Grid>
                      <Row>
                        <Col className='fg-white'>
                          <div className='text-center fg-white'>
                            <h3>
                              Transaction: ID# {this.state.obj.id}
                            </h3>
                            <h4>
                              VERSION {this.props.params.ver} — {moment.utc(this.state.obj.lastModified).local().format('YYYY-MM-DD kk:mm:ss.SSS')}
                            </h4>
                          </div>
                        </Col>
                      </Row>
                    </Grid>
                  </PanelHeader>
                  <PanelBody>
                    <Grid>
                      <Row>
                        <Col xs={12}>
                          <TransactionTableComponent obj={this.state.obj}/>
                          <Button lg style={{marginBottom: 5, marginRight: 5, padding: 15}}
                              bsStyle='default' onClick={::this.showObjHistory}>Other Versions</Button>
                        </Col>
                      </Row>
                    </Grid>
                  </PanelBody>
                </Panel>
              </PanelContainer>
            </Col>
            <Col sm={4}>
              <PanelContainer controls={false}>
                <Panel>
                  <PanelBody className='bg-red'>
                    <Grid>
                      <Row>
                        <Col xs={12}>
                          <h3 className='fg-white' style={{textAlign: 'center', width: '100%'}}>
                            You are viewing a previous version of this object.
                          </h3>
                          <div className='text-center'>
                            <Button lg style={{marginBottom: 5, marginRight: 5, padding: 15}}
                                bsStyle='info' onClick={::this.backToPresent}>Return to Live Version</Button>
                          </div>
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
    return (
      <div id="transaction">
        <Row>
          <Col xs={12}>
            <PanelContainer controls={false}>
              <Panel>
                <PanelHeader className='bg-yellow'>
                  <Grid>
                    <Row>
                      <Col>
                        <div className='text-center'>
                          <h3 style={{margin: 0, padding: 25}}>
                            Transaction: ID# {this.state.obj.id}
                          </h3>
                        </div>
                      </Col>
                    </Row>
                  </Grid>
                </PanelHeader>
                <PanelBody>
                  <Grid>
                    <Row>
                      <Col xs={12}>
                        {this.state.edit
                            ? <TransactionEditTableComponent obj={this.state.obj}
                                toggleEdit={this.toggleEdit.bind(this)}/>
                            : <TransactionTableComponent obj={this.state.obj}/>}
                        {!this.state.edit
                            ? <Button lg style={{marginBottom: 5, marginRight: 5, padding: 15}}
                                bsStyle={this.state.obj.status == 'ACTIVE'
                                                                    ? 'danger'
                                                                    : 'success'}
                                onClick={::this.status} >
                                  {this.state.obj.status == 'ACTIVE'
                                    ? 'De-Activate'
                                    : 'Activate'} Transaction
                              </Button>
                            : ''}
                        {!this.state.edit
                            ? <Button lg style={{marginBottom: 5, marginRight: 5, padding: 15}} bsStyle='info'
                                onClick={::this.toggleEdit}>Edit</Button>
                            : ''}
                        {!this.state.edit
                          ? <Button lg style={{marginBottom: 5, marginRight: 5, padding: 15}}
                              bsStyle='default' onClick={::this.showObjHistory}>Other Versions</Button>
                          : '' }
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

class TransactionTableComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    var tDateParts = moment.utc(this.props.obj.createTime).local().format().split('T');
    var tDate = tDateParts[0] + ' ' + tDateParts[1].slice(0,8);

    return (
      <Table striped>
        <thead>
          <tr>
            <td><h4>Field</h4></td><td><h4>Value</h4></td>
          </tr>
        </thead>
        <tbody>
          <tr><td><b>ID</b></td><td>{this.props.obj.id}</td></tr>
          <tr><td><b>Date</b></td><td>{tDate}</td></tr>
          <tr><td><b>Vendor</b></td>
            <td><a href={'/vendor/view/'+this.props.obj.creditor.id}>
              {this.props.obj.creditor.email} ({this.props.obj.creditor.name})</a>
            </td>
          </tr>
          <tr><td><b>Customer</b></td>
            <td><a href={'/user/view/'+this.props.obj.debitor.id}>
              {this.props.obj.debitor.cardNumber ? this.props.obj.debitor.cardNumber.substring(6) : ''} ({this.props.obj.debitor.name})</a>
            </td>
          </tr>
          <tr><td><b>Location</b></td>
            <td><a href={this.props.obj.market ? '/market/view/'+this.props.obj.market.id : ''}>
              {this.props.obj.market ? this.props.obj.market.name : ''}</a>
            </td>
          </tr>
          <tr><td><b>Amount</b></td><td>{this.props.obj.amount.toFixed(2)}</td></tr>
          <tr><td><b>Amount Requested</b></td>
              <td>{this.props.obj.amountRequested ? this.props.obj.amountRequested.toFixed(2) : ''}</td></tr>
          <tr><td><b>Currency</b></td><td>{this.props.obj.currency.name}</td></tr>
          <tr><td><b>Terminal</b></td>
            <td><a href={this.props.obj.terminal != null
                  ? '/terminal/view/'+this.props.obj.terminal.id 
                : ''}>
              {this.props.obj.terminal != null ? this.props.obj.terminal.id : ''}</a>
            </td>
          </tr>
         <tr><td><b>Commit Message</b></td><td>{this.props.obj.commitMessage}</td></tr>
         <tr><td><b>Is Token Redemption?</b></td><td>{this.props.obj.tokenRedemption ? 'Yes' : 'No'}</td></tr>
         <tr><td><b>Status</b></td><td>{this.props.obj.status}</td></tr>
        </tbody>
       </Table>
    );
  }
}

class TransactionEditTableComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {attempting: false};

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

  editSubmit(e) {
    this.setState({attempting: true});
    e.preventDefault();
    e.stopPropagation();
    var updateObj = new Object();

    if ($(ReactDOM.findDOMNode(this.creditor))[0].value != this.props.obj.creditor.id) {
      updateObj.creditor = $(ReactDOM.findDOMNode(this.creditor))[0].value;
      this.props.obj.creditor = updateObj.creditor;
    }
    if ($(ReactDOM.findDOMNode(this.debitor))[0].value != this.props.obj.debitor.id) {
      updateObj.debitor = $(ReactDOM.findDOMNode(this.debitor))[0].value;
      this.props.obj.debitor = updateObj.debitor;
    }
    if ($(ReactDOM.findDOMNode(this.market))[0].value != this.props.obj.market.id) {
      updateObj.market = $(ReactDOM.findDOMNode(this.market))[0].value;
      this.props.obj.market = updateObj.market;
    }
    if ($(ReactDOM.findDOMNode(this.amount))[0].value != this.props.obj.amount
        && $(ReactDOM.findDOMNode(this.amount))[0].value != '') {
      updateObj.amount = $(ReactDOM.findDOMNode(this.amount))[0].value;
      this.props.obj.amount = updateObj.amount;
    }
    if ($(ReactDOM.findDOMNode(this.amountRequested))[0].value != this.props.obj.amountRequested
        && $(ReactDOM.findDOMNode(this.amountRequested))[0].value != '') {
      updateObj.amountRequested = $(ReactDOM.findDOMNode(this.amountRequested))[0].value;
      this.props.obj.amountRequested = updateObj.amountRequested;
    }
    if ($(ReactDOM.findDOMNode(this.commitMessage))[0].value != this.props.obj.commitMessage) {
      updateObj.commitMessage = $(ReactDOM.findDOMNode(this.commitMessage))[0].value;
      this.props.obj.commitMessage = updateObj.commitMessage;
    }

    var isToken = false;
    $('.isToken').find('input:checked').each(function() {
      isToken = $(this).val();
    });
    if (isToken == 'true') {
      updateObj.isToken = true;
    } else {
      updateObj.isToken = false;
    }

    MCA.methodCall('mca.update',
                   ['<ex:i8>'+this.props.obj.id+'</ex:i8>',
                    JSON.stringify(updateObj)],
                   function (error, value) {
      if (error) {
        console.log('error:', error);
        console.log('req headers:', error.req && error.req._header);
        console.log('res code:', error.res && error.res.statusCode);
        console.log('res body:', error.body);
      } else {
        if (!isNaN(value)) {
          this.props.toggleEdit();
        } else {

          // reset colors
          $(ReactDOM.findDOMNode(this.creditor))[0].style.borderColor = 'initial';
          $(ReactDOM.findDOMNode(this.debitor))[0].style.borderColor = 'initial';
          $(ReactDOM.findDOMNode(this.market))[0].style.borderColor = 'initial';
          $(ReactDOM.findDOMNode(this.amount))[0].style.borderColor = 'initial';
          $(ReactDOM.findDOMNode(this.amountRequested))[0].style.borderColor = 'initial';
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
          if (errorFields.indexOf('amountRequested') >= 0) {
            $(ReactDOM.findDOMNode(this.amountRequested))[0].style.borderColor = 'red';
          }
          if (errorFields.indexOf('commitMessage') >= 0) {
            $(ReactDOM.findDOMNode(this.commitMessage))[0].style.borderColor = 'red';
          }
          this.setState({attempting: false});
        }
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

    if (event.target.id == 'amountRequested') {
      var regex = /^-?\d{0,}$|^-?\d{0,}\.\d{0,2}$/;
      if (val.match(regex)) {
        this.setState({amountRequested: val});
      } else {
        event.target.value = this.state.amountRequested;
      }
    }
  }

  render() {
    var currentMarketItem = [];
    currentMarketItem.push(<option
                        key={0}
                        value={null}>
                          (Loading Markets...)
                      </option>);
    var marketItems = [];
    for(var k in this.state.myAllowedMarkets) {
      if (this.state.myAllowedMarkets[k].id == this.props.obj.market.id) {
        currentMarketItem = [];
        currentMarketItem.push(<option
                            key={this.state.myAllowedMarkets[k].id}
                            value={this.state.myAllowedMarkets[k].id}>
                          {this.state.myAllowedMarkets[k].name}
                        </option>);
      } else {
        marketItems.push(<option
                            key={this.state.myAllowedMarkets[k].id}
                            value={this.state.myAllowedMarkets[k].id}>
                          {this.state.myAllowedMarkets[k].name}
                        </option>);
      }
    }

    var currentVendorItem = [];
    currentVendorItem.push(<option
                        key={0}
                        value={null}>
                          (Loading Vendors...)
                      </option>);
    var vendorItems = [];
    for(var k in this.state.myAllowedVendors) {
      if (this.state.myAllowedVendors[k].id == this.props.obj.creditor.id) {
        currentVendorItem = [];
        currentVendorItem.push(<option
                            key={this.state.myAllowedVendors[k].id}
                            value={this.state.myAllowedVendors[k].id}>
                          {this.state.myAllowedVendors[k].name
                              + ' (' + this.state.myAllowedVendors[k].primaryMarket.name+')'}
                        </option>);
      } else {
        vendorItems.push(<option
                            key={this.state.myAllowedVendors[k].id}
                            value={this.state.myAllowedVendors[k].id}>
                          {this.state.myAllowedVendors[k].name
                              + ' (' + this.state.myAllowedVendors[k].primaryMarket.name+')'}
                        </option>);
      }
    }

    var tokenControl = [];
    if (this.props.obj.tokenRedemption) {
      tokenControl.push(<Checkbox
                              name='checkbox-options'
                              className='isToken'
                              key='isToken'
                              defaultValue='true'
                              defaultChecked >
                            Yes
                          </Checkbox>);
    } else {
      tokenControl.push(<Checkbox
                              name='checkbox-options'
                              className='isToken'
                              key='isToken'
                              defaultValue='true' >
                            Yes
                          </Checkbox>);
    }


    return (
      <Form onSubmit={::this.editSubmit}>
        <FormGroup controlId='id'>
          <ControlLabel>ID</ControlLabel>
          <InputGroup>
            <FormControl type='text' readOnly value={this.props.obj.id} />
          </InputGroup>
        </FormGroup>
        <FormGroup controlId='vendor'>
          <ControlLabel>Vendor</ControlLabel>
          <FormControl componentClass='select' ref={(c) => this.creditor = c}
              defaultValue={this.props.obj.creditor.id} placeholder='<select>'>
            {currentVendorItem}
            {vendorItems}
          </FormControl>
        </FormGroup>
        <FormGroup controlId='user'>
          <ControlLabel>Customer</ControlLabel>
          <InputGroup>
            <FormControl type='text' ref={(c) => this.debitor = c}
                defaultValue={this.props.obj.debitor.cardNumber != null
                    ? this.props.obj.debitor.cardNumber.substring(6)
                    : ''}
                placeholder='54321' onFocus={this.validate.bind(this)} onChange={this.validate.bind(this)} />
          </InputGroup>
        </FormGroup>
        <FormGroup controlId='market'>
          <ControlLabel>Market</ControlLabel>
          <FormControl componentClass='select' ref={(c) => this.market = c}
              defaultValue={this.props.obj.market.id} placeholder='<select>'>
            {currentMarketItem}
            {marketItems}
          </FormControl>
        </FormGroup>
        <FormGroup controlId='amount'>
          <ControlLabel>Amount</ControlLabel>
          <InputGroup>
            <FormControl type='text' ref={(c) => this.amount = c}
                defaultValue={this.props.obj.amount != null
                    ? this.props.obj.amount
                    : ''}
                placeholder='3.50' onFocus={this.validate.bind(this)} onChange={this.validate.bind(this)} />
          </InputGroup>
        </FormGroup>
        <FormGroup controlId='amountRequested'>
          <ControlLabel>Amount Requested</ControlLabel>
          <InputGroup>
            <FormControl type='text' ref={(c) => this.amountRequested = c}
                defaultValue={this.props.obj.amountRequested != null
                    ? this.props.obj.amountRequested
                    : ''}
                placeholder='3.50' onFocus={this.validate.bind(this)} onChange={this.validate.bind(this)} />
          </InputGroup>
        </FormGroup>
        <FormGroup controlId='commitMessage'>
          <ControlLabel>Commit Message</ControlLabel>
          <InputGroup>
            <FormControl type='text' ref={(c) => this.commitMessage = c}
                defaultValue={this.props.obj.commitMessage != null
                    ? this.props.obj.commitMessage
                    : ''} />
          </InputGroup>
        </FormGroup>
        <FormGroup controlId='isToken'>
          <ControlLabel>Is Token Redemption?</ControlLabel>
          <InputGroup>
            {tokenControl}
          </InputGroup>
        </FormGroup>
        <FormGroup>
          <Grid>
            <Row>
              <Col xs={6} collapseLeft collapseRight className='text-right'>
                <Button outlined lg type='submit' bsStyle='blue' onClick={::this.editSubmit} disabled={this.state.attempting}>Save</Button>
              </Col>
            </Row>
          </Grid>
        </FormGroup>
      </Form>
    );
  }
}
