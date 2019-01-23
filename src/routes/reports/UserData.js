import React from 'react';
import ReactDOM from 'react-dom';
import ReactTooltip from 'react-tooltip';
import MCA from '../../mca';

import {
  PanelContainer,
  Panel,
  PanelBody,
  Grid,
  Table,
  Row,
  Col,
  Form,
  Button,
  DropdownButton,
  MenuItem,
  Icon,
  Checkbox,
  FormControl
} from '@sketchpixy/rubix';

export default class UserData extends React.Component {

  constructor() {
    super();
    this.state = {users: null, 
            usersByDate: null,
          usersByMarket: null,
         renderedReport: null,
             reportName: null,
                 report: null,
           newUsersLine: null,
         uniqueUsersBar: null,
                markets: [],
             allMarkets: false}
  }


  componentDidMount() {
    this.loadMarkets();
    var startDate = this.props.reportSettings.startDate;
    var endDate = this.props.reportSettings.endDate;
    this.setState({startDate: startDate,
                     endDate: endDate});
    var interval = 1;
    var allMarkets = this.props.reportSettings.allMarkets;
    var selectedMarkets = this.props.reportSettings.selectedMarkets;

    //This Year
    var args = ['<ex:i8>'+startDate+'</ex:i8>', '<ex:i8>'+endDate+'</ex:i8>'];
/*
    if (allCurrencies) {
      args.push('<ex:i8>0</ex:i8>');
    } else {
      args.push(selectedCurrency);
    }
*/
    if (allMarkets) {
      // don't specify
    } else if (selectedMarkets) {
      args.push(JSON.stringify(selectedMarkets));
    } else {
      args.push(JSON.stringify([]));
    }

    MCA.methodCall('mca.genReportUserSummary', args, function (error, value) {
      if (error) {
        console.log('error:', error);
        console.log('req headers:', error.req && error.req._header);
        console.log('res code:', error.res && error.res.statusCode);
        console.log('res body:', error.body);
      } else {
        value = JSON.parse(value);
        this.setState({users: {firstTimeCount: value.firstTimeCount,
                             firstTimeCountLY: value.firstTimeCountLY,
                                  signupCount: value.signupCount,
                                signupCountLY: value.signupCountLY,
                                  uniqueCount: value.uniqueCount,
                                uniqueCountLY: value.uniqueCountLY}});
      }
    }.bind(this));

    MCA.methodCall('mca.genReportUniqueUsersByMarket', args, function (error, value) {
      if (error) {
        console.log('error:', error);
        console.log('req headers:', error.req && error.req._header);
        console.log('res code:', error.res && error.res.statusCode);
        console.log('res body:', error.body);
      } else {
        value = JSON.parse(value);
        // add UNATTRIBUTED
        value[0] = 0;
        this.setState({uniqueUsersByMarket: value});
      }
    }.bind(this));

    args = ['<ex:i8>'+startDate+'</ex:i8>',
            '<ex:i8>'+endDate+'</ex:i8>',
            interval];
    if (!allMarkets) {
      args.push(JSON.stringify(selectedMarkets));
    }

    MCA.methodCall('mca.genReportUserData', args, function (error, value) {
      if (error) {
        console.log('error:', error);
        console.log('req headers:', error.req && error.req._header);
        console.log('res code:', error.res && error.res.statusCode);
        console.log('res body:', error.body);
      } else {
        var usersByDate = [];
        var usersByMarket = [];
        value = JSON.parse(value);
        for (var d in value) {
          var firstTimeCountAcrossMarkets = 0;
          var signupCountAcrossMarkets = 0;
          for (var m in value[d]) {
            firstTimeCountAcrossMarkets += value[d][m].firstTimeCount;
            signupCountAcrossMarkets += value[d][m].signupCount;

            if (!usersByMarket[m]) {
              usersByMarket[m] = {
                firstTimeCount: 0,
                signupCount: 0
              }
            }
            usersByMarket[m].firstTimeCount += value[d][m].firstTimeCount;
            usersByMarket[m].signupCount += value[d][m].signupCount;
          }
          usersByDate[d] = {
            firstTimeCount: firstTimeCountAcrossMarkets,
            signupCount: signupCountAcrossMarkets
          };
        }
        this.setState({usersByDate: usersByDate,
                     usersByMarket: usersByMarket,
               usersByMarketByDate: value});
      }
    }.bind(this));

    MCA.methodCall('mca.genReportUniqueUsersByDate', args, function (error, value) {
      if (error) {
        console.log('error:', error);
        console.log('req headers:', error.req && error.req._header);
        console.log('res code:', error.res && error.res.statusCode);
        console.log('res body:', error.body);
      } else {
        var uniqueUsersByDate = [];
        value = JSON.parse(value);
        this.setState({uniqueUsersByDate: value});
      }
    }.bind(this));

    MCA.methodCall('mca.genReportUserMaxUnique', args, function (error, value) {
      if (error) {
        console.log('error:', error);
        console.log('req headers:', error.req && error.req._header);
        console.log('res code:', error.res && error.res.statusCode);
        console.log('res body:', error.body);
      } else {
        this.setState({maxUnique: parseInt(value)});
      }
    }.bind(this));

    //Last Year
    var startDateLY = new Date(startDate);
    startDateLY = new Date(startDateLY.getFullYear()-1,
                            startDateLY.getMonth(),
                            startDateLY.getDate(),
                            startDateLY.getHours(),
                            startDateLY.getMinutes()
                            ,0,0);

    var endDateLY = new Date(endDate);
    endDateLY = new Date(endDateLY.getFullYear()-1,
                          endDateLY.getMonth(),
                          endDateLY.getDate(),
                          endDateLY.getHours(),
                          endDateLY.getMinutes(),
                          0,0);

    args = ['<ex:i8>'+Math.round(startDateLY.getTime())+'</ex:i8>',
            '<ex:i8>'+Math.round(endDateLY.getTime())+'</ex:i8>',
            1];
    if (!allMarkets) {
      args.push(JSON.stringify(selectedMarkets));
    }

    MCA.methodCall('mca.genReportUserMaxUnique', args, function (error, value) {
      if (error) {
        console.log('error:', error);
        console.log('req headers:', error.req && error.req._header);
        console.log('res code:', error.res && error.res.statusCode);
        console.log('res body:', error.body);
      } else {
        this.setState({maxUniqueLY: parseInt(value)});
      }
    }.bind(this));
  }

  renderReport() {
    //Construct Report
    var marketRows = [];
    for (var m in this.state.usersByMarket) {
      marketRows.push(<tr key={m}>
                        <td>{this.state.marketDict[m]}</td>
                        <td>{this.state.usersByMarket[m].signupCount}</td>
                        <td>{this.state.usersByMarket[m].firstTimeCount}</td>
                        <td>{this.state.uniqueUsersByMarket[m]}</td>
                      </tr>);
    }
    var dateRows = [];
    for (var d in this.state.usersByDate) {
      dateRows.push(<tr key={d}>
                      <td>{moment.utc(parseInt(d)).local().format().split('T')[0]}</td>
                      <td>{this.state.usersByDate[d].signupCount}</td>
                      <td>{this.state.usersByDate[d].firstTimeCount}</td>
                      <td>{this.state.uniqueUsersByDate[d]}</td>
                    </tr>);
    }

    var startDate = moment.utc(this.props.reportSettings.startDate);
    var endDate = moment.utc(this.props.reportSettings.endDate);

    return (
      <div>
        <h2 style={{textAlign: 'center', width: '100%'}}>Double Up Food Bucks User Data</h2>
        <h4 style={{textAlign: 'center', width: '100%'}}>{startDate.local().format('dddd, DD MMMM YYYY HH:mm:ss')} – {endDate.local().format('dddd, DD MMMM YYYY HH:mm:ss')}</h4>
        <h5 style={{textAlign: 'center', width: '100%'}}>(UTC{moment.utc().local().format('Z')})</h5>
        <Row>
          <Col sm={6} style={{padding: 25, height: 425}}>
            <h4 className='text-center'>New Users</h4>
            <Row id='newUsersLine'></Row>
          </Col>
          <Col sm={6} style={{padding: 25, height: 425}}>
            <h4 className='text-center'>Unique Users vs. Previous Year</h4>
            <div id="uniqueUsersBar"></div>
          </Col>
        </Row>
        <Row>
          <h4 style={{textAlign: 'center', width: '100%'}}>User Stats vs. Previous Year</h4>
          <Col sm={4}>
            <PanelContainer controls={false}>
              <Panel ref={(c) => this.newUsersBox = c} >
                <PanelBody style={{padding: 25}}>
                  <h4 className='text-center'>Total New Users This Period<br/>(% Change vs. Previous Year)</h4>
                  <div className='text-center' style={{height: 30, fontSize: 32}}>
                    <Icon glyph={this.state.users.signupCount != null
                                  && (this.state.users.signupCount/this.state.users.signupCountLY) >= 1
                                      ? 'icon-fontello-up-dir-1'
                                      : 'icon-fontello-down-dir-1'} />
                    {this.state.users.signupCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      + ' ('
                      + (isFinite(((this.state.users.signupCount/this.state.users.signupCountLY)*100)-100)
                        ? (((this.state.users.signupCount/this.state.users.signupCountLY)*100)-100).toFixed(2)
                        : '--')
                      + '%)'}
                  </div>
                </PanelBody>
              </Panel>
            </PanelContainer>
          </Col>
          <Col sm={4}>
            <PanelContainer controls={false}>
              <Panel ref={(c) => this.uniqueUsersBox = c} >
                <PanelBody style={{padding: 25}}>
                  <h4 className='text-center'>Total Unique Users<br/>(% Change vs. Previous Year)</h4>
                  <div className='text-center' style={{height: 30, fontSize: 32}}>
                    <Icon glyph={this.state.users.uniqueCount != null
                                  && (this.state.users.uniqueCount/this.state.users.uniqueCountLY) >= 1
                                      ? 'icon-fontello-up-dir-1'
                                      : 'icon-fontello-down-dir-1'} />
                    {this.state.users.uniqueCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      + ' ('
                      + (isFinite(((this.state.users.uniqueCount/this.state.users.uniqueCountLY)*100)-100)
                        ? (((this.state.users.uniqueCount/this.state.users.uniqueCountLY)*100)-100).toFixed(2)
                        : '--')
                      + '%)'}
                  </div>
                </PanelBody>
              </Panel>
            </PanelContainer>
          </Col>
          <Col sm={4}>
            <PanelContainer controls={false}>
              <Panel ref={(c) => this.uniqueUsersMaxBox = c} >
                <PanelBody style={{padding: 25}}>
                  <h4 className='text-center'>Most Unique Users in One Day<br/>(% Change vs. Previous Year)</h4>
                  <div className='text-center' style={{height: 30, fontSize: 32}}>
                    <Icon glyph={this.state.maxUnique != null
                                  && (this.state.maxUnique/this.state.maxUniqueLY) >= 1
                                      ? 'icon-fontello-up-dir-1'
                                      : 'icon-fontello-down-dir-1'} />
                    {this.state.maxUnique.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      + ' ('
                      + (isFinite(((this.state.maxUnique/this.state.maxUniqueLY)*100)-100)
                        ? (((this.state.maxUnique/this.state.maxUniqueLY)*100)-100).toFixed(2)
                        : '--')
                      + '%)'}
                  </div>
                </PanelBody>
              </Panel>
            </PanelContainer>
          </Col>
        </Row>
        <Row>
          <Col sm={12}>
            <h4 style={{textAlign: 'center', width: '100%'}}>User Data by Location</h4>
            <br/>
            <Table ref={(c) => this.marketTable = c} className='display' cellSpacing='0' width='100%'>
              <thead>
                <tr>
                  <td>Location</td>
                  <td data-tip='A "new user" indicates a newly activated card and account.'>New User Signups</td>
                  <td data-tip='A "first time user" indicates the use of a cardholder&#39;s Double Up card for the first time.'>First Time Users</td>
                  <td data-tip='"Unique users" are distinct cardholders who have made a transaction.'>Unique Users</td>
                </tr>
              </thead>
              <tfoot>
                <tr>
                  <th>Totals:</th>
                  <th></th>
                  <th></th>
                  <th data-tip='Sum of unique users per market does not equal total across all markets. See total above.'></th>
                </tr>
              </tfoot>
              <tbody>
                {marketRows}
              </tbody>
            </Table>
          </Col>
        </Row>
        <Row>
          <Col sm={12}>
            <h4 style={{textAlign: 'center', width: '100%'}}>User Data by Date</h4>
            <br/>
            <Table ref={(c) => this.dateTable = c} className='display' cellSpacing='0' width='100%'>
              <thead>
                <tr>
                  <td>Date</td>
                  <td>New User Signups</td>
                  <td>First Time Users</td>
                  <td>Unique Users</td>
                </tr>
              </thead>
              <tfoot>
                <tr>
                  <th>Totals:</th>
                  <th></th>
                  <th></th>
                  <th data-tip='Sum of unique users per day does not equal total across all days. See total above.'></th>
                </tr>
              </tfoot>
              <tbody>
                {dateRows}
              </tbody>
            </Table>
          </Col>
        </Row>
        <ReactTooltip effect='solid' />
      </div>
    );
  }

  populateGraphs() {
    this.percentColor(this.newUsersBox, this.state.users.signupCount, this.state.users.signupCountLY);
    this.percentColor(this.uniqueUsersBox, this.state.users.uniqueCount, this.state.users.uniqueCountLY);
    this.percentColor(this.uniqueUsersMaxBox, this.state.maxUnique, this.state.maxUniqueLY);
    this.addDatatables(this.marketTable);
    this.addDatatables(this.dateTable);

    var nu_data = [];
    var keys = [];
    var labels = [];
    for (var d in this.state.usersByMarketByDate) {
      var datum = {date: moment.utc(parseInt(d)).local().format().split('T')[0]};
      for (var m in this.state.usersByMarketByDate[d]) {
        datum[m] = this.state.usersByMarketByDate[d][m].signupCount;
        if (keys.indexOf(m) == -1) {
          keys.push(m);
          labels.push(this.state.marketDict[m]);
        }
      }
      nu_data.push(datum);
    }

    if (this.state.newUsersLine == null) {
      this.setState({newUsersLine: Morris.Line({
        element: 'newUsersLine',
        data: nu_data,
        xkey: 'date',
        ykeys: keys,
        labels: labels,
        xLabels: 'time',
        pointSize: 2,
        resize: true,
        hideHover: 'auto'
      })});
    } else {
      this.state.newUsersLine.setData(nu_data);
    }

    if (this.state.uniqueUsersBar == null) {
      this.setState({uniqueUsersBar: Morris.Bar({
        element: 'uniqueUsersBar',
        data: [{y: 'User Count', a: this.state.users.uniqueCount , b: this.state.users.uniqueCountLY}],
        xkey: 'y',
        ykeys: ['a','b'],
        labels: ['Unique Users','Unique Users Previous Year']
      })});
    } else {
      this.state.uniqueUsersBar.setData({y: 'User Count', a: this.state.users.uniqueCount , b: this.state.users.uniqueCountLY});
    }
  }

  percentColor(element, thisYear, lastYear) {
    if ((thisYear/lastYear) >= 1) {
      $(ReactDOM.findDOMNode(element)).css({'background-color': '#60B044', 'color': '#ffffff'});
    } else {
      $(ReactDOM.findDOMNode(element)).css({'background-color': '#d62728', 'color': '#ffffff'});
    }
  }

  addDatatables(element) {
    var table = $(ReactDOM.findDOMNode(element));
    if (!$.fn.DataTable.isDataTable(table)) {
      table
        .addClass('nowrap')
        .dataTable({
          responsive: true,
          dom: 'Bfrtip',
          buttons: [
            {
              extend: 'csv',
              text: ' [Export CSV] ',
              footer: true,
              filename:
                'dufb_user_'
                  + moment.utc(this.state.startDate).local().format().split('T')[0]
                  + '_–_'
                  + moment.utc(this.state.endDate).local().format().split('T')[0]
            },
            {
              extend: 'excel',
              text: ' [Export XLSX] ',
              footer: true,
              filename:
                'dufb_user_'
                  + moment.utc(this.state.startDate).local().format().split('T')[0]
                  + '_–_'
                  + moment.utc(this.state.endDate).local().format().split('T')[0]
            },
            {
              extend: 'pdf',
              text: ' [Export PDF] ',
              footer: true,
              filename:
                'dufb_user_'
                  + moment.utc(this.state.startDate).local().format().split('T')[0]
                  + '_–_'
                  + moment.utc(this.state.endDate).local().format().split('T')[0],
              message:
                'User data for '
                  + moment.utc(this.state.startDate).local().format().split('T')[0]
                  + ' – '
                  + moment.utc(this.state.endDate).local().format().split('T')[0]
            }
          ],
          columnDefs: [
            {
              targets: [-1, -2, -3],
              className: 'text-right'
            }
          ],
          info: false,
          searching: false,
          paging: false,
          footerCallback: function(row, data, start, end, display) {
            var api = this.api(), data;

            var newTotal = api.column(-3).data().reduce(function(a, b) {
                                                            return parseInt(a) + parseInt(b);
                                                          }, 0);
            var firstTimeTotal = api.column(-2).data().reduce(function(a, b) {
                                                            return parseInt(a) + parseInt(b);
                                                          }, 0);
            $(api.column(-3).footer()).html(newTotal);
            $(api.column(-2).footer()).html(firstTimeTotal);
            $(api.column(-1).footer()).html('*');
          }
      });
    }
  }

  loadMarkets() {
    MCA.methodCall('mca.getAllowedMarkets', [], function (error, value) {
      if (error) {
        console.log('error:', error);
        console.log('req headers:', error.req && error.req._header);
        console.log('res code:', error.res && error.res.statusCode);
        console.log('res body:', error.body);
      } else {
        var markets = JSON.parse(value);
        var marketDict = [];
        for (var m in markets) {
          marketDict[markets[m].id] = markets[m].name;
        }
        // add unattributed
        marketDict['0'] = 'UNATTRIBUTED';

        this.setState({markets: markets,
                    marketDict: marketDict});
      }
    }.bind(this));
  }

  componentDidUpdate() {
    if (this.state.users != null
        && this.state.usersByDate != null
        && this.state.usersByMarket != null
        && this.state.uniqueUsersByDate != null
        && this.state.uniqueUsersByMarket != null
        && this.state.maxUnique != null
        && this.state.maxUniqueLY != null) {
      if (this.state.renderedReport == null) {
        this.setState({renderedReport: this.renderReport()});
      } else {
        $('#reportContent').show();
        this.populateGraphs();
      }
    }
  }


  render() {
    if (this.props.reportSettings.runReport != null) {
      return (
        <PanelContainer>
          <Panel>
            <PanelBody>
              <Grid>
                <Row>
                  <Col xs={12}>
                    <div><div id='reportContent'>{this.state.renderedReport != null ? this.state.renderedReport : 'Loading...'}</div></div>
                    <br/>
                  </Col>
                </Row>
              </Grid>
            </PanelBody>
          </Panel>
        </PanelContainer>
      );
    } else {
      return <div>Please Run a Report</div>;
    }
  }
}

