import React from 'react';
import classNames from 'classnames';
import { IndexRoute, Route } from 'react-router';
import { Link, withRouter } from 'react-router';

import { Grid, Row, Col, MainContainer } from '@sketchpixy/rubix';

import Footer from './common/footer';
import Header from './common/header';
import Sidebar from './common/sidebar';

import MSU from 'msu';

import Login from './routes/login';
import Dashboard from './routes/dashboard';

import CreateUsers from './routes/users/create';
import ListUsers from './routes/users/list';
import ViewUsers from './routes/users/view';

import CreateMarkets from './routes/markets/create';
import ListMarkets from './routes/markets/list';
import ViewMarkets from './routes/markets/view';

import CreatePolicies from './routes/policies/create';
import ListPolicies from './routes/policies/list';
import ViewPolicies from './routes/policies/view';

import CreateTags from './routes/tags/create';
import ListTags from './routes/tags/list';
import ViewTags from './routes/tags/view';

import ListReviews from './routes/ugc/reviews/list';

import CreateCurrencies from './routes/CreateCurrencies';
import CreateTransactions from './routes/CreateTransactions';
import CreateVendors from './routes/CreateVendors';
import ListCurrencies from './routes/ListCurrencies';
import ListTerminals from './routes/ListTerminals';
import ListTransactions from './routes/ListTransactions';
import ListVendors from './routes/ListVendors';
import ViewCurrencies from './routes/ViewCurrencies';
import ViewTransactions from './routes/ViewTransactions';
import ViewTerminals from './routes/ViewTerminals';
import ViewVendors from './routes/ViewVendors';
import Reports from './routes/Reports';
import XmlrpcTest from './routes/XmlrpcTest';
import Password from './routes/Password';
import Help from './routes/Help';

@withRouter
class App extends React.Component {
  render() {
    return (
      <MainContainer {...this.props}>
        <Sidebar />
        <Header />
        <div id='body'>
          <Grid>
            <Row>
              <Col xs={12}>
                {this.props.children}
              </Col>
            </Row>
          </Grid>
        </div>
        <Footer />
      </MainContainer>
    );
  }
}

const routes = (
  <Route component={App}>
    <Route path='dashboard' component={Dashboard} />

    <Route path='markets/create' component={CreateMarkets} />
    <Route path='markets/list' component={ListMarkets} />
    <Route path='markets/view/:id' component={ViewMarkets} />
    <Route path='markets/view/:id/:ver' component={ViewMarkets} />

    <Route path='users/create' component={CreateUsers} />
    <Route path='users/list' component={ListUsers} />
    <Route path='users/view/:id' component={ViewUsers} />
    <Route path='users/view/:id/:ver' component={ViewUsers} />

    <Route path='policies/create' component={CreatePolicies} />
    <Route path='policies/list' component={ListPolicies} />
    <Route path='policies/view/:id' component={ViewPolicies} />
    <Route path='policies/view/:id/:ver' component={ViewPolicies} />

    <Route path='tags/create' component={CreateTags} />
    <Route path='tags/list' component={ListTags} />
    <Route path='tags/view/:id' component={ViewTags} />
    <Route path='tags/view/:id/:ver' component={ViewTags} />

    <Route path='ugc/reviews/list' component={ListReviews} />

    <Route path='currency/create' component={CreateCurrencies} />
    <Route path='transaction/create' component={CreateTransactions} />
    <Route path='vendor/create' component={CreateVendors} />
    <Route path='currency/list' component={ListCurrencies} />
    <Route path='vendor/list' component={ListVendors} />
    <Route path='terminal/list' component={ListTerminals} />
    <Route path='transaction/list' component={ListTransactions} />
    <Route path='currency/view/:id' component={ViewCurrencies} />
    <Route path='currency/view/:id/:ver' component={ViewCurrencies} />
    <Route path='vendor/view/:id' component={ViewVendors} />
    <Route path='vendor/view/:id/:ver' component={ViewVendors} />
    <Route path='terminal/view/:id' component={ViewTerminals} />
    <Route path='terminal/view/:id/:ver' component={ViewTerminals} />
    <Route path='transaction/view/:id' component={ViewTransactions} />
    <Route path='transaction/view/:id/:ver' component={ViewTransactions} />
    <Route path='reports' component={Reports} />
    <Route path='xmlrpc/test' component={XmlrpcTest} />
    <Route path='help' component={Help} />
  </Route>
);

/**
 * No Sidebar, Header or Footer. Only the Body is rendered.
 */
const basicRoutes = (
  <Route>
    <Route path='/lock' component={Login} />
    <Route path='/password/:token' component={Password} />
  </Route>
);

const combinedRoutes = (
  <Route>
    <Route>
      {routes}
    </Route>
    <Route>
      {basicRoutes}
    </Route>
  </Route>
);

export default (
  <Route>
    <Route path='/' component={Login} />
    {combinedRoutes}
  </Route>
);
