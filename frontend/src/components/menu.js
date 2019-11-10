import React, {Component} from 'react';

export default class Navbar extends Component {

    // NOTE: I might not do it this way
    // Returns HTML for the navbar
    render() {
        return (
            <ul>
                <li> <a href="/index.html">Home</a> </li>
            </ul>
        )
    }
}
