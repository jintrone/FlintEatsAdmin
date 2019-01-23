import React from 'react';
import ReactDOM from 'react-dom';

import {
  PanelContainer,
  Panel,
  PanelBody,
  Grid,
  Table,
  Row,
  Col,
  Form,
  FormControl,
  Button
} from '@sketchpixy/rubix';

export default class Help extends React.Component {
  constructor() {
    super();
  }

  newTab() {
    window.open('/res/help.pdf','_blank')
  }

  render() {
    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    return (
      <Row>
        <Col xs={12}>
          <PanelContainer controls={false}>
            <Panel>
              <PanelBody>
                <Grid>
                  <Row>
                    <Col xs={12}>
                      <div>
                        <object data="/res/help.pdf" type="application/pdf" width="100%" height={h - 300}>
                        <p>This browser does not support PDFs. Please download the PDF to view it: <a href="/res/help.pdf">Download PDF</a>.</p>
                        </object>
                        <div className='text-center' style={{padding:12.5}}>
                          <Button lg type='submit' onClick={::this.newTab}>Open in New Tab</Button>
                        </div>
                      </div>
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
