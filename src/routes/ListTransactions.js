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

export default class ListTransactions extends React.Component {
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
        dom: 'lfrtip',
        processing: true,
        serverSide: true,
        ajax: {
          url: MCA_URL + 'datatables/transaction',
          xhrFields: {
            withCredentials: true
          }
        },
        columns: [
          { name: "id" },
          { name: "createTime" },
          { name: "vendor" },
          { name: "user" },
          { name: "amount" },
          { name: "market" },
          { name: "token" },
          { name: "status" }
        ],
        columnDefs: [
          { targets: [0, 4], className: 'text-right' },
          { targets: [1], render: function (datum) {
                                    return moment.utc(datum).local().format('YYYY-MM-DD kk:mm:ss');
                                  }
          },
          { targets: [6], render: function (datum) {
                                    switch (datum) {
                                      case true:
                                        return 'Yes';
                                      case false:
                                        return 'No';
                                      default:
                                        return '';
                                    }
                                  }
          }
        ]
    });
    $('#tcontent').on('click', 'tr', function() {
      var tableapi = table.DataTable();
      var data = tableapi.row(this).data();
      window.location.href='/transaction/view/'+data[0];
    });
  }

  render() {
    return (
      <Table ref={(c) => this.table = c} className='display' cellSpacing='0' width='100%'>
        <thead>
          <tr>
            <td>ID</td>
            <td>Time</td>
            <td>Vendor</td>
            <td>Customer</td>
            <td>Amount ($)</td>
            <td>Market</td>
            <td>Tokens?</td>
            <td>Status</td>
          </tr>
        </thead>
        <tbody id='tcontent' style={{cursor: 'pointer'}}>
        </tbody>
      </Table>
    );
  }
}
