import React from 'react';
import ReactDOM from 'react-dom';
import ReactTooltip from 'react-tooltip';
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

export default class ViewVendor extends React.Component {
  constructor() {
    super();
    this.state = {obj: null, edit: false, isAdmin: false};
  }

  componentDidMount() {
    this.loadObj();
  }
 
  toggleEdit() {
    this.setState({edit: !this.state.edit});
    this.setState({obj: null});
    this.loadObj();
  }  
 
  loadObj() {

    MCA.methodCall('mca.hasRole', ['admin'], function (error, value) {
      if (error) {
        console.log('error:', error);
        console.log('req headers:', error.req && error.req._header);
        console.log('res code:', error.res && error.res.statusCode);
        console.log('res body:', error.body);
      } else {
        this.setState({isAdmin: value});
      }
    }.bind(this))

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

  password() {
    vex.dialog.open({
      message: 'Enter New Password:',
      input: ''
        + '<input name="password" type="password" placeholder="Password" required />'
        + '<input name="passwordconfirm" type="password" placeholder="Confirm Password" required />'
        + ' <input name="expire" type="checkbox" value="expire"> Expire Password',
      buttons: [
          $.extend({}, vex.dialog.buttons.YES, { text: 'Change Password' }),
          $.extend({}, vex.dialog.buttons.NO, { text: 'Cancel' })
      ],
      callback: (data) => {
        if (!data) {
          // cancel
        } else {
          if (data.password != data.passwordconfirm) {
            vex.dialog.alert('Password and Confirm Password Do Not Match');
          } else {
            let expire = (data.expire == 'expire');
            MCA.methodCall('mca.passwordChange', [this.state.obj.email, data.password, expire], function (error, value) {
              if (error) {
                console.log('error:', error);
                console.log('req headers:', error.req && error.req._header);
                console.log('res code:', error.res && error.res.statusCode);
                console.log('res body:', error.body);
              } else {
                if (Number(value) > 0) {
                  vex.dialog.alert('Password Change Completed.');
                } else {
                  vex.dialog.alert('Password Change Failed.<br/>' + value);
                }
              }
            }.bind(this));
          }
        }
      }
    });
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
      window.location.href='/vendor/view/' + that.props.params.id + '/' + data[0];
    });
  }

  backToPresent() {
    window.location.href='/vendor/view/' + this.props.params.id;
  }

  status() {
    vex.dialog.confirm({
      message: 'Are you sure you want to '
                  + (this.state.obj.status == 'ACTIVE'
                      ? 'deactivate'
                      : 're-activate')
                  + ' this user?',
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

  expire() {
    vex.dialog.confirm({
      message: 'Are you sure you want to expire this password?<br/>'
                  + 'The account holder will be forced to change it at next login.',
      callback: (value) => {
        if (!value) {
          // cancel
        } else {
          MCA.methodCall('mca.passwordExpire',
                         ['<ex:i8>'+this.state.obj.id+'</ex:i8>'],
                         function (error, value) {
            if (error) {
              console.log('error:', error);
              console.log('req headers:', error.req && error.req._header);
              console.log('res code:', error.res && error.res.statusCode);
              console.log('res body:', error.body);
            } else {
              if (Number(value) > 0) {
                vex.dialog.alert('Password Expiration Completed.');
                this.loadObj();
              } else {
                vex.dialog.alert('Password Expiration Failed:<br/>' + value);
              }
            }
          }.bind(this));
        }
      }
    });
  }

  render() {
    if (!this.state.obj) {
      return <div>Loading...</div>;
    }
    if (this.props.params.ver) {
      return (
        <div id="vendor">
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
                              Vendor: ID# {this.state.obj.id} ({this.state.obj.name})
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
                          <VendorTableComponent obj={this.state.obj}/>
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
      <div id="vendor">
        <Row>
          <Col sm={8}>
            <PanelContainer controls={false}>
              <Panel>
                <PanelHeader className='bg-green'>
                 <Grid>
                    <Row>
                      <Col className='fg-white'>
                        <div className='text-center fg-white'>
                          <h3 style={{margin: 0, padding: 25}}>Vendor: ID# {this.state.obj.id} ({this.state.obj.name})</h3>
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
                          ? <VendorEditTableComponent obj={this.state.obj} toggleEdit={this.toggleEdit.bind(this)}/>
                          : <VendorTableComponent obj={this.state.obj}/>}
                        {!this.state.edit
                          ? <Button lg style={{marginBottom: 5, marginRight: 5, padding: 15}}
                                bsStyle={this.state.obj.status == 'ACTIVE'
                                          ? 'danger'
                                          : 'success'}
                                onClick={::this.status}>
                                {this.state.obj.status == 'ACTIVE'
                                  ? 'De-Activate'
                                  : 'Activate'} Vendor</Button>
                          : ''}
                        {(this.state.isAdmin && !this.state.edit)
                          ? <Button lg style={{marginBottom: 5, marginRight: 5, padding: 15}}
                                bsStyle='info' onClick={::this.toggleEdit}>Edit</Button>
                          : ''}
                        {!this.state.edit
                          ? <Button lg style={{marginBottom: 5, marginRight: 5, padding: 15}}
                                bsStyle='primary' onClick={::this.password}>Change Password</Button>
                          : '' }
                        {!this.state.edit
                          ? <Button lg style={{marginBottom: 5, marginRight: 5, padding: 15}}
                                bsStyle='warning' onClick={::this.expire}>Expire Password</Button>
                          : '' }
                        {(this.state.isAdmin && !this.state.edit)
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
                      <VendorTransactionHistoryComponent isAdmin={this.state.isAdmin} {...this.props} />
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


class VendorTransactionHistoryComponent extends React.Component {
  constructor() {
    super();
    this.state = {obj: null, earn: null, spend: null, weekearn: 0, weekspend: 0, txnSpend: null, txnEarn: null};
    this.tablerows = '';
  }

  loadHistory() {
    MCA.methodCall('mca.find', ['transaction','vendor',''+this.props.params.id], function (error, value) {
      if (error) {
        console.log('error:', error);
        console.log('req headers:', error.req && error.req._header);
        console.log('res code:', error.res && error.res.statusCode);
        console.log('res body:', error.body);
      } else {
        var txnEarnHistory = [];
        var txnSpendHistory = [];
        $.each(JSON.parse(value), $.proxy(function(i, value) {
          var weekStart = moment.utc(value.createTime).local().startOf('week');
          var field = function(value) {
            return '<td>'+value+'</td>';
          }
          value.primaryMarket != null
            ? value.primaryMarket = value.primaryMarket.name
            : value.primaryMarket = 'Not Specified';

          if (value.debitor.name == null
              || value.debitor.name == ' '
              || value.debitor.name == 'null null') {
            value.debitor.cardNumber
              ? value.debitor = value.debitor.cardNumber
              : value.debitor = value.debitor.id;
          } else {
            value.debitor = value.debitor.name;
          }

          if (isNaN(txnEarnHistory[weekStart.valueOf()])) {
              txnEarnHistory[weekStart.valueOf()] = 0;
          }
          if (isNaN(txnSpendHistory[weekStart.valueOf()])) {
              txnSpendHistory[weekStart.valueOf()] = 0;
          }
          if (value.amount >= 0) {
            var earn = this.state.earn + value.amount;
            this.setState({earn: earn});
            txnEarnHistory[weekStart.valueOf()] += Number(value.amount);
          } else {
            var spend = this.state.spend + value.amount;
            this.setState({spend: spend});
            txnSpendHistory[weekStart.valueOf()] += Math.abs(Number(value.amount));
          }
          this.tablerows += '<tr>'
                            + field($.datepicker.formatDate("yy-mm-dd", new Date(value.createTime)))
                            + field(value.amount.toFixed(2))
                            + field(value.debitor)
                            + field(value.primaryMarket)
                            + field(value.id)
                          + '</tr>';
        },this));

        if (!this.state.earn) {
          this.setState({earn: 0});
        }
        if (!this.state.spend) {
          this.setState({spend: 0});
        }
        
        var spendObj = [];
        for(var d in txnSpendHistory) {
            spendObj[d] = txnSpendHistory[d].toFixed(2);
        }
        this.setState({txnSpend: spendObj, txnSpendHistory: undefined});

        var earnObj = [];
        for(var d in txnEarnHistory) {
            earnObj[d] = txnEarnHistory[d].toFixed(2);
        }
        this.setState({txnEarn: earnObj, txnSpendHistory: undefined});

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
          { name: "createtime" },
          { name: "amount" },
          { name: "debitor" },
          { name: "market" },
          { name: "id" }
        ],
        columnDefs: [
          { targets: [1, 4], className: 'text-right' },
          { targets: [0], render: function (datum) {
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

    // only allow transaction view if admin
    if (this.props.isAdmin) {
      $('#tcontent').on('click', 'tr', function() {
        var tableapi = table.DataTable();
        var data = tableapi.row(this).data();
        window.location.href='/transaction/view/'+data[4];
      });
    }
  }

  componentDidMount() {
    this.loadHistory();
  }

  renderTransactionHistory() {
    var uu_data = [];
    var earn = 0;
    var spend = 0;
    for(var d in this.state.txnEarn) {
      var txnE = this.state.txnEarn[d];
      var txnS = this.state.txnSpend[d];
      if (d >= moment.utc().local().subtract(1, 'months').hours(0).minutes(0).seconds(0).milliseconds(0).valueOf()) {
        var date = moment.utc(parseInt(d)).local().format().split('T')[0];
        uu_data.push({
          date: date,
          earn: Number(txnE).toFixed(2),
          spend: Number(txnS).toFixed(2)
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
        lineColors: ['#60B044', '#D62728'],
        pointSize: 2,
        resize: true,
        hideHover: 'auto',
        redraw: true
      });
    }
  }

  render() {
    if (this.state.txnEarn != null && this.state.txnSpend != null) {
      this.renderTransactionHistory();
    }
    return (
      <div>
        <PanelContainer controls={false}>
          <Panel style={{color: '#FFFFFF', backgroundColor: '#60B044'}}>
            <PanelBody style={{padding: 5}}>
              <h4 style={{textAlign: 'center'}}>
                Total Earn<br/>
                ${this.state.earn == null
                    ? '. . .'
                    : this.state.earn.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</h4>
            </PanelBody>
          </Panel>
        </PanelContainer>
        <PanelContainer controls={false}>
          <Panel style={{color: '#FFFFFF', backgroundColor: '#D62728'}}>
            <PanelBody style={{padding: 5}}>
              <h4 style={{textAlign: 'center'}}>
                Total Spend<br/>
                ${this.state.spend == null
                    ? '. . .'
                    : Math.abs(this.state.spend).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</h4>
            </PanelBody>
          </Panel>
        </PanelContainer>
        <div id="transactionHistory"></div>
        <h3 style={{textAlign: 'center', width: '100%'}}>Transaction List</h3>
        <Table ref={(c) => this.txnTable = c} className='display' cellSpacing='0' width='100%'>
          <thead>
            <tr>
              <td>Date</td>
              <td>Amount</td>
              <td>User</td>
              <td>Market</td>
              <td>Id</td>
            </tr>
          </thead>
          <tbody id='tcontent'>
          </tbody>
        </Table>
        <br/>
      </div>
    );
  }
}

class VendorTableComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    var curr = null;
    var allowedMarketItems = [];
    for(var k in this.props.obj.allowedMarkets) {
      if (this.props.obj.allowedMarkets[k].name != "null") {
        allowedMarketItems.push(this.props.obj.allowedMarkets[k].name+"\n");
      }
    }
/*
    var allowedCurrencyItems = [];
    for(var k in this.props.obj.allowedCurrencies) {
      if (this.props.obj.allowedCurrencies[k].name != "null") {
        allowedCurrencyItems.push(this.props.obj.allowedCurrencies[k].name+"\n");
        curr = this.props.obj.allowedCurrencies[k];
      }
    }
*/
    var roleItems = [];
    for(var k in this.props.obj.roles) {
      roleItems.push(this.props.obj.roles[k].name+"\n");
    }

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
         <tr><td><b>Email</b></td><td>{this.props.obj.email}</td></tr>
         <tr><td><b>Current Market</b></td><td>{this.props.obj.primaryMarket ? this.props.obj.primaryMarket.name : ''}</td></tr>
         <tr><td><b>Allowed Markets</b></td><td>{allowedMarketItems}</td></tr>
         <tr><td><b>Roles</b></td><td>{roleItems}</td></tr>
         <tr><td><b>Permission to Load/Earn?</b></td><td>{this.props.obj.creditDUFB
                                                            ? 'Yes'
                                                            : 'No'}</td></tr>
         <tr><td><b>Permission to Redeem/Spend?</b></td><td>{this.props.obj.debitDUFB
                                                              ? 'Yes'
                                                              : 'No'}</td></tr>
         <tr><td><b>Status</b></td><td>{this.props.obj.status}</td></tr>
        </tbody>
       </Table>
    );
  }
}

class VendorEditTableComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {attempting: false};

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
/*
  inherit currency from market for now
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
*/
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
        this.setState({myRoles: value});
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

  getRoles() {
    var roles = [];
    $('.roles').find('input:checked').each(function() {
      roles.push($(this).val());
    });
    this.roles = roles;
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
 
  editSubmit(e) {
    this.setState({attempting: true});
    e.preventDefault();
    e.stopPropagation();
    this.getCurrencies();
    this.getMarkets();
    this.getRoles();
    this.getCreditDebitDUFB();

    var updateObj = new Object();

    if ($(ReactDOM.findDOMNode(this.firstName))[0].value != this.props.obj.firstName) {
      updateObj.firstName = $(ReactDOM.findDOMNode(this.firstName))[0].value;
      this.props.obj.firstName = updateObj.firstName;
    }
    if ($(ReactDOM.findDOMNode(this.lastName))[0].value != this.props.obj.lastName) {
      updateObj.lastName = $(ReactDOM.findDOMNode(this.lastName))[0].value;
      this.props.obj.lastName = updateObj.lastName;
    }
    if ($(ReactDOM.findDOMNode(this.email))[0].value != this.props.obj.email) {
      updateObj.email = $(ReactDOM.findDOMNode(this.email))[0].value;
      this.props.obj.email = updateObj.email;
    }
    if ($(ReactDOM.findDOMNode(this.primaryMarket))[0].value != this.props.obj.primaryMarket.id) {
      updateObj.primaryMarket = $(ReactDOM.findDOMNode(this.primaryMarket))[0].value;
      this.props.obj.primaryMarket = updateObj.primaryMarket;
    }
    if (this.allowedMarkets != this.props.obj.allowedMarkets) {
      updateObj.allowedMarkets = this.allowedMarkets;
      this.props.obj.allowedMarkets = updateObj.allowedMarkets;
    }
/*
    if ($(ReactDOM.findDOMNode(this.primaryCurrency))[0].value != this.props.obj.primaryCurrency.id) {
      updateObj.primaryCurrency = $(ReactDOM.findDOMNode(this.primaryCurrency))[0].value;
      this.props.obj.primaryCurrency = updateObj.primaryCurrency;
    }
    if (this.allowedCurrencies != this.props.obj.allowedCurrencies) {
      updateObj.allowedCurrencies = this.allowedCurrencies;
      this.props.obj.allowedCurrencies = updateObj.allowedCurrencies;
    }
*/
    if (this.roles != this.props.obj.roles) {
      updateObj.roles = this.roles;
      this.props.obj.roles = updateObj.roles;
    }
    if (this.creditDUFB != this.props.obj.creditDUFB) {
      updateObj.creditDUFB = this.creditDUFB;
      this.props.obj.creditDUFB = updateObj.creditDUFB;
    }
    if (this.debitDUFB != this.props.obj.debitDUFB) {
      updateObj.debitDUFB = this.debitDUFB;
      this.props.obj.debitDUFB = updateObj.debitDUFB;
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
    var primaryMarketItem = [];
    var marketItems = [];
    var allowedMarketItems = [];
    for(var k in this.state.allMarkets) {
      if (this.state.allMarkets[k].name != "null"
      && this.state.myAllowedMarkets != null
      && this.props.obj.allowedMarkets != null) {

        var allowed = false;
        // logged-in user must have access to markets
        for (var m in this.state.myAllowedMarkets) {
          if (this.state.myAllowedMarkets[m].id == this.state.allMarkets[k].id) {
            allowed = true;
          }
        }

        var selected = false;
        for (var m in this.props.obj.allowedMarkets) {
          if (this.props.obj.allowedMarkets[m].id == this.state.allMarkets[k].id) {
            selected = true;
          }
        }

//TODO: do this better
        if (allowed && selected) {
          allowedMarketItems.push(<Checkbox
                                      name='checkbox-options' 
                                      className='markets'
                                      key={this.state.allMarkets[k].id}
                                      defaultValue={this.state.allMarkets[k].id}
                                      defaultChecked>
                                    {this.state.allMarkets[k].name}
                                  </Checkbox>);
          // we will list current market first
          if (this.state.allMarkets[k].id == this.props.obj.primaryMarket.id) {
            primaryMarketItem.push(<option
                                      key={this.state.allMarkets[k].id}
                                      value={this.state.allMarkets[k].id} >
                                    {this.state.allMarkets[k].name}
                                  </option>);
          } else {
            marketItems.push(<option
                                key={this.state.allMarkets[k].id}
                                value={this.state.allMarkets[k].id} >
                              {this.state.allMarkets[k].name}
                            </option>);
          }
        } else if (allowed && !selected) {
          allowedMarketItems.push(<Checkbox
                                      name='checkbox-options'
                                      className='markets'
                                      key={this.state.allMarkets[k].id}
                                      defaultValue={this.state.allMarkets[k].id} >
                                    {this.state.allMarkets[k].name}
                                  </Checkbox>);
        } else if (!allowed && selected) {
          allowedMarketItems.push(<Checkbox
                                      name='checkbox-options'
                                      className='markets'
                                      key={this.state.allMarkets[k].id}
                                      defaultValue={this.state.allMarkets[k].id}
                                      defaultChecked
                                      disabled>
                                    {this.state.allMarkets[k].name}
                                  </Checkbox>);
        } else {
          // don't render if neither vendor nor editor are allowed at market
        }
      }
    }

/*
    var primaryCurrencyItem = [];
    var currencyItems = [];
    var allowedCurrencyItems = [];
    for(var k in this.state.allCurrencies) {
      if (this.state.allCurrencies[k].name != "null"
          && this.state.myAllowedCurrencies != null
          && this.props.obj.allowedCurrencies != null) {

        var allowed = false;
        // logged-in user must have access to currencies
        for (var m in this.state.myAllowedCurrencies) {
          if (this.state.myAllowedCurrencies[m].id == this.state.allCurrencies[k].id) {
            allowed = true;
          }
        }

        var selected = false;
        for (var m in this.props.obj.allowedCurrencies) {
          if (this.props.obj.allowedCurrencies[m].id == this.state.allCurrencies[k].id) {
            selected = true;
          }
        }

//TODO: do this better
        if (allowed && selected) {
          allowedCurrencyItems.push(<Checkbox
                                      name='checkbox-options' 
                                      className='currencies'
                                      key={this.state.allCurrencies[k].id}
                                      defaultValue={this.state.allCurrencies[k].id}
                                      defaultChecked>
                                    {this.state.allCurrencies[k].name}
                                  </Checkbox>);
          // we will list current currency first
          if (this.state.allCurrencies[k].id == this.props.obj.primaryCurrency.id) {
            primaryCurrencyItem.push(<option
                                      key={this.state.allCurrencies[k].id}
                                      value={this.state.allCurrencies[k].id} >
                                    {this.state.allCurrencies[k].name}
                                  </option>);
          } else {
            currencyItems.push(<option
                                key={this.state.allCurrencies[k].id}
                                value={this.state.allCurrencies[k].id} >
                              {this.state.allCurrencies[k].name}
                            </option>);
          }
        } else if (allowed && !selected) {
          allowedCurrencyItems.push(<Checkbox
                                      name='checkbox-options'
                                      className='currencies'
                                      key={this.state.allCurrencies[k].id}
                                      defaultValue={this.state.allCurrencies[k].id} >
                                    {this.state.allCurrencies[k].name}
                                  </Checkbox>);
        } else if (!allowed && selected) {
          allowedCurrencyItems.push(<Checkbox
                                      name='checkbox-options'
                                      className='currencies'
                                      key={this.state.allCurrencies[k].id}
                                      defaultValue={this.state.allCurrencies[k].id}
                                      defaultChecked
                                      disabled>
                                    {this.state.allCurrencies[k].name}
                                  </Checkbox>);
        } else {
          // don't render if neither vendor nor editor are allowed at currency
        }
      }
    }
*/
    var roleItems = [];
    for (var k in this.state.roles) {
        var allowed = false;
        // logged-in user must have access to markets
        for (var m in this.state.myRoles) {
          if (this.state.myRoles[m].id == this.state.roles[k].id) {
            allowed = true;
          }
        }
        var selected = false;
        for (var r in this.props.obj.roles) {
          if (this.props.obj.roles[r].id == this.state.roles[k].id) {
            selected = true;
          }
        }

//TODO: do this better
        if (allowed && selected) {
          roleItems.push(
              <div data-tip={this.state.roles[k].description}>
                <Checkbox
                    name='checkbox-options'
                    className='roles'
                    key={this.state.roles[k].id}
                    defaultValue={this.state.roles[k].id}
                    defaultChecked>
                  {this.state.roles[k].name}
                </Checkbox>
              </div>);
        } else if (allowed && !selected) {
          roleItems.push(
              <div data-tip={this.state.roles[k].description}>
                <Checkbox
                    name='checkbox-options'
                    className='roles'
                    key={this.state.roles[k].id}
                    defaultValue={this.state.roles[k].id} >
                  {this.state.roles[k].name}
                </Checkbox>
              </div>);
        } else if (!allowed && selected) {
          roleItems.push(
              <div data-tip={this.state.roles[k].description}>
                <Checkbox
                    name='checkbox-options'
                    className='roles'
                    key={this.state.roles[k].id}
                    defaultValue={this.state.roles[k].id}
                    defaultChecked
                    disabled>
                  {this.state.roles[k].name}
                </Checkbox>
              </div>);
        } else {
          // don't render if neither vendor nor editor have role
        }
    }

    var creditDebitDUFB = [];
    if (this.props.obj.creditDUFB) {
      creditDebitDUFB.push(<Checkbox
                              name='checkbox-options'
                              className='creditDUFB'
                              key='creditDUFB'
                              defaultValue='true'
                              defaultChecked >
                            Earn
                          </Checkbox>);
    } else {
      creditDebitDUFB.push(<Checkbox
                              name='checkbox-options'
                              className='creditDUFB'
                              key='creditDUFB'
                              defaultValue='true' >
                            Earn
                          </Checkbox>);
    }
    if (this.props.obj.debitDUFB) {
      creditDebitDUFB.push(<Checkbox
                              name='checkbox-options'
                              className='debitDUFB'
                              key='debitDUFB'
                              defaultValue='true'
                              defaultChecked >
                            Spend
                          </Checkbox>);
    } else {
      creditDebitDUFB.push(<Checkbox
                              name='checkbox-options'
                              className='debitDUFB'
                              key='debitDUFB'
                              defaultValue='true' >
                            Spend
                          </Checkbox>);
    }

/*
 * we inherit currencies from market for now
        <FormGroup controlId="primaryCurrency">
          <ControlLabel>Currency</ControlLabel>
          <FormControl componentClass="select" ref={(c) => this.primaryCurrency = c} placeholder="<select>">
            {primaryCurrencyItem}
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
            <FormControl type='text' ref={(c) => this.firstName = c}
                defaultValue={this.props.obj.firstName != null
                                ? this.props.obj.firstName
                                : ''}
                placeholder='Jon' />
            <FormControl type='text' ref={(c) => this.lastName = c}
                defaultValue={this.props.obj.lastName != null
                                ? this.props.obj.lastName
                                : ''}
                placeholder='Doe' />
          </InputGroup>
        </FormGroup>
        <FormGroup controlId='email'>
          <ControlLabel>Email</ControlLabel>
          <InputGroup>
            <FormControl type='email' size='36' ref={(c) => this.email = c}
                  defaultValue={this.props.obj.email != null
                                ? this.props.obj.email
                                : ''}
                  placeholder='user@example.com' />
          </InputGroup>
        </FormGroup>
        <FormGroup controlId="primaryMarket">
          <ControlLabel>Market</ControlLabel>
          <FormControl componentClass="select" ref={(c) => this.primaryMarket = c} placeholder="<select>">
            {primaryMarketItem}
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
            {creditDebitDUFB}
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

class MapContainer extends React.Component {
  render() {
    return (
      <PanelContainer controls={false}>
        <Panel>
          <PanelBody style={{padding: 25}}>
            <h4 className='text-center' style={{marginTop: 0}}>{this.props.name}</h4>
            {this.props.children}
            <div id={this.props.id} style={{height: 200}}></div>
          </PanelBody>
        </Panel>
      </PanelContainer>
    );
  }
}

