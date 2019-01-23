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
  FormControl
} from '@sketchpixy/rubix';

export default class ViewTerminal extends React.Component {
  constructor() {
    super();
    this.state = {obj: null};
  }

  componentDidMount() {
    this.loadObj();
  }

  status() {
    vex.dialog.confirm({
      message: 'Are you sure you want to '+ (this.state.obj.status == 'ACTIVE' ? 'delete' : 're-activate') +' this terminal?',
      callback: (value) => {
        if (!value) {
          // cancel
        } else {
          var method = (this.state.obj.status == 'ACTIVE')
            ? 'mca.deactivate'
            : 'mca.reactivate';
          MCA.methodCall(method, ['<ex:i8>'+this.state.obj.id+'</ex:i8>'], function (error, value) {
            if (error) {
              console.log('error:', error);
              console.log('req headers:', error.req && error.req._header);
              console.log('res code:', error.res && error.res.statusCode);
              console.log('res body:', error.body);
            } else {
              if (Number(value) > 0) {
                vex.dialog.alert((this.state.obj.status == 'ACTIVE' ? 'De-Activation' : 'Re-Activation')+' Completed.');
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
      window.location.href='/terminal/view/' + that.props.params.id + '/' + data[0];
    });
  }

  backToPresent() {
    window.location.href='/terminal/view/' + this.props.params.id;
  }

  render() {
    if (!this.state.obj) {
      return <div>Loading...</div>;
    }
    if (this.props.params.ver) {
      return (
        <div id="terminal">
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
                              Terminal: ID# {this.state.obj.id} ({this.state.obj.name})
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
                          <h3>Terminal: ID# {this.state.obj.id} </h3>
                          <TerminalTableComponent  obj={this.state.obj}/>
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
      <div id="terminal">
        <Row>
          <Col sm={8}>
            <PanelContainer controls={false}>
              <Panel>
                <PanelHeader className='bg-black'>
                  <Grid>
                    <Row>
                      <Col className='fg-white'>
                        <div className='text-center fg-white'>
                          <h3 style={{margin: 0, padding: 25}}>
                            Terminal: ID# {this.state.obj.id} ({this.state.obj.name})
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
                        <TerminalTableComponent  obj={this.state.obj}/>
                        <p>
                          <Button lg style={{marginBottom: 5}}
                              bsStyle={this.state.obj.status == 'ACTIVE'
                                        ? 'danger'
                                        : 'success'}
                              onClick={::this.status} >
                                {this.state.obj.status == 'ACTIVE'
                                  ? 'De-Activate'
                                  : 'Activate'} Terminal
                          </Button>
                        </p>
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
                <PanelBody>
                  <Grid>
                    <Row>
                      <Col xs={12}>
                        <h3>Transactions at This Terminal</h3>
                        <TerminalTransactionHistoryComponent {...this.props} />
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

class TerminalTransactionHistoryComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
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
          { targets: [1, 4], className: 'text-right' }
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
    return (
      <div>
        <div>
          <Table ref={(c) => this.txnTable = c} className='display' cellSpacing='0' width='100%'>
            <thead>
              <tr>
                <td>Date</td>
                <td>Amount ($)</td>
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

class TerminalTableComponent extends React.Component {
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
          <tr><td><b>Terminal Serial</b></td><td>{this.props.obj.terminalSerial}</td></tr>
          <tr><td><b>Last Outlet</b></td>
            <td><a href={this.props.obj.lastMarket ? '/market/view/'+this.props.obj.lastMarket.id : ''}>
              {this.props.obj.lastMarket ? this.props.obj.lastMarket.name : ''}</a>
            </td>
          </tr>
          <tr><td><b>Last IP Address</b></td><td>{this.props.obj.lastIp}</td></tr>
          <tr><td><b>Status</b></td><td>{this.props.obj.status}</td></tr>
        </tbody>
      </Table>
    );
  }
}
