import React from 'react';
import ReactDOM from 'react-dom';
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

export default class TokenData extends React.Component {
  constructor() {
    super();
    this.state = {transactions: null,
            transactionsByDate: null,
          transactionsByMarket: null,
                renderedReport: null,
                    reportName: null,
                        report: null,
                     spendEarn: null,
                    currencies: [],
                 allCurrencies: false,
                       markets: [],
                    allMarkets: false}
  }

  componentDidMount() {
    this.loadMarkets();
    var startDate = this.props.reportSettings.startDate;
    var endDate = this.props.reportSettings.endDate;
    this.setState({startDate: startDate,
                     endDate: endDate});
    var isToken = true;
    var interval = 1;
    var allCurrencies = this.props.reportSettings.allCurrencies;
    var selectedCurrency = this.props.reportSettings.selectedCurrency;
    var allMarkets = this.props.reportSettings.allMarkets;
    var selectedMarkets = this.props.reportSettings.selectedMarkets;
    
    var args = ['<ex:i8>'+startDate+'</ex:i8>','<ex:i8>'+endDate+'</ex:i8>', isToken];
    if (!allCurrencies) {
      args.push('<ex:i8>' + selectedCurrency + '</ex:i8>');
    }
    if (!allMarkets) {
      args.push(JSON.stringify(selectedMarkets));
    }

    MCA.methodCall('mca.genReportTransactionSummary', args, function (error, value) {
      if (error) {
        console.log('error:', error);
        console.log('req headers:', error.req && error.req._header);
        console.log('res code:', error.res && error.res.statusCode);
        console.log('res body:', error.body);
      } else {
        value = JSON.parse(value);
        this.setState({transactions: {count: value.count,
                                    countLY: value.countLY,
                                       earn: value.earn.toFixed(2),
                                     earnLY: value.earnLY.toFixed(2),
                                      spend: value.spend.toFixed(2),
                                    spendLY: value.spendLY.toFixed(2)}});
      }
    }.bind(this));

    var args = ['<ex:i8>'+startDate+'</ex:i8>','<ex:i8>'+endDate+'</ex:i8>',isToken,interval];
    if (!allCurrencies) {
      args.push('<ex:i8>' + selectedCurrency + '</ex:i8>');
    }
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
        var transactionsByMarket = [];
        value = JSON.parse(value);
        for (var d in value) {
          var earnAcrossMarkets = 0;
          var spendAcrossMarkets = 0;
          var earnCountAcrossMarkets = 0;
          var spendCountAcrossMarkets = 0;
          for (var m in value[d]) {
            earnAcrossMarkets += value[d][m].earn;
            spendAcrossMarkets += value[d][m].spend;
            earnCountAcrossMarkets += value[d][m].earnCount;
            spendCountAcrossMarkets += value[d][m].spendCount;

            if (!transactionsByMarket[m]) {
              transactionsByMarket[m] = {
                earn: 0,
                spend: 0,
                earnCount: 0,
                spendCount: 0
              }
            }
            transactionsByMarket[m].earn += value[d][m].earn;
            transactionsByMarket[m].spend += value[d][m].spend;
            transactionsByMarket[m].earnCount += value[d][m].earnCount;
            transactionsByMarket[m].spendCount += value[d][m].spendCount;
          }
          transactionsByDate[d] = {
            earn: earnAcrossMarkets,
            spend: spendAcrossMarkets,
            earnCount: earnCountAcrossMarkets,
            spendCount: spendCountAcrossMarkets
          };
        }
        this.setState({transactionsByDate: transactionsByDate,
                     transactionsByMarket: transactionsByMarket});
      }
    }.bind(this));
  }

  renderReport() {
    //Construct Report
    var marketRows = [];
    for (var m in this.state.transactionsByMarket) {
      marketRows.push(<tr key={m}>
                        <td>{this.state.marketDict[m]}</td>
                        <td>{this.state.transactionsByMarket[m].earnCount}</td>
                        <td>{this.state.transactionsByMarket[m].earn.toFixed(2)}</td>
                        <td>{this.state.transactionsByMarket[m].spendCount}</td>
                        <td>{this.state.transactionsByMarket[m].spend.toFixed(2)}</td>
                      </tr>);
    }
    var dateRows = [];
    for (var d in this.state.transactionsByDate) {
      dateRows.push(<tr key={d}>
                      <td>{moment.utc(parseInt(d)).local().format().split('T')[0]}</td>
                      <td>{this.state.transactionsByDate[d].earnCount}</td>
                      <td>{this.state.transactionsByDate[d].earn.toFixed(2)}</td>
                      <td>{this.state.transactionsByDate[d].spendCount}</td>
                      <td>{this.state.transactionsByDate[d].spend.toFixed(2)}</td>
                    </tr>);
    }

    var startDate = moment.utc(this.props.reportSettings.startDate);
    var endDate = moment.utc(this.props.reportSettings.endDate);

    return (
      <div>
        <h2 style={{textAlign: 'center', width: '100%'}}>Double Up Food Bucks Token Conversions</h2>
        <h4 style={{textAlign: 'center', width: '100%'}}>{startDate.local().format('dddd, DD MMMM YYYY HH:mm:ss')} – {endDate.local().format('dddd, DD MMMM YYYY HH:mm:ss')}</h4>
        <h5 style={{textAlign: 'center', width: '100%'}}>(UTC{moment.utc().local().format('Z')})</h5>
        <Row>
          <Col sm={6} style={{padding: 25, height: 425}}>
            <h4 className='text-center'>Daily Conversions</h4>
            <Row id='earn-spend'></Row>
          </Col>
          <Col sm={6} style={{padding: 25, height: 425}}>
            <h4 className='text-center'>Transaction Volume Proportion</h4>
            <Row className='mx-auto' id='txnPie'></Row>
          </Col>
        </Row>
        <Row>
          <h4 style={{textAlign: 'center', width: '100%'}}>Conversions Stats vs. Previous Year</h4>
          <Col sm={2} />
          <Col sm={4}>
            <PanelContainer controls={false}>
              <Panel ref={(c) => this.txn = c} >
                <PanelBody style={{padding: 25}}>
                  <h4 className='text-center'>Number of Conversions<br/>(% Change vs. Previous Year)</h4>
                  <div className='text-center' style={{height: 30, fontSize: 32}}>
                    <Icon glyph={this.state.transactions != null
                                  && (this.state.transactions.count/this.state.transactions.countLY) >= 1
                                      ? 'icon-fontello-up-dir-1'
                                      : 'icon-fontello-down-dir-1'} />
                    {this.state.transactions.count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      + ' ('
                      + (isFinite(((this.state.transactions.count/this.state.transactions.countLY)*100)-100)
                        ? (((this.state.transactions.count/this.state.transactions.countLY)*100)-100).toFixed(2)
                        : '--')
                      + '%)'}
                  </div>
                </PanelBody>
              </Panel>
            </PanelContainer>
          </Col>
          <Col sm={4}>
            <PanelContainer controls={false}>
              <Panel ref={(c) => this.txnEarn = c} >
                <PanelBody style={{padding: 25}}>
                  <h4 className='text-center'>Total Amount Converted <br/>(% Change vs. Previous Year)</h4>
                  <div className='text-center' style={{height: 30, fontSize: 32}}>
                    <Icon glyph={this.state.transactions != null
                                  && (this.state.transactions.earn/this.state.transactions.earnLY) >= 1
                                      ? 'icon-fontello-up-dir-1'
                                      : 'icon-fontello-down-dir-1'} />
                    {this.state.transactions.earn.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      + ' ('
                      + (isFinite(((this.state.transactions.earn/this.state.transactions.earnLY)*100)-100)
                        ? (((this.state.transactions.earn/this.state.transactions.earnLY)*100)-100).toFixed(2)
                        : '--')
                      + '%)'}
                  </div>
                </PanelBody>
              </Panel>
            </PanelContainer>
          </Col>
          <Col sm={2} />
        </Row>
        <Row>
          <Col sm={12}>
            <h4 style={{textAlign: 'center', width: '100%'}}>Conversions by Location</h4>
            <br/>
            <Table ref={(c) => this.marketTable = c} className='display' cellSpacing='0' width='100%'>
              <thead>
                <tr>
                  <td>Location</td>
                  <td>Token Conversions</td>
                  <td>Amount Converted ($)</td>
                </tr>
              </thead>
              <tfoot>
                <tr>
                  <th>Totals:</th>
                  <th></th>
                  <th></th>
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
            <h4 style={{textAlign: 'center', width: '100%'}}>Conversions by Date</h4>
            <br/>
            <Table ref={(c) => this.dateTable = c} className='display' cellSpacing='0' width='100%'>
              <thead>
                <tr>
                  <td>Date</td>
                  <td>Token Conversions</td>
                  <td>Amount Converted ($)</td>
                </tr>
              </thead>
              <tfoot>
                <tr>
                  <th>Totals:</th>
                  <th></th>
                  <th></th>
                </tr>
              </tfoot>
              <tbody>
                {dateRows}
              </tbody>
            </Table>
          </Col>
        </Row>
      </div>
    );
  }

  populateGraphs() {
    this.percentColor(this.txn, this.state.transactions.count, this.state.transactions.countLY);
    this.percentColor(this.txnEarn, this.state.transactions.earn, this.state.transactions.earnLY);
    this.percentColor(this.txnSpend, this.state.transactions.spend, this.state.transactions.spendLY);

    this.addDatatables(this.marketTable);
    this.addDatatables(this.dateTable);

    var data = [];
    for (var d in this.state.transactionsByDate) {
      data.push({
        date: moment.utc(parseInt(d)).local().format().split('T')[0],
        earn: this.state.transactionsByDate[d].earn.toFixed(2),
        spend: this.state.transactionsByDate[d].spend.toFixed(2)
      });
    }
    if (this.state.spendEarn == null) {
      this.setState({spendEarn: Morris.Line({
        element: 'earn-spend',
        data: data,
        xkey: 'date',
        ykeys: ['earn'],
        labels: ['Tokens'],
        lineColors: ['#60B044', '#D62728'],
        xLabels: 'time',
        pointSize: 2,
        resize: true,
        hideHover: 'auto'
      })});
    } else {
      this.state.spendEarn.setData(data);
    }

    var columns = [];
    if (this.state.transactionsByMarket != null) {
      for (var m in this.state.transactionsByMarket) {
        var count = parseInt(this.state.transactionsByMarket[m].earnCount)
                        + parseInt(this.state.transactionsByMarket[m].spendCount);
        // don't push unattributed if empty
        if (!(m == '0' && count == 0)) {
          columns.push([this.state.marketDict[m], count]);
        }
      }

      if (columns.length == 1) {
        // if only one market, populate the pie with dates instead
        columns = [];
        for (var d in this.state.transactionsByDate) {
          var count = parseInt(this.state.transactionsByDate[d].earnCount)
                          + parseInt(this.state.transactionsByDate[d].spendCount);
          columns.push([moment.utc(parseInt(d)).local().format().split('T')[0], count]);
        }
      }
    }

    if (this.state.txnPie == null) {
      this.setState({txnPie: c3.generate({
        bindto: '#txnPie',
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
                'dufb_token_'
                  + moment.utc(this.state.startDate).local().format().split('T')[0]
                  + '_–_'
                  + moment.utc(this.state.endDate).local().format().split('T')[0]
            },
            { 
              extend: 'excel',
              text: ' [Export XLSX] ',
              footer: true,
              filename:
                'dufb_token_'
                  + moment.utc(this.state.startDate).local().format().split('T')[0]
                  + '_–_'
                  + moment.utc(this.state.endDate).local().format().split('T')[0]
            },
            { 
              extend: 'pdf',
              text: ' [Export PDF] ',
              footer: true,
              filename:
                'dufb_token_'
                  + moment.utc(this.state.startDate).local().format().split('T')[0]
                  + '_–_'
                  + moment.utc(this.state.endDate).local().format().split('T')[0],
              message:
                'Token data for '
                  + moment.utc(this.state.startDate).local().format().split('T')[0]
                  + ' – '
                  + moment.utc(this.state.endDate).local().format().split('T')[0]
            }
          ],
          columnDefs: [
            {
              targets: [-4, -3],
              className: 'text-right'
            }
          ],
          columns: [
            null, null, null, {visible: false}, {visible: false}
          ],
          info: false,
          searching: false,
          paging: false,
          footerCallback: function(row, data, start, end, display) {
            var api = this.api(), data;

            var earnCount = api.column(1).data().reduce(function(a, b) {
                                                            return parseInt(a) + parseInt(b);
                                                          }, 0);
            var earnTotal = api.column(2).data().reduce(function(a, b) {
                                                            return parseFloat(a) + parseFloat(b);
                                                          }, 0);
            $(api.column(1).footer()).html(earnCount);
            $(api.column(2).footer()).html(earnTotal.toFixed(2));
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
    if (this.state.transactions != null
        && this.state.transactionsByDate != null
        && this.state.transactionsByMarket != null) {
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

