import React from 'react';
import ReactDOM from 'react-dom';

import MSU from '../../msu';

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

export default class ListPolicies extends React.Component {
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
    var table = $(ReactDOM.findDOMNode(this.table));
    table
      .addClass('nowrap')
      .dataTable({
        responsive: true,
        serverSide: true,
        ajax: {
          url: MSU.URL + '/policies/datatables',
          xhrFields: {
              withCredentials: true
          }
        },
        dom: 'lfrtip',
        columns: [
          { name: "displayName" },
          { name: "name" },
        ]

    });
    $('#tcontent').on('click', 'tr', function() {
      var tableapi = table.DataTable();
      var data = tableapi.row(this).data();
      window.location.href='/policies/view/'+data[0];
    });
  }

  render() {
    return (
      <Table ref={(c) => this.table = c} className='display' cellSpacing='0' width='100%'>
        <thead>
          <tr>
            <td>Identifier</td>
            <td>Name</td>
          </tr>
        </thead>
        <tbody id='tcontent' style={{cursor: 'pointer'}}>
        </tbody>
      </Table>
    );
  }
}
