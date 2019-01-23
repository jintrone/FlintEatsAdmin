import React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import { Link, withRouter } from 'react-router';
import MSU from '../msu';

import l20n, { Entity } from '@sketchpixy/rubix/lib/L20n';

import {
  Label,
  SidebarBtn,
  Dispatcher,
  NavDropdown,
  NavDropdownHover,
  Navbar,
  Nav,
  NavItem,
  MenuItem,
  Badge,
  Button,
  Icon,
  Grid,
  Row,
  Radio,
  Col } from '@sketchpixy/rubix';

class Brand extends React.Component {
  render() {
    return (
      <Navbar.Header {...this.props}>
        <Navbar.Brand tabIndex='-1'>
          <Col visible='xs'>
            Flint Eats Admin
          </Col>
        </Navbar.Brand>
      </Navbar.Header>
    );
  }
}

@withRouter
class HeaderNavigation extends React.Component {
  logout() {
    vex.dialog.open({
      message: 'Are You Sure You Want to Log Out?',
      buttons: [
          $.extend({}, vex.dialog.buttons.YES, { text: 'Yes' }),
          $.extend({}, vex.dialog.buttons.NO, { text: 'No' })
      ],
      callback: (data) => {
        if (!data) {
          // cancel
        } else {
          MSU.post('/auth/logout')
            .then(res => {
              vex.dialog.alert({message: 'You Are Now Logged Out'});
              this.props.router.push('/');
            });
        }
      }
    }).bind(this);   
  }

  render() {
    return (
      <Nav pullRight>
        <Nav>
          <NavItem className='logout' onClick={::this.logout}>
            <Icon bundle='fontello' glyph='logout' />
          </NavItem>
        </Nav>
      </Nav>
    );
  }
}

export default class Header extends React.Component {
  render() {
    return (
      <Grid id='navbar' {...this.props}>
        <Row>
          <Col xs={12}>
            <Navbar fixedTop fluid id='rubix-nav-header'>
              <Row>
                <Col xs={3} visible='xs'>
                  <SidebarBtn />
                </Col>
                <Col xs={6} sm={4}>
                  <Brand />
                </Col>
                <Col xs={3} sm={8} collapseRight className='text-right'>
                  <HeaderNavigation />
                </Col>
              </Row>
            </Navbar>
          </Col>
        </Row>
      </Grid>
    );
  }
}
