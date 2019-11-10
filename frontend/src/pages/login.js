import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';

class LoginPage extends Component {
    constructor(props) {
        super(props);
        this.state = {value: ''};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    async handleSubmit(event) {
        event.preventDefault();
        console.log("Login submitted for: " + this.state.value);
        try {
            const res = await fetch("/login", {
                method: 'POST',
                body: JSON.stringify({"address": this.state.value}),
                headers: { 'Content-Type': 'application/json' }
            });
            if (!res.ok) {
                console.log("request error");
            } else {
                console.log("Success");
                // Redirect the user to the home page
                this.props.history.push({
                    pathname: '/home',
                    state: {user: this.state.value}
                });
            }
        } catch (err) {
            console.log("Caught error");
            console.log(err);
        }
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <label>
                    Address:
                    <input type="text" value={this.state.value} onChange={this.handleChange}/>
                </label>
                <input type="submit" value="Log In"/>
            </form>
        )
    }
}

export default withRouter(LoginPage);
