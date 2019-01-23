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
  FormGroup,
  InputGroup,
  ControlLabel,
  FormControl
} from '@sketchpixy/rubix';

export default class ViewCurrency extends React.Component {
  constructor() {
    super();
    this.state = {obj: null, transactions: null, edit: null};
  }

  componentDidMount() {
    this.loadObj();
  }

  toggleEdit() {
    this.setState({edit: !this.state.edit});
    this.setState({obj: null});
    this.loadObj();
  }

  status() {
    vex.dialog.confirm({
      message: 'Are you sure you want to '
          + (this.state.obj.status == 'ACTIVE'
              ? 'deactivate'
              : 're-activate')
          + ' this currency?',
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
                    + ' Completed.');
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
      window.location.href='/currency/view/' + that.props.params.id + '/' + data[0];
    });
  }

  backToPresent() {
    window.location.href='/currency/view/' + this.props.params.id;
  }

  render() {
    if (!this.state.obj) {
      return <div>Loading...</div>;
    }
    if (this.props.params.ver) {
      return (
        <div id="currency">
          <Row>
            <Col sm={8}>
              <PanelContainer controls={false}>
                <Panel>
                  <PanelHeader className='bg-red'>
                   <Grid>
                      <Row>
                        <Col className='fg-white'>
                          <div className='text-center fg-white'>
                            <h3 style={{margin: 0, padding: 25}}>
                              Currency: ID# {this.state.obj.id} ({this.state.obj.name})
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
                          <CurrencyTableComponent  obj={this.state.obj}/>
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
      <div id="currency">
        <Row>
          <Col sm={8}>
            <PanelContainer controls={false}>
              <Panel>
                <PanelHeader className='bg-yellow'>
                  <Grid>
                    <Row>
                      <Col className='fg-white'>
                        <div className='text-center fg-white'>
                          <h3 style={{margin: 0, padding: 25}}>
                            Currency: ID# {this.state.obj.id} ({this.state.obj.name})
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
                        <h3>Currency: ID# {this.state.obj.id} ({this.state.obj.name})</h3>
                        {this.state.edit
                            ? <CurrencyEditTableComponent obj={this.state.obj} toggleEdit={this.toggleEdit.bind(this)}/>
                            : <CurrencyTableComponent  obj={this.state.obj}/>}
                        {!this.state.edit
                            ? <Button lg style={{marginBottom: 5, marginRight: 5, padding: 15}}
                                  bsStyle={this.state.obj.status == 'ACTIVE'
                                      ? 'danger'
                                      : 'success'} onClick={::this.status}>
                                {this.state.obj.status == 'ACTIVE'
                                    ? 'De-Activate'
                                    : 'Activate'} Currency
                              </Button>
                            : '' }
                        {!this.state.edit
                            ? <Button lg style={{marginBottom: 5, marginRight: 5, padding: 15}}
                                  bsStyle='info' onClick={::this.toggleEdit}>Edit</Button>
                            : '' }
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
          <Col sm={4}>
            <PanelContainer controls={false}>
              <Panel>
                <Grid>
                  <Row>
                    <Col xs={12}>
                      <h3 style={{textAlign: 'center', width: '100%'}}>Recent Transactions</h3>
Coming soon!
                      { false
                        ? <CurrencyTransactionHistoryComponent {...this.props} />
                        : ''
                      }
                    </Col>
                  </Row>
                </Grid>
              </Panel>
            </PanelContainer>
          </Col>
        </Row>
      </div>
    );
  }
}

/*
class CurrencyTransactionHistoryComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {earn: null, spend: null, earnTotal: null, spendTotal: null};
  }

  componentDidMount() {
    this.loadHistory();
  }

  renderTransactionHistory() {
    var uu_data = [];
    var earn = 0;
    var spend = 0;
    for (var k in this.state.earn) {
      var txnE = this.state.earn[k];
      var txnS = this.state.spend[k];
      if (txnE.date >= moment.utc().local().subtract(1, 'week').valueOf()) {
        
        uu_data.push({
          date: moment.utc(parseInt(txnE.date)).local().format().split('T')[0],
          earn: Number(txnE.earn).toFixed(2),
          spend: Number(txnS.spend).toFixed(2)
        });
      }
    }
    if (uu_data.length > 0) {
      Morris.Line({
        element: 'transactionHistory',
        data: uu_data,
        xkey: 'date',
        ykeys: ['earn', 'spend'], 
        labels: ['Amount Loaded', 'Amount Redeemed'],
        xLabels: 'time',
        lineColors: ['#60B044', '#D62728'],
        pointSize: 2,
        resize: true,
        hideHover: 'auto',
        redraw: true
      });
    }
  }

  loadHistory() {
    var interval = 1;
    var endDate = moment.utc().local();
    var startDate = endDate.subtract(1, 'weeks');
    var args = ['<ex:i8>'+startDate.valueOf()+'</ex:i8>',
                '<ex:i8>'+endDate.valueOf()+'</ex:i8>',
                interval,
                '<ex:i8>'+this.props.params.id+'</ex:i8>'];

    MCA.methodCall('mca.genReportTransactionData', args, function (error, value) {
      if (error) {
        console.log('error:', error);
        console.log('req headers:', error.req && error.req._header);
        console.log('res code:', error.res && error.res.statusCode);
        console.log('res body:', error.body);
      } else {
        var earn = [];
        var spend = [];
        var totalEarn = 0;
        var totalSpend = 0;
        value = JSON.parse(value);
        for (var d in value) {
          var totalEarnAcrossCurrencys = 0;
          var totalSpendAcrossCurrencys = 0;
          for (var m in value[d]) {
            totalEarnAcrossCurrencys += value[d][m].earn;
            totalSpendAcrossCurrencys += value[d][m].spend;
          }

          earn.push({
            date: d,
            earn: totalEarnAcrossCurrencys
          });
          totalEarn += totalEarnAcrossCurrencys;

          spend.push({
            date: d,
            spend: totalSpendAcrossCurrencys
          });
          totalSpend += totalSpendAcrossCurrencys;
        }
        this.setState({earn: earn,
                      spend: spend,
                  earnTotal: totalEarn,
                 spendTotal: totalSpend});
      }
    }.bind(this));

    var table = $(ReactDOM.findDOMNode(this.txnTable));
    table
      .addClass('nowrap')
      .dataTable({
        responsive: true,
        processing: true,
        serverSide: true,
        ajax: {
          url: MCA_URL + 'datatables/txn/' + this.props.params.id,
          xhrFields: {
              withCredentials: true
          }
        },
        columns: [
          { name: "createDate" },
          { name: "amount" },
          { name: "creditor" },
          { name: "debitor" },
          { name: "id" }
        ],
        columnDefs: [
          { targets: [1, 4], className: 'text-right' },
          { targets: [1], render: function (datum) {
                                    return moment.utc(datum).local().format('YYYY-MM-DD kk:mm:ss');
                                  } }
        ],
        dom: 'Blfrtip',
        lengthMenu: [[10, 25, 50, -1],[10, 25, 50, "all"]],
        buttons: [
          {
            extend: 'csv',
            text: ' [Export CSV] '
          },
          {
            extend: 'excel',
            text: ' [Export XLSX] '
          },
          {
            extend: 'pdf',
            text: ' [Export PDF] '
          }
        ]
    });

    $('#tcontent').on('click', 'tr', function() {
      var tableapi = table.DataTable();
      var data = tableapi.row(this).data();
      window.location.href='/transaction/view/'+data[4];
    });
  }

  render() {
    if (this.state.earn != null && this.state.spend != null) {
      this.renderTransactionHistory();
    }
    return (
      <div>
        <PanelContainer controls={false}>
          <Panel style={{color: '#FFFFFF', backgroundColor: '#60B044'}}>
            <PanelBody style={{padding: 5}}>
              <h4 style={{textAlign: 'center'}}>
                Total Earn This Week<br/>
                ${this.state.earnTotal == null
                    ? '. . .'
                    : this.state.earnTotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</h4>
            </PanelBody>
          </Panel>
        </PanelContainer>
        <PanelContainer controls={false}>
          <Panel style={{color: '#FFFFFF', backgroundColor: '#D62728'}}>
            <PanelBody style={{padding: 5}}>
              <h4 style={{textAlign: 'center'}}>
                Total Spend This Week<br/>
                ${this.state.spendTotal == null
                    ? '. . .'
                    : this.state.spendTotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</h4>
            </PanelBody>
          </Panel>
        </PanelContainer>
        <div id="transactionHistory"></div>
        <div>
          <Table ref={(c) => this.txnTable = c} className='display' cellSpacing='0' width='100%'>
            <thead>
              <tr>
                <td>Date</td>
                <td>Amount</td>
                <td>Vendor</td>
                <td>User</td>
                <td>Transaction ID</td>
              </tr>
            </thead>
            <tbody id='tcontent'>
            </tbody>
          </Table>
          <br/>
        </div>
      </div>
    );
  }
}
*/

class CurrencyTableComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Table striped>
        <thead>
          <tr>
            <td><h4>Field</h4></td><td><h4>Value</h4></td>
          </tr>
        </thead>
        <tbody>
          <tr><td><b>ID</b></td><td>{this.props.obj.id}</td></tr>
          <tr><td><b>Name</b></td><td>{this.props.obj.name}</td></tr>
          <tr><td><b>Code</b></td><td>{this.props.obj.code}</td></tr>
          <tr><td><b>Daily Limit ($)</b></td><td>{this.props.obj.dailyLimit}</td></tr>
          <tr><td><b>Status</b></td><td>{this.props.obj.status}</td></tr>
        </tbody>
      </Table>
    );
  }
}

class CurrencyEditTableComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {attempting: false};
  }

  editSubmit(e) {
    this.setState({attempting: true});
    e.preventDefault();
    e.stopPropagation();
    var updateObj = new Object();

    if ($(ReactDOM.findDOMNode(this.name))[0].value != this.props.obj.name) {
      updateObj.name = $(ReactDOM.findDOMNode(this.name))[0].value;
      this.props.obj.name = updateObj.name;
    }
    if ($(ReactDOM.findDOMNode(this.code))[0].value != this.props.obj.code) {
      updateObj.code = $(ReactDOM.findDOMNode(this.code))[0].value;
      this.props.obj.code = updateObj.code;
    }
    if ($(ReactDOM.findDOMNode(this.dailyLimit))[0].value != this.props.obj.dailyLimit) {
      updateObj.dailyLimit = $(ReactDOM.findDOMNode(this.dailyLimit))[0].value;
      this.props.obj.dailyLimit = updateObj.dailyLimit;
    }

    MCA.methodCall('mca.update', ['<ex:i8>'+this.props.obj.id+'</ex:i8>',JSON.stringify(updateObj)], function (error, value) {
      if (error) {
        console.log('error:', error);
        console.log('req headers:', error.req && error.req._header);
        console.log('res code:', error.res && error.res.statusCode);
        console.log('res body:', error.body);
      } else {
        this.setState({attempting: false});
        if (!isNaN(value)) {
          this.props.toggleEdit();
        } else {
          // reset colors
          $(ReactDOM.findDOMNode(this.name))[0].style.borderColor = 'initial';

          var errorFields = JSON.parse(value);
          // show errors
          if (errorFields.indexOf('name') >= 0) {
            $(ReactDOM.findDOMNode(this.name))[0].style.borderColor = 'red';
          }
        }
      }
    }.bind(this));
  }

  render() {
    return (
      <Form onSubmit={::this.editSubmit}>
        <FormGroup controlId='id'>
          <ControlLabel>ID</ControlLabel>
          <InputGroup>
            <FormControl type='text' readOnly value={this.props.obj.id} />
          </InputGroup>
        </FormGroup>
        <FormGroup controlId='name'>
          <ControlLabel>Name</ControlLabel>
          <InputGroup>
            <FormControl type='text' size='36' ref={(c) => this.name = c} 
								defaultValue={this.props.obj.name != null 
										? this.props.obj.name 
										: ''} 
								placeholder='Double Up (MI)' />
          </InputGroup>
        </FormGroup>
        <FormGroup controlId='code'>
          <ControlLabel>Code</ControlLabel>
          <InputGroup>
            <FormControl type='text' size='36' ref={(c) => this.code = c} 
								defaultValue={this.props.obj.code != null 
										? this.props.obj.code 
										: ''} 
								placeholder='DUFB_MI' />
          </InputGroup>
        </FormGroup>
        <FormGroup controlId='limit'>
          <ControlLabel>Daily Limit ($)</ControlLabel>
          <InputGroup>
            <FormControl type='text' ref={(c) => this.dailyLimit = c} 
								defaultValue={this.props.obj.dailyLimit != null 
										? this.props.obj.dailyLimit 
										: ''} 
								placeholder='20'/>
          </InputGroup>
        </FormGroup>
        <FormGroup>
          <Grid>
            <Row>
              <Col xs={6} className='text-right'>
                <Button outlined lg type='submit' bsStyle='blue' onClick={::this.editSubmit} disabled={this.state.attempting}>Save</Button>
              </Col>
            </Row>
          </Grid>
        </FormGroup>
      </Form>
    );
  }
}
