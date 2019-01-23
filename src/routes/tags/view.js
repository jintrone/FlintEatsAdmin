import React from 'react';
import ReactDOM from 'react-dom';
import { Link, withRouter } from 'react-router';
import ReactTooltip from 'react-tooltip';

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

@withRouter
export default class ViewTag extends React.Component {
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

  password() {
    vex.dialog.open({
      message: 'Enter New Password:',
      input: '' +
          '<input name="password" type="password" placeholder="Password" required />' +
          '<input name="passwordconfirm" type="password" placeholder="Confirm Password" required />' +
      '',
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
            MCA.methodCall('mca.passwordChange', [this.state.obj.email, data.password], function (error, value) {
              if (error) {
                console.log('error:', error);
                console.log('req headers:', error.req && error.req._header);
                console.log('res code:', error.res && error.res.statusCode);
                console.log('res body:', error.body);
              } else {
                if (Number(value) > 0) {
                  vex.dialog.alert('Password Change Completed.');
                } else {
                  vex.dialog.alert('Password Change Failed:<br/>' + value);
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

/*
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
      window.location.href='/tag/view/' + that.props.params.id + '/' + data[0];
    });
*/
  }

  backToPresent() {
    window.location.href='/tags/view/' + this.props.params.id;
  }

  status() {
    let active = false;
    if (this.state.obj.status == 'ACTIVE') {
      active = true;
    }
    let obj = this.state.obj;
    vex.dialog.confirm({
      message: 'Are you sure you want to '
                + (active
                    ? 'deactivate'
                    : 'reactivate')
                + ' this tag?',
      callback: (value) => {
        if (!value) {
          // cancel
        } else {
          if (active) {
            obj.status = 'INACTIVE';
          } else {
            obj.status = 'ACTIVE';
          }
          MSU.put('/tags/' + obj.id, obj)
            .then(res => {
              if (Number(res) > 0) {
                vex.dialog.alert((obj.status == 'INACTIVE'
                                    ? 'De-Activation'
                                    : 'Re-Activation')
                                  + ' Completed.');
                this.loadObj();
              } else {
                vex.dialog.alert('Status Change Failed.');
              }
            });
        }
      }
    });
  }

  loadObj() {
    if (this.props.params.ver) {
      MSU.get('/tags/' + this.props.params.id + '/' + this.props.params.ver)
        .then(res => {
          this.setState({obj: JSON.parse(res)});
        })
    } else {
      MSU.get('/tags/' + this.props.params.id)
        .then(res => {
          this.setState({obj: JSON.parse(res)});
        })
    }
  }

  render() {
    if (!this.state.obj) {
      return <div>Loading...</div>;
    }
    if (this.props.params.ver) {
      return (
        <div id="tag">
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
                              Tag: ID# {this.state.obj.id} ({this.state.obj.name})
                            </h3>
                            <h4>
                              VERSION {this.props.params.ver} — {moment.utc(this.state.obj.lastModified).local().format('YYYY-MM-DD kk:mm:ss.SSS')}
                            </h4>
                          </div>
                        </Col>
                      </Row>
                    </Grid>
                  </PanelHeader>
                  <PanelBody style={{padding: 0}}>
                    <Grid>
                      <Row>
                        <Col xs={12}>
                          <TagTableComponent  obj={this.state.obj}/>
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
    return (
      <div id="tag">
        <Row>
          <Col sm={5}>
            <PanelContainer controls={false}>
              <Panel>
                <PanelHeader className='bg-darkblue'>
                 <Grid>
                    <Row>
                      <Col className='fg-white'>
                        <div className='text-center fg-white'>
                          <h3 style={{margin: 0, padding: 25}}>Tag: ID# {this.state.obj.id} ({this.state.obj.name})</h3>
                        </div>
                      </Col>
                    </Row>
                  </Grid>
                </PanelHeader>
                <PanelBody style={{padding: 0}}>
                  <Grid>
                    <Row>
                      <Col xs={12}>
                        {this.state.edit
                          ? <TagEditTableComponent obj={this.state.obj} toggleEdit={this.toggleEdit.bind(this)}/>
                          : <TagTableComponent  obj={this.state.obj}/>}
                        {!this.state.edit
                          ? <Button lg style={{marginBottom: 5, marginRight: 5, padding: 15}}
                            bsStyle={this.state.obj.status == 'ACTIVE'
                                      ? 'danger'
                                      : 'success'}
                            onClick={::this.status} >
                              {this.state.obj.status == 'ACTIVE'
                                ? 'Deactivate'
                                : 'Activate'} Tag</Button>
                          : ''}
                        {!this.state.edit
                          ? <Button lg style={{marginBottom: 5, marginRight: 5, padding: 15}}
                            bsStyle='info' onClick={::this.toggleEdit}>Edit</Button>
                          : ''}
                        {!this.state.edit
                          ? <Button lg style={{marginBottom: 5, marginRight: 5, padding: 15}}
                            bsStyle='default' onClick={::this.showObjHistory}>Previous Versions</Button>
                          : ''}
                        <br/>
                      </Col>
                    </Row>
                  </Grid>
                </PanelBody>
              </Panel>
            </PanelContainer>
          </Col>
          <Col sm={7}>
            <PanelContainer controls={false}>
              <Panel>
                <PanelBody>
                  <Grid>
                    <Row>
                      <Col xs={12}>
                        <h3 style={{textAlign: 'center', width: '100%'}}>Account Overview</h3>
                        <TagOverviewComponent />
                        <br/>
                      </Col>
                    </Row>
                  </Grid>
                </PanelBody>
              </Panel>
            </PanelContainer>
            <PanelContainer controls={false}>
              <Panel>
                <Grid>
                  <Row>
                    <Col xs={12}>
                      <h3 style={{textAlign: 'center', width: '100%'}}>Content</h3>
                      <UGCComponent {...this.props} />
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

class UGCComponent extends React.Component {
  constructor() {
    super();
    this.state = {obj: null, earn: null, spend: null, weekearn: 0, weekspend: 0};
  }

  loadHistory() {
/*
    MCA.methodCall('mca.find', ['transaction','tag',''+this.props.params.id], function (error, value) {
      if (error) {
        console.log('error:', error);
        console.log('req headers:', error.req && error.req._header);
        console.log('res code:', error.res && error.res.statusCode);
        console.log('res body:', error.body);
      } else {
        $.each(JSON.parse(value), $.proxy(function(i, value) {
          var field = function(value) {
            return '<td>'+value+'</td>';
          }
          if (value.primaryMarket != null) {
            value.primaryMarket = value.primaryMarket.name;
          } else {
            value.primaryMarket = 'Not Specified';
          }
          if (value.creditor.name == null || value.creditor.name == '' || value.creditor.name == 'null null') {
            value.creditor = value.creditor.id;
          } else {
            value.creditor = value.creditor.name;
          }

          if (value.amount >= 0) {
            var earn = this.state.earn + value.amount;
            this.setState({earn: earn});
          } else {
            var spend = this.state.spend + value.amount;
            this.setState({spend: spend});
          }
        },this));

        if (!this.state.earn) {
          this.setState({earn: 0});
        }
        if (!this.state.spend) {
          this.setState({spend: 0});
        }
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
          { name: "creditor" },
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

    $('#tcontent').on('click', 'tr', function() {
      var tableapi = table.DataTable();
      var data = tableapi.row(this).data();
      window.location.href='/transaction/view/'+data[4];
    });
*/
  }

  componentDidMount() {
    this.loadHistory();
  }

  render() {
    return(
      <div>
        <br/>
        <Table ref={(c) => this.txnTable = c} className='display' cellSpacing='0' width='100%'>
          <thead>
            <tr>
              <td>ID</td>
              <td>Create Date</td>
              <td>Type</td>
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


class TagOverviewComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let tool = (<ReactTooltip effect='solid' disable={true} />);
    if (this.props.remain < 0) {
      tool = (<ReactTooltip effect='solid' place='bottom' />);
    }
    return(
      <div>
        <PanelContainer controls={false}>
        </PanelContainer>
        {tool}
      </div>
    );
  }
}

class TagTableComponent extends React.Component {
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
          <tr><td><b>Tag</b></td><td>{this.props.obj.name}</td></tr>
          <tr><td><b>Status</b></td><td>{this.props.obj.status}</td></tr>
        </tbody>
       </Table>
    );
  }
}

class TagEditTableComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {attempting: false};
  }

  editSubmit(e) {
    this.setState({attempting: true});
    e.preventDefault();
    e.stopPropagation();

    var updateObj = this.props.obj;

    updateObj.name = $(ReactDOM.findDOMNode(this.name))[0].value;

    MSU.post('/tags/' + this.props.obj.id, updateObj)
      .then(res => {
        if (!isNaN(res) && Number(res) > 0) {
          this.props.toggleEdit();
        }
        this.setState({attempting: false});
      });
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
          <ControlLabel>Tag</ControlLabel>
          <InputGroup>
            <FormControl type='text' ref={(c) => this.name = c}
                defaultValue={this.props.obj.name != null
                    ? this.props.obj.name
                    : ''}
            />
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
