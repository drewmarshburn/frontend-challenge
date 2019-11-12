import React, {Component} from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';

import 'bootstrap/dist/css/bootstrap.min.css';

import Button from 'react-bootstrap/Button';

import MyNavbar from '../components/mynavbar'

export default class ShopPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: (props.location.data || {}).user,
            //balance: props.location.data.balance, // Keep track of the user's Fortissimo balance
            balance: '',
            contracts: [],
        };
    }

    handleChange(event) {
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

    // Get the items this user can purchase
    async getShopListings() {
        try {
            const res = await fetch("/shop");
            var res_json = await res.json();

            if (!res.ok) {
                console.log("Error when getting shop listings");
            } else {
                this.setState({contracts: res_json});
            }
        } catch (err) {
            console.log("Error when getting shop listings.");
            console.log(err);
        }
    }

    // Purchase an item in the table
    async makePurchase(event, row) {
        try {

            // Send approval for currency transfer
            await fetch("/fortissimo/approve", {
                method: 'post',
                body: JSON.stringify( {
                        'spender': row.row.address,
                        'value': row.row.price,
                    }),
                headers: { 'Content-Type': 'application/json' }
            });

            // Fire buy action on contract
            await fetch("/paytoview/" + row.row.address + "/buySecret", {
                method: 'post',
            });

            console.log("Purchased: " + row.row.address);
            // Refresh the shop listings
            this.getShopListings();
        } catch (err) {
            console.log("Error when processing makePurchase: " + err);
        }
    }

    componentDidMount() {

        // Redirect users who are not logged in
        if (!this.state.user) {
            alert("Login required.");
            this.props.history.push({
                pathname: '/',
            });
        }

        this.getBalance();
        this.getShopListings();
    }

    render() {

        const columns = [{
            Header: "Address",
            accessor: "address"
        }, {
            Header: "Owner",
            accessor: "owner"
        }, {
            Header: "Price",
            accessor: "price"
        }, {
            Header: "",
            Cell: ({row}) => (<Button onClick={(e) => this.makePurchase(e, {row})}>Purchase</Button>)
        }]

        return (
            <div>
                <MyNavbar data={{user: this.state.user, balance: this.state.balance}}/>
                <h2 align="center"> Marketplace </h2>
                <ReactTable data={this.state.contracts}
                    columns={columns}
                    defaultPageSize={10}
                    />
            </div>
        )
    }
}
