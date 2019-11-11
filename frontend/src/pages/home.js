import React, {Component} from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';

import 'bootstrap/dist/css/bootstrap.min.css';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import MyNavbar from '../components/mynavbar'

export default class HomePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            //user: (props.location.data || {}).user,
            user: "0x9b1Ac985Ec7127FD29065dC29A5f1138a1b61BaD",
            balance: '', // Keep track of the user's Fortissimo balance
            contracts: [],
            purchased: [],
            showModal: false,
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
                this.setState({contracts: res_json});
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
            }
        } catch (err) {
            console.log("Error when getting my purchases.");
            console.log(err);
        }
    }

    openModal() {
        this.setState({showModal: true});
    }

    closeModal() {
        this.setState({showModal: false});
    }

    async handleSubmit(event) {
        event.preventDefault();
        console.log("Create " + this.state.secret + " cost " + this.state.price);

        try {

            const res = await fetch("/paytoview", {
                method: 'post',
                body: {
                    price: this.state.price,
                    secret: this.state.secret
                }
            });

            this.setState({showModal: false});
        } catch (err) {
            console.log("Error when submitting new data.");
            console.log(err);
        }
    }
    
    componentDidMount() {
        console.log(this.state.user);

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
                <h2 class="text-center"> My Posted Data </h2>
                <Button className="float-right" onClick={this.openModal} >Compose</Button>
            </div>

            <div>
                <ReactTable data={this.state.contracts}
                    columns={postedDataColumns}
                    defaultPageSize={5}
                />

                <h2 align="center" style={{marginTop: "20px"}}> Purchases </h2>
                <ReactTable data={this.state.purchased}
                    columns={purchasedDataColumns}
                    defaultPageSize={5}
                />

                <Modal show={this.state.showModal} onHide={this.closeModal}>
                    <Form>
                        <Form.Group>
                            <Form.Label>Address</Form.Label>
                            <Form.Control name="secret" type="text" placeholder="Enter your secret"
                                value={this.state.secret} onChange={this.handleChange}/>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Node</Form.Label>
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
