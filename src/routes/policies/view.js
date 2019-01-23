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
export default class ViewPolicy extends React.Component {
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
      window.location.href='/policy/view/' + that.props.params.id + '/' + data[0];
    });
*/
  }

  backToPresent() {
    window.location.href='/policy/view/' + this.props.params.id;
  }

  status() {
    vex.dialog.confirm({
      message: 'Are you sure you want to '
                + (this.state.obj.status == 'ACTIVE'
                    ? 'deactivate'
                    : 're-activate')
                + ' this policy?',
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
console.log(this.props.params);
    if (this.props.params.ver) {
      MSU.get('/policies/' + this.props.params.id + '/' + this.props.params.ver)
        .then(res => {
          this.setState({obj: JSON.parse(res)});
        });
    } else {
      MSU.get('/policies/' + this.props.params.id)
        .then(res => {
          this.setState({obj: JSON.parse(res)});
        });
    }
  }

  render() {
    if (!this.state.obj) {
      return <div>Loading...</div>;
    }
    if (this.props.params.ver) {
      return (
        <div id="policy">
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
                              Policy: ID# {this.state.obj.id} ({this.state.obj.name})
                            </h3>
                            <h4>
                              VERSION {this.props.params.ver} — {moment.utc(this.state.obj.lastModified).local().format('YYYY-MM-DD HH:mm:ss.SSS')}
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
                          <PolicyTableComponent  obj={this.state.obj}/>
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
      <div id="policy">
        <Row>
          <Col sm={5}>
            <PanelContainer controls={false}>
              <Panel>
                <PanelHeader className='bg-darkblue'>
                 <Grid>
                    <Row>
                      <Col className='fg-white'>
                        <div className='text-center fg-white'>
                          <h3 style={{margin: 0, padding: 25}}>Policy: ID# {this.state.obj.id} ({this.state.obj.name})</h3>
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
                          ? <PolicyEditTableComponent obj={this.state.obj} toggleEdit={this.toggleEdit.bind(this)}/>
                          : <PolicyTableComponent  obj={this.state.obj}/>}
                        {!this.state.edit
                          ? <Button lg style={{marginBottom: 5, marginRight: 5, padding: 15}}
                            bsStyle='info' onClick={::this.toggleEdit}>Edit</Button>
                          : ''}
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

class PolicyOverviewComponent extends React.Component {
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

class PolicyTableComponent extends React.Component {
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
          <tr><td><b>Identifier</b></td><td>{this.props.obj.name}</td></tr>
          <tr><td><b>DisplayName</b></td><td>{this.props.obj.displayName}</td></tr>
          <tr><td><b>Text</b></td><td>{this.props.obj.text}</td></tr>
        </tbody>
       </Table>
    );
  }
}

class PolicyEditTableComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {attempting: false, image: null};
  }

  editSubmit(e) {
    this.setState({attempting: true});
    e.preventDefault();
    e.stopPropagation();

    var updateObj = new Object();
    updateObj.id = this.props.obj.id;
    updateObj.name = this.props.obj.name;

    if ($(ReactDOM.findDOMNode(this.displayName))[0].value != this.props.obj.displayName
        && $(ReactDOM.findDOMNode(this.displayName))[0].value != '') {
      updateObj.displayName = $(ReactDOM.findDOMNode(this.displayName))[0].value;
      this.props.obj.displayName = updateObj.name;
    }
    if ($(ReactDOM.findDOMNode(this.text))[0].value != this.props.obj.text
        && $(ReactDOM.findDOMNode(this.text))[0].value != '') {
      updateObj.text = $(ReactDOM.findDOMNode(this.text))[0].value;
      this.props.obj.text = updateObj.text;
    }

    MSU.post('/policies/' + this.props.obj.name, updateObj)
      .then(res => {
        if (!isNaN(res) && Number(res) > 0) {
          this.props.toggleEdit();
        } else {
          vex.dialog.alert('Error: ' + res);
        }
        this.setState({attempting: false});
      });
  }

  render() {
    return (
      <Form onSubmit={::this.editSubmit}>
        <FormGroup controlId='id'>
          <ControlLabel>Identifier</ControlLabel>
          <InputGroup>
            <FormControl type='text' readOnly value={this.props.obj.name} />
          </InputGroup>
        </FormGroup>
        <FormGroup controlId='displayName'>
          <ControlLabel>Name</ControlLabel>
          <InputGroup>
            <FormControl type='text' ref={(c) => this.displayName = c}
                defaultValue={this.props.obj.displayName != null
                    ? this.props.obj.displayName
                    : ''}
                placeholder='Name' />
          </InputGroup>
        </FormGroup>
        <FormGroup controlId='text'>
          <ControlLabel>Text</ControlLabel>
          <InputGroup>
            <FormControl componentClass='textarea' ref={(c) => this.text = c}
                defaultValue={this.props.obj.text != null
                    ? this.props.obj.text
                    : ''}
                placeholder='Policy text' />
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
