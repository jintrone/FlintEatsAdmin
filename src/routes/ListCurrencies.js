import React from 'react';
import ReactDOM from 'react-dom';
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

export default class ListCurrencies extends React.Component {
  constructor() {
    super();
    this.state = {objarr: null};
  }

  render() {
    return (
      <Row>
        <Col xs={12}>
          <PanelContainer controls={false}>
            <Panel>
              <PanelBody>
                <Grid>
                  <Row>
                    <Col xs={12}>
                      <DatatableComponent />
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
  }

  componentDidMount() {
    var table = $(ReactDOM.findDOMNode(this.example));
    table
      .addClass('nowrap')
      .dataTable({
        responsive: true,
        serverSide: true,
        ajax: {
          url: MCA_URL + 'datatables/currency',
          xhrFields: {
              withCredentials: true
          }
        },
        dom: 'lfrtip',
        columns: [
          { name: "id" },
          { name: "code" },
          { name: "name" },
          { name: "dailyLimit" },
          { name: "status" }
        ],
        columnDefs: [
          { targets: [0, 3], className: 'text-right' }
        ]

    });
    $('#tcontent').on('click', 'tr', function() {
      var tableapi = table.DataTable();
      var data = tableapi.row(this).data();
      window.location.href='/currency/view/'+data[0];
    });
  }

  render() {
    return (
      <Table ref={(c) => this.example = c} className='display' cellSpacing='0' width='100%'>
        <thead>
          <tr>
            <td>ID</td>
            <td>Code</td>
            <td>Name</td>
            <td>Daily Limit ($)</td>
            <td>Status</td>
          </tr>
        </thead>
        <tbody id='tcontent' style={{cursor: 'pointer'}}>
        </tbody>
      </Table>
    );
  }
}
