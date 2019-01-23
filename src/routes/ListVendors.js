import React from 'react';
import ReactDOM from 'react-dom';
import MCA from '../mca';
import { URL as MCA_URL } from '../mca';

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

export default class ListVendors extends React.Component {
  constructor() {
    super();
    this.state = {objarr: null};
  }

  componentDidMount() {
    this.loadObj();
  }


  loadObj() {
    MCA.methodCall('mca.listConcise', ['vendor'], function (error, value) {
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
    if (!this.state.count && !this.state.objarr) {
      return <div>Loading...</div>;
    } else if (!this.state.objarr) {
      return <div>Found {this.state.count} entities. One moment while we display them...</div>;
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
    var table = $(ReactDOM.findDOMNode(this.example));
    table
      .addClass('nowrap')
      .dataTable({
        responsive: true,
        processing: true,
        serverSide: true,
        ajax: {
          url: MCA_URL + 'datatables/vendor',
          xhrFields: {
              withCredentials: true
          }
        },
        dom: 'lfrtip',
        columns: [
          { name: "id" },
          { name: "firstName" },
          { name: "lastName" },
          { name: "email" },
          { name: "primaryMarket" },
          { name: "status" }
        ],
        columnDefs: [
          { targets: [0], className: 'text-right' }
        ]

    });
    $('#tcontent').on('click', 'tr', function() {
      var tableapi = table.DataTable();
      var data = tableapi.row(this).data();
      window.location.href='/vendor/view/'+data[0];
    });
  }

  render() {
    return (
      <Table ref={(c) => this.example = c} className='display' cellSpacing='0' width='100%'>
        <thead>
          <tr>
            <td>ID</td>
            <td>First Name</td>
            <td>Last Name</td>
            <td>Email</td>
            <td>PrimaryMarket</td>
            <td>Status</td>
          </tr>
        </thead>
        <tbody id='tcontent' style={{cursor: 'pointer'}}>
        </tbody>
      </Table>
    );
  }
}
