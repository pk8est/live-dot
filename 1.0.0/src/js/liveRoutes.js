import React from 'react/addons';
import Router from 'react-router';
import Header from './pages/common/Header';
import Sidebar from './pages/common/Sidebar';
import LiveManagerPage from './pages/LiveManagerPage'; 


var Route = Router.Route;
var DefaultRoute = Router.DefaultRoute;
var RouteHandler = Router.RouteHandler;

var Live = React.createClass({
  render: function () {
    return (
        <RouteHandler />
      );
    }
});

var routes = (
    <Route path="/" handler={Live}>
        <Route path="/" handler={LiveManagerPage}/>
    </Route>
);

module.exports = routes;
