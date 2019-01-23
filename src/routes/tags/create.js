import React from 'react';
import ReactDOM from 'react-dom';
import { Link, withRouter } from 'react-router';

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

export default class CreateTag extends React.Component {
  constructor() {
    super();
    this.state = {obj: null};
  }

  render() {
   return (
     <div id="user">
      <Row>
        <Col xs={8}>
          <PanelContainer controls={false}>
            <Panel>
              <PanelHeader className='bg-darkblue'>
               <Grid>
                  <Row>
                    <Col xs={12} className='fg-white'>
                      <div className='text-center fg-white'>
                        <h3 style={{margin: 0, padding: 25}}>New Tag</h3>
                      </div>
                    </Col>
                  </Row>
                </Grid>
              </PanelHeader>
              <PanelBody style={{padding: 0}}>
                <Grid>
                  <Row>
                    <Col xs={12}>
                      {<TagEditTableComponent/>}
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

@withRouter
class TagEditTableComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {attempting: false};
  }

  createSubmit(e) {
    this.setState({attempting: true});
    e.preventDefault();
    e.stopPropagation();

    var createObj = new Object();

    if ($(ReactDOM.findDOMNode(this.name))[0].value != '') {
      createObj.name = $(ReactDOM.findDOMNode(this.name))[0].value;
    }

    MSU.post('/tags/create', createObj)
      .then(res => {
        if (!isNaN(res) && Number(res) > 0) {
          this.props.router.push('/tags/view/'+res);
        } else {
          vex.dialog.alert('Error: ' + res);
        }
      });
  }

  render() {
    return (
      <Form onSubmit={::this.createSubmit}>
        <FormGroup controlId='name'>
          <ControlLabel>Tag</ControlLabel>
          <InputGroup>
            <FormControl type='text' ref={(c) => this.name = c} />
          </InputGroup>
        </FormGroup>
        <FormGroup>
          <Grid>
            <Row>
              <Col xs={6} collapseLeft collapseRight className='text-right'>
                <Button outlined lg type='submit' bsStyle='blue' onClick={::this.createSubmit} disabled={this.state.attempting}>Save</Button>
              </Col>
            </Row>
          </Grid>
        </FormGroup>
      </Form>
    );
  }
}


