import React from 'react';
import './App.css';
import {Route, Switch} from 'react-router-dom';
import LoginPage from './pages/login';
import HomePage from './pages/home';
import ShopPage from './pages/shop'

export default function App() {

    return (
        <Switch>
            <Route exact path="/" component={LoginPage}/>
            <Route exact path="/home" component={HomePage}/>
            <Route exact path="/shop" component={ShopPage}/>
        </Switch>
    );
}
