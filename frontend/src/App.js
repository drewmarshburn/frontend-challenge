import React from 'react';
//import logo from './logo.svg';
import './App.css';
import {Route, Switch} from 'react-router-dom';
import LoginPage from './pages/login';
import HomePage from './pages/home';

export default function App() {

    return (
        <Switch>
            <Route exact path="/" component={LoginPage}/>
            <Route exact path="/home" component={HomePage}/>
        </Switch>
    );
}
