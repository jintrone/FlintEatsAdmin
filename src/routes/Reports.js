import React from 'react';
import ReactDOM from 'react-dom';

import ReportControls from './reports/ReportControls.js';
import TransactionData from './reports/TransactionData.js';
import TokenData from './reports/TokenData.js';
import UserData from './reports/UserData.js';
import MarketData from './reports/MarketData.js';

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

export default class Reports extends React.Component {

  constructor() {
    super();
    this.state = {runReport: false, reportName: null,
                  startDate: null, endDate: null,
                  selectedCurrency: null, allCurrencies: null,
                  selectedMarkets: null, allMarkets: null,
                  key: 0}
    this.reportSettings = function(reportName, startDate, endDate, allCurrencies, selectedCurrency, allMarkets, selectedMarkets) {
      this.setState({reportName: reportName,
                      startDate: startDate,
                        endDate: endDate,
                  allCurrencies: allCurrencies,
               selectedCurrency: selectedCurrency,
                     allMarkets: allMarkets,
                selectedMarkets: selectedMarkets,
                      runReport: true,
                            key: this.state.key+1});
    }.bind(this);
  }

  componentDidUpdate() {
  }

  render() {
    var reportToRun = <div></div>;
    switch (this.state.reportName) {
      case 'TxnData':
        reportToRun = <div><TransactionData key={this.state.key} reportSettings={this.state}/></div>;
        break;
      case 'TokenData':
        reportToRun = <div><TokenData key={this.state.key} reportSettings={this.state}/></div>;
        break;
      case 'UserData':
        reportToRun = <div><UserData key={this.state.key} reportSettings={this.state}/></div>;
        break;
      case 'MMVData':
        reportToRun = <div><MarketData key={this.state.key} reportSettings={this.state}/></div>;
        break;
    }
      
    return (<div><div><ReportControls reportSettings={this.reportSettings} /></div><PanelContainer controls={false}>{reportToRun}</PanelContainer></div>);    
  }
}
