import React from 'react';
import { Link, withRouter } from 'react-router';
import MSU from '../msu';

import {
  Sidebar,
  SidebarNav,
  SidebarNavItem,
  SidebarControls,
  SidebarControlBtn,
  LoremIpsum,
  Grid,
  Row,
  Col,
  FormControl,
  Label,
  Progress,
  Icon,
  SidebarDivider
} from '@sketchpixy/rubix';

@withRouter
class ApplicationSidebar extends React.Component {
  constructor() {
    super();
  }

  render() {
    return (
      <div>
        <Grid>
          <Row>
            <Col xs={12}>
              <div className='sidebar-nav-container'>
                <SidebarNav style={{marginBottom: 0}} ref={(c) => this._nav = c}>
                  { /** Pages Section */ }
                  <div className='sidebar-header'>PAGES</div>
                  <SidebarNavItem glyph='icon-fontello-gauge' name='Dashboard' href='/dashboard' />

                  <SidebarNavItem glyph='icon-fontello-user-8' name='Users'>
                    <SidebarNav>
                      <SidebarNavItem name='List Users' href='/users/list' />
                      <SidebarNavItem name='Create User' href='/users/create' />
                    </SidebarNav>
                  </SidebarNavItem>

                  <SidebarNavItem glyph='icon-fontello-shop-1' name='Markets'>
                    <SidebarNav>
                      <SidebarNavItem name='List Markets' href='/markets/list'/>
                      <SidebarNavItem name='Create Market' href='/markets/create'/>
                    </SidebarNav>
                  </SidebarNavItem>

                  <SidebarNavItem glyph='icon-fontello-tag-1' name='Tags'>
                    <SidebarNav>
                      <SidebarNavItem name='List Tags' href='/tags/list' />
                      <SidebarNavItem name='Create Tag' href='/tags/create' />
                    </SidebarNav>
                  </SidebarNavItem>

{false ? <div>
                  <div className='sidebar-header'>UGC</div>
                  <SidebarNavItem glyph='icon-fontello-doc-text' name='Reviews' href='/ugc/reviews/list'/>
                  <div className='sidebar-header'></div>
                  <SidebarNavItem hidden={true} glyph='icon-stroke-gap-icons-Chart' name='Reporting' href='/reports'>
                  </SidebarNavItem>
</div> : <div/>}

                  <SidebarNavItem glyph='icon-fontello-help' name='Policies' href='/policies/list'>
                  </SidebarNavItem>

                </SidebarNav>
              </div>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

@withRouter
export default class SidebarContainer extends React.Component {
  constructor() {
    super();
    this.state = {me: null};
  }

  componentDidMount() {
    MSU.get('/users/me')
      .then(res => {
        try {
          let json = JSON.parse(res);
          this.setState({me: json});
        } catch(e) {
          window.location.href = '/';
        }
      });
  }

  me() {
    window.location.href = '/users/view/' + this.state.me.id;
  }

  render() {
    return (
      <div id='sidebar'>
        <div id='avatar' onClick={::this.me} style={{cursor: 'pointer'}}>
          <Grid>
            <Row className='fg-white'>
              <Col xs={12} collapseRight>
                <div style={{top: 20, fontSize: 16, lineHeight: 1, position: 'relative'}}>
                  {this.state.me == null 
                    ? '. . .'
                    : (this.state.me.name == null
                        ? '! ! !'
                        : this.state.me.name)}
                </div>
                <div style={{top: 20, position: 'relative'}}>
                  {this.state.me == null
                    ? '. . .'
                    : (this.state.me.email == null
                        ? '! ! !'
                        : this.state.me.email)}
                </div>
              </Col>
            </Row>
          </Grid>
        </div>
        <div id='sidebar-container'>
          <Sidebar sidebar={0}>
            <ApplicationSidebar />
          </Sidebar>
        </div>
      </div>
    );
  }
}
