import React from 'react';
import cookie from 'react-cookie';
import ReactDOM from 'react-dom';
import MSU from '../msu';

import {
  Row,
  Col,
  Panel,
  PanelBody,
  PanelContainer,
  Icon,
} from '@sketchpixy/rubix';

export default class Dashboard extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.loadObj();
  }

  loadObj() {
    var now = moment.utc().local();
  }

  render() {
    return (
      <div>
        <Row>
          <Col sm={12}>
            <PanelContainer controls={false}>
              <Panel>
                 <PanelBody style={{padding: 25}}>
                  <h1 className='text-center fg-black50'>Flint Eats Dashboard</h1>
                </PanelBody>
              </Panel>
            </PanelContainer>
          </Col>
        </Row>
      </div>
    );
  }
}
