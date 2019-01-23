import React from 'react';
import ReactDOM from 'react-dom';
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
  FormControl
} from '@sketchpixy/rubix';

export default class ListTerminals extends React.Component {
  constructor() {
    super();
    this.state = {objarr: null};
  }

  componentDidMount() {
    this.loadObj();
  }


  loadObj() {
    MCA.methodCall('mca.listConcise', ['terminal'], function (error, value) {
      if (error) {
        console.log('error:', error);
        console.log('req headers:', error.req && error.req._header);
        console.log('res code:', error.res && error.res.statusCode);
        console.log('res body:', error.body);
      } else {
        this.setState({objarr: value});
      }
    }.bind(this));
  }


  render() {
   if (!this.state.objarr) {
    return <div>Loading...</div>;
   }
    return (
      <Row>
        <Col xs={12}>
          <PanelContainer controls={false}>
            <Panel>
              <PanelBody>
                <Grid>
                  <Row>
                    <Col xs={12}>
                      <DatatableComponent objarr={this.state.objarr}/>
                      <br/>
                    </Col>
                  </Row>
                </Grid>
              </PanelBody>
            </Panel>
          </PanelContainer>
        </Col>
      </Row>
    );
  }
}

class DatatableComponent extends React.Component {
  constructor() {
    super();
    this.tablerows = '';
  }

  componentDidMount() {
    $.each(JSON.parse(this.props.objarr), $.proxy(function(i, value) {
      var field = function(value) {
        return '<td>'+value+'</td>';
      }
      this.tablerows += '<tr>'+field(value.id)+field(value.terminalSerial)+field(value.status)+'</tr>';
    },this));
    $('#tcontent').html(this.tablerows);
    var table = $(ReactDOM.findDOMNode(this.example));
    table
      .addClass('nowrap')
      .dataTable({
        responsive: true,
        dom: 'lfrtip',
        columnDefs: [
          { targets: [0], className: 'text-right' }
        ]
    });
    $('#tcontent').on('click', 'tr', function() {
      var tableapi = table.DataTable();
      var data = tableapi.row(this).data();
      window.location.href='/terminal/view/'+data[0];
    });

  }

  render() {
    return (
      <Table ref={(c) => this.example = c} className='display' cellSpacing='0' width='100%'>
        <thead>
          <tr>
            <td>ID</td>
            <td>Terminal Serial</td>
            <td>Status</td>
          </tr>
        </thead>
        <tbody id='tcontent' style={{cursor: 'pointer'}}>
        </tbody>
      </Table>
    );
  }
}
