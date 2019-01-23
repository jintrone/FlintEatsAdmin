import React from 'react';
import ReactDOM from 'react-dom';

import MSU from '../../../msu';

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

export default class ListReviews extends React.Component {
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
          url: MSU.URL + '/ugc/reviews/datatables',
          xhrFields: {
              withCredentials: true
          }
        },
        dom: 'lfrtip',
        columns: [
          { name: "id" },
          { name: "created" },
          { name: "target" },
          { name: "status" }
        ],
        columnDefs: [
          { targets: [0], className: 'text-right' },
          { targets: [1], render: function (datum) {
                                    return moment.utc(datum).local().format('YYYY-MM-DD HH:mm:ss');
                                  } }
        ]

    });
    $('#tcontent').on('click', 'tr', function() {
      var tableapi = table.DataTable();
      var data = tableapi.row(this).data();
      window.location.href='/ugc/reviews/view/'+data[0];
    });
  }

  render() {
    return (
      <Table ref={(c) => this.table = c} className='display' cellSpacing='0' width='100%'>
        <thead>
          <tr>
            <td>ID</td>
            <td>Create Date</td>
            <td>Target</td>
            <td>Status</td>
          </tr>
        </thead>
        <tbody id='tcontent' style={{cursor: 'pointer'}}>
        </tbody>
      </Table>
    );
  }
}
