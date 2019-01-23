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

export default class MarketData extends React.Component {

  constructor() {
    super();
    this.state = {vendors: null,
             vendorTotals: null,
       transactionsByDate: null,
              usersByDate: null,
           renderedReport: null,
               reportName: null,
                   report: null,
                  markets: [],
               allMarkets: false}
  }

  componentDidMount() {
    this.loadMarkets();
    var startDate = this.props.reportSettings.startDate
    var endDate = this.props.reportSettings.endDate;
    this.setState({startDate: startDate,
                     endDate: endDate});
    var interval = 1;
    var allMarkets = this.props.reportSettings.allMarkets;
    var selectedMarkets = this.props.reportSettings.selectedMarkets;

    var args = ['<ex:i8>'+startDate+'</ex:i8>','<ex:i8>'+endDate+'</ex:i8>'];
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

    MCA.methodCall('mca.genReportMarketSummary', args, function (error, value) {
      if (error) {
        console.log('error:', error);
        console.log('req headers:', error.req && error.req._header);
        console.log('res code:', error.res && error.res.statusCode);
        console.log('res body:', error.body);
      } else {
        var txns = [];
        var spend = [];
        var earn = [];
        var val = JSON.parse(value);
        var vendors = [];
        vendors[0] = {
          id: 0,
          name: 'UNATTRIBUTED',
          txnCount: 0,
          earn: 0,
          earnReq: 0,
          spend: 0,
          signups: 0
        }
        for (var m in val) {
          txns[m] = 0;
          spend[m] = 0;
          earn[m] = 0;
          for (var v in val[m]) {
            // check if vendor is already in list
            // (can happen if vendor works at multiple markets)
            var id = val[m][v].id;
            var i = Object.keys(vendors).indexOf(String(id));
            if (i > -1) {
              vendors[id].txnCount += val[m][v].txnCount;
              vendors[id].earn += val[m][v].earn;
              vendors[id].earnReq += val[m][v].earnReq;
              vendors[id].spend += val[m][v].spend;
            } else {
              vendors[id] = val[m][v];
              vendors[id].signups = 0;
            }
            txns[m] += val[m][v].txnCount;
            spend[m] += val[m][v].spend;
            earn[m] += val[m][v].earn;
          }
        }
        this.setState({vendors: vendors,
                  vendorTotals: {spend: spend,
                                  earn: earn,
                          transactions: txns}});
      }
    }.bind(this));

    MCA.methodCall('mca.genReportGrowthByVendor', args, function (error, value) {
      if (error) {
        console.log('error:', error);
        console.log('req headers:', error.req && error.req._header);
        console.log('res code:', error.res && error.res.statusCode);
        console.log('res body:', error.body);
      } else {
        var val = JSON.parse(value);
        var vendors = [];
        vendors[0] = {
          id: 0,
          name: 'UNATTRIBUTED',
          signups: 0
        };
        for (var m in val) {
          for (var v in val[m]) {
            // check if vendor is already in list
            // (can happen if vendor works at multiple markets)
            var i = vendors.indexOf(val[m][v].id);
            if (i > -1) {
              // add to existing
              vendors[i].signups += val[m][v].signups;
            } else {
              vendors[val[m][v].id] = val[m][v];
            }
          }
        }
        this.setState({signupsByVendor: vendors});
      }
    }.bind(this));

    var args = ['<ex:i8>'+startDate+'</ex:i8>','<ex:i8>'+endDate+'</ex:i8>', interval];
    if (!allMarkets) {
      args.push(JSON.stringify(selectedMarkets));
    }
    MCA.methodCall('mca.genReportTransactionData', args, function (error, value) {
      if (error) {
        console.log('error:', error);
        console.log('req headers:', error.req && error.req._header);
        console.log('res code:', error.res && error.res.statusCode);
        console.log('res body:', error.body);
      } else {
        var transactionsByDate = [];
        value = JSON.parse(value);
        for (var d in value) {
          var countAcrossMarkets = 0;
          var earnAcrossMarkets = 0;
          var earnReqAcrossMarkets = 0;
          var spendAcrossMarkets = 0;
          for (var m in value[d]) {
            countAcrossMarkets += value[d][m].earnCount;
            countAcrossMarkets += value[d][m].spendCount;
            earnAcrossMarkets += value[d][m].earn;
            earnReqAcrossMarkets += value[d][m].earnReq;
            spendAcrossMarkets += value[d][m].spend;
          }
          transactionsByDate[d] = {
            count: countAcrossMarkets,
            earn: earnAcrossMarkets,
            earnReq: earnReqAcrossMarkets,
            spend: spendAcrossMarkets
          };
        }
        this.setState({transactionsByDate: transactionsByDate});
      }
    }.bind(this));

    MCA.methodCall('mca.genReportUserData', args, function (error, value) {
      if (error) {
        console.log('error:', error);
        console.log('req headers:', error.req && error.req._header);
        console.log('res code:', error.res && error.res.statusCode);
        console.log('res body:', error.body);
      } else {
        var usersByDate = [];
        value = JSON.parse(value);
        for (var d in value) {
          var signupCountAcrossMarkets = 0;
          var uniqueCountAcrossMarkets = 0;
          for (var m in value[d]) {
            signupCountAcrossMarkets += value[d][m].signupCount;
            uniqueCountAcrossMarkets += value[d][m].uniqueCount;
          }
          usersByDate[d] = {
            signupCount: signupCountAcrossMarkets,
            uniqueCount: uniqueCountAcrossMarkets
          };
        }
        this.setState({usersByDate: usersByDate});
      }
    }.bind(this));
  }

  renderReport() {
    //Construct Report

    // add in signups
    var vendors = this.state.vendors;
    var signups = this.state.signupsByVendor;
    for (var id in signups) {
      var i = Object.keys(vendors).indexOf(String(id));
      if (i > -1) {
        // add to existing
        vendors[id].signups += signups[id].signups;
      } else {
        vendors[id] = {
          id: id,
          name: signups[id].name,
          txnCount: 0,
          earn: 0,
          earnReq: 0,
          spend: 0,
          signups: signups[id].signups
        }
      }
    }
    // remove unattributed if empty
    if (vendors[0].txnCount == 0 && vendors[0].signups == 0) {
      delete vendors[0];
    }

    var vendorRows = vendors.map(function(obj, index) {
      return (<tr key={index}>
                <td>{obj.id}</td>
                <td>{obj.name}</td>
                <td>{obj.txnCount}</td>
                <td>{obj.earn.toFixed(2)}</td>
                <td>{obj.earnReq.toFixed(2)}</td>
                <td>{obj.spend.toFixed(2)}</td>
                <td>{obj.signups}</td>
              </tr>);
    });

    var dateRows = [];
    for (var d in this.state.transactionsByDate) {
      dateRows.push(<tr key={d}>
                      <td>{moment.utc(parseInt(d)).local().format().split('T')[0]}</td>
                      <td>{this.state.transactionsByDate[d].count}</td>
                      <td>{this.state.transactionsByDate[d].earn.toFixed(2)}</td>
                      <td>{this.state.transactionsByDate[d].earnReq.toFixed(2)}</td>
                      <td>{this.state.transactionsByDate[d].spend.toFixed(2)}</td>
                      <td>{this.state.usersByDate[d].signupCount}</td>
                    </tr>);
    }

    var startDate = moment.utc(this.props.reportSettings.startDate);
    var endDate = moment.utc(this.props.reportSettings.endDate);

    return (
      <div>
        <h2 style={{textAlign: 'center', width: '100%'}}>Double Up Food Bucks Market Data</h2>
        <h4 style={{textAlign: 'center', width: '100%'}}>{startDate.local().format('dddd, DD MMMM YYYY HH:mm:ss')} – {endDate.local().format('dddd, DD MMMM YYYY HH:mm:ss')}</h4>
        <h5 style={{textAlign: 'center', width: '100%'}}>(UTC{moment.utc().local().format('Z')})</h5>
        <Row>
          <Col sm={6} style={{padding: 25, height: 500}}>
            <h4 className='text-center'>Transaction Count</h4>
            <Row id='vendor-txns'></Row>
          </Col>
          <Col sm={6} style={{padding: 25, height: 425}}>
            <h4 className='text-center'>User Signups</h4>
            <Row id='signup-pie'></Row>
          </Col>
        </Row>
        <Row>
          <h4 style={{textAlign: 'center', width: '100%'}}>Totals</h4>
          <Col sm={4}>
            <PanelContainer controls={false}>
              <Panel ref={(c) => this.MMVTxn = c} style={{backgroundColor: '#428bca', color: '#ffffff'}} >
                <PanelBody style={{padding: 25}}>
                  <h4 className='text-center'>Total Number of Transactions</h4>
                  <div className='text-center' style={{height: 30, fontSize: 32}}>
                    {this.state.vendorTotals.transactions.reduce(function(a,b) {return a+b;}).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </div>
                </PanelBody>
              </Panel>
            </PanelContainer>
          </Col>
          <Col sm={4}>
            <PanelContainer controls={false}>
              <Panel ref={(c) => this.MMVEarned = c} style={{backgroundColor: '#428bca', color: '#ffffff'}} >
                <PanelBody style={{padding: 25}}>
                  <h4 className='text-center'>Total Amount Loaded (Earn)</h4>
                  <div className='text-center' style={{height: 30, fontSize: 32}}>
                    ${this.state.vendorTotals.earn.reduce(function(a,b) {return a+b;}).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </div>
                </PanelBody>
              </Panel>
            </PanelContainer>
          </Col>
          <Col sm={4}>
            <PanelContainer controls={false}>
              <Panel ref={(c) => this.MMVSpent = c} style={{backgroundColor: '#428bca', color: '#ffffff'}} >
                <PanelBody style={{padding: 25}}>
                  <h4 className='text-center'>Total Amount Redeemed (Spend)</h4>
                  <div className='text-center' style={{height: 30, fontSize: 32}}>
                    ${this.state.vendorTotals.spend.reduce(function(a,b) {return a+b;}).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </div>
                </PanelBody>
              </Panel>
            </PanelContainer>
          </Col>
        </Row>
        <Row>
          <Col sm={12}>
            <h4 style={{textAlign: 'center', width: '100%'}}>Statistics by Vendor</h4>
            <br/>
            <Table ref={(c) => this.statsByVendor = c} className='display' cellSpacing='0' width='100%'>
              <thead>
                <tr>
                  <td>Vendor ID</td>
                  <td>Vendor Name</td>
                  <td>Total Transactions</td>
                  <td>Amount Loaded (Earn) ($)</td>
                  <td data-tip='Total Double Up earn-eligible sale amount, ignoring daily limit'>Amount Load Requested ($)</td>
                  <td>Amount Redeemed (Spend) ($)</td>
                  <td>User Signups</td>
                </tr>
              </thead>
              <tfoot>
                <tr>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              </tfoot>
              <tbody>
                {vendorRows}
              </tbody>
            </Table>
          </Col>
        </Row>
        <Row>
          <Col sm={12}>
            <h4 style={{textAlign: 'center', width: '100%'}}>Statistics by Date</h4>
            <br/>
            <Table ref={(c) => this.statsByDate = c} className='display' cellSpacing='0' width='100%'>
              <thead>
                <tr>
                  <td>Date</td>
                  <td>Total Transactions</td>
                  <td>Amount Loaded (Earn) ($)</td>
                  <td data-tip='Total Double Up earn-eligible sale amount, ignoring daily limit'>Amount Load Requested ($)</td>
                  <td>Amount Redeemed (Spend) ($)</td>
                  <td>User Signups</td>
                </tr>
              </thead>
              <tfoot>
                <tr>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
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
    this.addDatatables(this.statsByVendor);
    this.addDatatables(this.statsByDate);

    var vt_data = [];
    for (var v in this.state.vendors) {
      vt_data.push({
        name: this.state.vendors[v].name,
        txnCount: this.state.vendors[v].txnCount
      });
    }
    if (this.state.vendorTxns == null) {
      this.setState({vendorTxns: Morris.Bar({
        element: 'vendor-txns',
        data: vt_data,
        xkey: 'name',
        ykeys: ['txnCount'],
        labels: ['Transactions'],
        xLabelAngle: 35,
        resize: true,
        hideHover: false,
        redraw: true
      })});
    } 

    if (this.state.MMVPie == null) {
      var columns = [];
      if (this.state.vendors != null) {
        for (var v in this.state.vendors) {
          columns.push([this.state.vendors[v].name,
                        this.state.vendors[v].signups]);
        }
      }

      this.setState({MMVPie: c3.generate({
        bindto: '#signup-pie',
        data: {
          columns: columns,
          type : 'pie'
        },
        tooltip: {
          format: {
            value: function (value, ratio, id) {
              return value+" ("+(ratio*100).toFixed(1)+"%)";
            }
          }
        }
      })});
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
                'dufb_market_'
                  + moment.utc(this.state.startDate).local().format().split('T')[0]
                  + '_–_'
                  + moment.utc(this.state.endDate).local().format().split('T')[0]
            },
            {
              extend: 'excel',
              text: ' [Export XLSX] ',
              footer: true,
              filename:
                'dufb_market_'
                  + moment.utc(this.state.startDate).local().format().split('T')[0]
                  + '_–_'
                  + moment.utc(this.state.endDate).local().format().split('T')[0]
            },
            {
              extend: 'pdf',
              text: ' [Export PDF] ',
              footer: true,
              filename:
                'dufb_market_'
                  + moment.utc(this.state.startDate).local().format().split('T')[0]
                  + '_–_'
                  + moment.utc(this.state.endDate).local().format().split('T')[0],
              message:
                'Market data for '
                  + moment.utc(this.state.startDate).local().format().split('T')[0]
                  + ' – '
                  + moment.utc(this.state.endDate).local().format().split('T')[0]
            }
          ],
          columnDefs: [
            {
              targets: [-1, -2, -3, -4, -5],
              className: 'text-right'
            }
          ],
          info: false,
          searching: false,
          paging: false,
          footerCallback: function(row, data, start, end, display) {
            var api = this.api(), data;

            var txnTotal = api.column(-5).data().reduce(function(a, b) {
                                                            return parseInt(a) + parseInt(b);
                                                          }, 0);
            var earnTotal = api.column(-4).data().reduce(function(a, b) {
                                                            return parseFloat(a) + parseFloat(b);
                                                          }, 0);
            var earnReqTotal = api.column(-3).data().reduce(function(a, b) {
                                                            return parseFloat(a) + parseFloat(b);
                                                          }, 0);
            var spendTotal = api.column(-2).data().reduce(function(a, b) {
                                                            return parseFloat(a) + parseFloat(b);
                                                          }, 0);
            var signupCount = api.column(-1).data().reduce(function(a, b) {
                                                            return parseInt(a) + parseInt(b);
                                                          }, 0);
            $(api.column(-5).footer()).html(txnTotal);
            $(api.column(-4).footer()).html(earnTotal.toFixed(2));
            $(api.column(-3).footer()).html(earnReqTotal.toFixed(2));
            $(api.column(-2).footer()).html(spendTotal.toFixed(2));
            $(api.column(-1).footer()).html(signupCount);
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
    if (this.state.vendors != null
        && this.state.transactionsByDate != null
        && this.state.usersByDate != null) {
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
