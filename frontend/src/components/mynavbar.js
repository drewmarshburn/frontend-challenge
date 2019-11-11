import React, {Component} from 'react';
import logo from './logo.svg';

import {withRouter, Link} from 'react-router-dom';

import Navbar from 'react-bootstrap/Navbar';

class MyNavbar extends Component {

    constructor(props) {
        super(props);

        this.handleLogout = this.handleLogout.bind(this);
    }

    async handleLogout() {
        console.log("Logout");
        await fetch("/logout");
    }

    // Returns HTML for the navbar
    render() {
        return (
            <div>
            <Navbar bg="dark" variant="dark">
                <Navbar.Brand href="#home">
                    <img
                        src={logo}
                        width="40"
                        height="40"
                        alt=""
                    />
                    {' Fortissimo Marketplace'}
                </Navbar.Brand>
                <Navbar.Collapse className="justify-content-end">
                    <Navbar.Text style={{paddingRight: "30px"}}>
                        <Link
                            to={{
                                pathname: "/home",
                                data: this.props.data
                            }}
                        > Home </Link>
                    </Navbar.Text>
                    <Navbar.Text style={{paddingRight: "30px"}}>
                        <Link
                            to={{
                                pathname: "/shop",
                                data: this.props.data
                            }}
                        > Shop </Link>
                    </Navbar.Text>
                    <Navbar.Text>
                        <a href="/" onClick={this.handleLogout}> Logout </a>
                    </Navbar.Text>
                </Navbar.Collapse>
            </Navbar>

            <Navbar bg="dark" variant="dark" className="justify-content-between" style={{marginBottom: "20px"}}>
                <Navbar.Text>
                    <div> User: {this.props.data.user} </div>
                </Navbar.Text>
                <Navbar.Text>
                    <div> Balance: ff{this.props.data.balance} </div>
                </Navbar.Text>
            </Navbar>
            </div>
        )
    }
}

export default withRouter(MyNavbar);
