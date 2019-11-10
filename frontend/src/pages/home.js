import React, {Component} from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import logo from './logo.svg';

import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from 'react-bootstrap/Navbar';

export default class HomePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: props.location.state.user,
            balance: '', // Keep track of the user's Fortissimo balance
            transactions: [],
        };

        //this.handleChange = this.handleChange.bind(this);
        //this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        // NOTE: use the setState function to update the state
        this.setState({value: event.target.value});
    }

    // Used to issue the query to get the user's balance
    async getBalance() {
        try {
            const res = await fetch("/fortissimo/balance");
            var res_json = await res.json();
            if (!res.ok) {
                console.log("Request error");
            } else {
                this.setState({balance: res_json.balance});
                console.log("Success");
            }
        } catch (err) {
            console.log("Caught error!");
            console.log(err);
        }
    }

    async getTransactions() {
        try {
            const res = await fetch("/transactions");
            var res_json = await res.json();

            if (!res.ok) {
                console.log("Request error");
            } else {
                this.setState({transactions: res_json});
                console.log("Success");
            }
            console.log(res_json);
        } catch (err) {
            console.log("Error when getting transactions");
            console.log(err);
        }
    }

    // Lifecycle method once component has been put into DOM for the first time
    componentDidMount() {
        this.getBalance();
        this.getTransactions();
    }

    render() {

        const columns = [{
            Header: "Hash",
            accessor: "hash"
        }, {
            Header: "From",
            accessor: "from"
        }, {
            Header: "Timestamp",
            accessor: "timestamp"
        }, {
            Header: "Success?",
            accessor: "status"
        }]

        return (
            <div>
                <Navbar bg="dark" variant="dark" expand="lg">
                    <Navbar.Brand href="#home">
                        <img
                            src={logo}
                            width="40"
                            height="40"
                        />
                        {' Fortissimo Marketplace'}
                    </Navbar.Brand>
                    <Navbar.Text>
                        <div display="flex" flex-direction="column">
                            <div> User: {this.state.user} </div>
                            <div> Balance: ff{this.state.balance} </div>
                        </div>
                    </Navbar.Text>
                    <Navbar.Text>
                        <a href="/logout"> Log Out </a>
                    </Navbar.Text>
                </Navbar>
                <h2 align="center"> Recent Transactions </h2>
                <ReactTable data={this.state.transactions} columns={columns} defaultPageSize={10}/>
            </div>
        )
    }
}
