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

export default class ReportControls extends React.Component {

  constructor() {
    super();
    this.state = {
      markets: [],
      currencies: [],
      reportName: null,
      report: null,
      allMarkets: true,
      allCurrencies: true};
    this.reportOptions = [
      {name: 'Transaction Data', eventID: 0},
      {name: 'Token Data', eventID: 1},
      {name: 'User Data', eventID: 2},
      {name: 'Market Data', eventID: 3}
    ];
    this.selectedCurrency = null;
    this.selectedMarkets = null;
  }

  loadObjects() {
    MCA.methodCall('mca.getAllowedCurrencies', [], function (error, value) {
      if (error) {
        console.log('error:', error);
        console.log('req headers:', error.req && error.req._header);
        console.log('res code:', error.res && error.res.statusCode);
        console.log('res body:', error.body);
      } else {
        var currencies = JSON.parse(value);

        var currencyDict = [];
        for (var c in currencies) {
          currencyDict[currencies[c].id] = currencies[c].name;
        }
        this.setState({
                currencies: currencies,
                currencyDict: currencyDict});
      }
    }.bind(this));

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
        this.setState({
                markets: markets,
                marketDict: marketDict});
      }
    }.bind(this));
  }

  selectReport(selectedReport) {
    this.report = selectedReport;
    var buttondiv = $(ReactDOM.findDOMNode(this.reports));
    buttondiv.find("button").text(this.reportOptions[selectedReport-0].name);
  }

  selectCurrency(selectedCurrency) {
    this.selectedCurrency = selectedCurrency.target.value;
  }

  getMarkets() {
    var markets = [];
    $('.markets').find('input:checked').each(function() {
      markets.push($(this).val());
    });
    this.selectedMarkets = markets;
  }

  runReport(e) {
    e.preventDefault();
    e.stopPropagation();
    this.getMarkets();

    this.startDate = new Date($('#startdate').data('date')).getTime();
    // go to end of day
    var end = moment(new Date($('#enddate').data('date')).getTime());
    // uncomment when not using time in date picker
    //end.add(1, 'd').subtract(1, 'ms');
    this.endDate = end.valueOf();

    if (this.report == null) { //We need to tell the user they did something wrong
      alert('Please Select a Report');
    } else if (!this.state.allCurrencies
          && (this.selectedCurrency == null)) { // tell them they missed currencies
      alert('Please Select Currency');
    } else if (!this.state.allMarkets
          && (this.selectedMarkets == null || this.selectedMarkets.length == 0)) { // tell them they missed the market
      alert('Please Select Market(s)');
    } else if (this.startDate >= this.endDate) {
      alert('End Date Must Be After Start Date');
    } else {
      switch (this.report) {
        case 0:
          this.reportName = 'TxnData';
          break;
        case 1:
          this.reportName = 'TokenData';
          break;
        case 2:
          this.reportName = 'UserData';
          break;
        case 3:
          this.reportName = 'MMVData';
          break;
      }

      this.props.reportSettings(null, this.startDate, this.endDate,
          this.state.allCurrencies, this.selectedCurrency,
          this.state.allMarkets, this.selectedMarkets);
      this.props.reportSettings(this.reportName, this.startDate, this.endDate,
          this.state.allCurrencies, this.selectedCurrency,
          this.state.allMarkets, this.selectedMarkets);
    }
  }

  checkAllCurrencies() {
    if ($('#allCurrencies').is(':checked')) {
      this.setState({allCurrencies: true});
    } else {
      this.setState({allCurrencies: false});
    }
  }

  checkAllMarkets() {
    if ($('#allMarkets').is(':checked')) {
      this.setState({allMarkets: true});
    } else {
      this.setState({allMarkets: false});
    }
  }

  componentDidMount() {
    this.loadObjects();
    var defStartDate = new Date();
    var defEndDate = new Date();
    defStartDate.setDate(defEndDate.getDate()-7);
    defStartDate.setHours(0, 0, 0, 0);
    defEndDate.setHours(23, 59, 59, 999);

    $('#startdate').datetimepicker({
        inline: true,
        defaultDate: defStartDate,
        format: 'YYYY-MM-DD HH:mm:ss.SSS'
    });
    $('#enddate').datetimepicker({
        useCurrent: false, //Important! See issue #1075
        inline: true,
        defaultDate: defEndDate,
        format: 'YYYY-MM-DD HH:mm:ss.SSS'
    });
    $("#startdate").on("dp.change", function (e) {
        $('#enddate').data("DateTimePicker").minDate(e.date);
    });
    $("#enddate").on("dp.change", function (e) {
        $('#startdate').data("DateTimePicker").maxDate(e.date);
    });
    $('#allCurrencies').click(this.checkAllCurrencies.bind(this));
    $('#allMarkets').click(this.checkAllMarkets.bind(this));

  }

  render() {
    var currencyItems = [];
    currencyItems.push('- - - - -');
    for (var k in this.state.currencies) {
      currencyItems.push(<div><input type='radio'
                           key={this.state.currencies[k].id}
                           name='currencies'
                           className='currencies'
                           onChange={this.selectCurrency.bind(this)}
                           value={this.state.currencies[k].id}/>
                         {' ' + this.state.currencies[k].name}</div>);
    }
    var marketItems = [];
    marketItems.push('- - - - -');
    for (var k in this.state.markets) {
      marketItems.push(<Checkbox
                           key={this.state.markets[k].id}
                           name='checkbox-options'
                           className='markets'
                           defaultValue={this.state.markets[k].id}>
                         {this.state.markets[k].name}
                       </Checkbox>);
    }
    return (
      <div>
        <Row>
          <Col xs={12}>
            <PanelContainer>
              <Panel>
                <PanelBody>
                  <Grid>
                    <Row>
                      <Col xs={12}>
                        <div>
                          <Row>
                            <Col xs={12}>
                              <h2 style={{textAlign: 'center', width: '100%'}}>Report Parameters</h2>
                              <hr/>
                            </Col>
                          </Row>
                          <Row style={{paddingBottom: 20}}>
                            <Col sm={1}>
                            </Col>
                            <Col sm={4}>
                              Report:
                              <DropdownButton
                                  style={{marginLeft: 10, marginBottom: 10}}
                                  bsStyle='darkgreen45'
                                  title='Select a Report to Run'
                                  id='report'
                                  onSelect={this.selectReport.bind(this)}
                                  ref={(c) => this.reports = c}>
                                {this.reportOptions.map(function(obj, index) {
                                  return <MenuItem key={index} eventKey={ obj.eventID }>{obj.name}</MenuItem>;
                                })}
                              </DropdownButton>
                            </Col>
                          </Row>
                          <Row>
                            <Col sm={2}>
                            </Col>
                            <Col sm={5}>
                              Currencies (affects Transaction report only):
                              <Checkbox name='checkbox-options' id='allCurrencies' defaultValue={0} defaultChecked={true}>All Currencies</Checkbox>
                                {this.state.allCurrencies ? null : currencyItems}
                            </Col>
                          </Row>
                          <br/>
                          <Row>
                            <Col sm={2}>
                            </Col>
                            <Col sm={5}>
                              Markets:
                              <Checkbox name='checkbox-options' id='allMarkets' defaultValue={0} defaultChecked={true}>All Markets</Checkbox>
                                {this.state.allMarkets ? null : marketItems}
                            </Col>
                          </Row>
                          <Row>
                            <Col sm={1}>
                            </Col>
                            <Col sm={4} collapseRight>
                              <div><h4>Start Date:</h4><div id="startdate"></div></div>
                            </Col>
                            <Col sm={2}>
                            </Col>
                            <Col sm={4} collapseRight>
                              <div><h4>End Date:</h4><div id="enddate"></div></div>
                            </Col>
                            <Col sm={1}>
                            </Col>
                          </Row>
                          <Row>
                            <Col className='text-center'>
                              <Button lg style={{marginBottom: 10}} bsStyle='primary' onClick={::this.runReport.bind(this)} >Run Report</Button>
                            </Col>
                          </Row>
                        </div>
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

