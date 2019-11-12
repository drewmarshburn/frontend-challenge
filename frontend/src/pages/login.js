import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

class LoginPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
                address: '',
                node: ''
            };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({[event.target.name]: event.target.value});
    }

    // Handle submission of login form
    async handleSubmit(event) {
        event.preventDefault();
        console.log("Login submitted for: " + this.state.address + " on: " + this.state.node);
        try {
            const res = await fetch("/login", {
                method: 'POST',
                body: JSON.stringify(this.state),
                headers: { 'Content-Type': 'application/json' }
            });
            if (!res.ok) {
                console.log("Login request error");
            } else {
                console.log("Login success");
                // Redirect the user to the home page
                this.props.history.push({
                    pathname: '/home',
                    data: {user: this.state.address}
                });
            }
        } catch (err) {
            console.log("Caught error on login");
            console.log(err);
        }
    }

    render() {
        return (
            <div className="text-center" style={{display: "flex", flexDirection: "column",
                justifyContent: "center", maxWidth: "500px", margin: "auto"}}>
            <h2 > Fortissimo Marketplace Login </h2>
            <Form>
                <Form.Group style={{display: 'flex', justifyContent: "center", flexDirection: "column"}}>
                    <Form.Label>Address</Form.Label>
                    <Form.Control name="address" type="text" placeholder="Hex address"
                        value={this.state.address} onChange={this.handleChange}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Node</Form.Label>
                    <Form.Control name="node" type="text" placeholder="Node ID"
                        value={this.state.node} onChange={this.handleChange}/>
                </Form.Group>
                <Button variant="primary" type="submit" onClick={this.handleSubmit}>
                    Log In
                </Button>
            </Form>
            </div>
        )
    }
}

export default withRouter(LoginPage);
