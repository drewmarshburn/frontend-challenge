import React, {Component} from 'react';

import ReactTable from 'react-table';
import 'react-table/react-table.css';

import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

import MyNavbar from '../components/mynavbar'

export default class HomePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: (props.location.data || {}).user, // User account
            balance: '', // User's Fortissimo balance
            myContracts: [], // Contracts created by the user
            purchased: [], // Contracts purchased by the user

            // Following used for contract creation modal
            showCreateModal: false,
            secret: '',
            price: ''
        };

        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({[event.target.name]: event.target.value});
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

    async getMyListings() {
        try {
            const res = await fetch("/my_listings");
            var res_json = await res.json();

            if (!res.ok) {
                console.log("Error when getting my listings");
            } else {
                this.setState({myContracts: res_json});
            }
        } catch (err) {
            console.log("Error when getting my listings.");
            console.log(err);
        }
    }

    async getMyPurchases() {
        try {
            const res = await fetch("/my_purchases");
            var res_json = await res.json();

            if (!res.ok) {
                console.log("Error when getting my purchases");
            } else {
                this.setState({purchased: res_json});
                console.log(this.state.purchased);
            }
        } catch (err) {
            console.log("Error when getting my purchases.");
            console.log(err);
        }
    }

    openModal() {
        this.setState({showCreateModal: true});
    }

    closeModal() {
        this.setState({showCreateModal: false});
    }

    async handleSubmit(event) {
        event.preventDefault();

        try {

            await fetch("/paytoview", {
                method: 'post',
                body: JSON.stringify( {
                        'price': this.state.price,
                        'secret': this.state.secret,
                    }),
                headers: { 'Content-Type': 'application/json' }
            });

            console.log("Create " + this.state.secret + " cost " + this.state.price);
            this.closeModal();
            this.getMyListings();
            // Clear the input form state
            this.setState({
                secret: '',
                price: ''
            });
        } catch (err) {
            console.log("Error when submitting new data.");
            console.log(err);
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
        this.getMyListings();
        this.getMyPurchases();
    }

    render() {

        const postedDataColumns = [{
            Header: "Address",
            accessor: "address"
        }, {
            Header: "Price",
            accessor: "price"
        }, {
            Header: "Data",
            accessor: "secret"
        }]

        const purchasedDataColumns = [{
            Header: "Address",
            accessor: "address"
        }, {
            Header: "Paid",
            accessor: "price"
        }, {
            Header: "Secret",
            accessor: "secret"
        }]

        return (
            <div>
            <div>
                <MyNavbar data={{user: this.state.user, balance: this.state.balance}}/>
            </div>
            <div style={{marginBottom: "50px"}}>
                <h2> My Posted Data </h2>
                <Button className="float-right" onClick={this.openModal} >Compose</Button>
            </div>

            <div>
                <ReactTable data={this.state.myContracts}
                    columns={postedDataColumns}
                    defaultPageSize={5}
                />

                <h2 align="center" style={{marginTop: "20px"}}> Purchases </h2>
                <ReactTable data={this.state.purchased}
                    columns={purchasedDataColumns}
                    defaultPageSize={5}
                />

                <Modal show={this.state.showCreateModal} onHide={this.closeModal}>
                    <Form>
                        <Form.Group>
                            <Form.Label>Secret</Form.Label>
                            <Form.Control name="secret" type="text" placeholder="Enter your secret"
                                value={this.state.secret} onChange={this.handleChange}/>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Price</Form.Label>
                            <Form.Control name="price" type="text" placeholder="Enter the price"
                                value={this.state.price} onChange={this.handleChange}/>
                        </Form.Group>
                    </Form>
                    <Button onClick={this.handleSubmit}>Submit</Button>
                    <Button onClick={this.closeModal}>Close</Button>
                </Modal>
            </div>
            </div>
        )
    }
}
