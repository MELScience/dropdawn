import React, { Component } from 'react';
import './App.css';

import { Router, Route, browserHistory, Link } from 'react-router';

import Dropdawn from '../dropdawn';

class Dropdown extends Component {
    constructor(...args) {
        super(...args);

        this.state = {
            isOpened: false,
        };

        this.dropdown = new Dropdawn({
            onShouldOpen: () => this.openDropdown(),
            onShouldClose: () => this.closeDropdown(),
            showOnFocus: !!this.props.showOnFocus, // false is default value
            dropdownOpener: null, // default value, but you can set it up later with .listenDropdownOpener method
            dropdownContainer: null, // default value, but you can set it up later with .listenDropdownContainer method
            disableDirtyCheck: false, // default value, in case of manual focus/blur calls
            dirtyCheckInterval: 500 // default value
        });
    }

    openDropdown() {
        if (this.state.isOpened) {
            return;
        }

        this.setState({ isOpened: true });
    }

    closeDropdown() {
        if (!this.state.isOpened) {
            return;
        }

        this.setState({ isOpened: false });
    }
    
    componentWillUnmount() {
        this.dropdown.destroy();
    }

    // Could be "better", for example through react context,
    // or you can have state right in your main component or even in some store
    // but I prefer to handle UI state in component's state
    onClick(event) {
        let { target } = event;

        while (target && target !== this.container) {
            const nodeName = (target.nodeName || '').toLowerCase();

            if (nodeName === 'a' || nodeName === 'button') {
                setTimeout(() => this.setState({ isOpened: false }));
                return;
            }

            target = target.parentNode;
        }
    }

    render() {
        return <div className="Dropdown">
            <button className="Dropdown__Button" ref={(node) => this.dropdown.listenDropdownOpener(node)}>
                {this.props.title}
            </button>
            <div className="Dropdown__ListContainer">
                {this.state.isOpened ? <div
                    className="Dropdown__List"
                    ref={(node) => {
                        this.dropdown.listenDropdownContainer(node);
                        this.container = node;
                    }}
                    onClick={(event) => this.onClick(event)}
                >
                    {this.props.children}
                </div> : null}
            </div>
        </div>;
    }
}

class Menu extends Component {
    render() {
        return <div className="Menu">
            <Link activeClassName="Menu__Item Menu__Item_active" className="Menu__Item" to="/">Root</Link>
            <Dropdown title="Project" showOnFocus>
                <Link
                    to="/about"
                    className="Dropdown__Item"
                    activeClassName="Dropdown__Item Dropdown__Item_active"
                >About</Link>
                <Link
                    to="/goals"
                    className="Dropdown__Item"
                    activeClassName="Dropdown__Item Dropdown__Item_active"
                >Goals</Link>
                <Link
                    to="/clients"
                    className="Dropdown__Item"
                    activeClassName="Dropdown__Item Dropdown__Item_active"
                >Clients</Link>
            </Dropdown>
            <Link activeClassName="Menu__Item Menu__Item_active" className="Menu__Item" to="/jobs">Jobs</Link>
            <Link activeClassName="Menu__Item Menu__Item_active" className="Menu__Item" to="/blog">Blog</Link>
            <Dropdown title="Profile">
                <Link
                    to="/user"
                    className="Dropdown__Item"
                    activeClassName="Dropdown__Item Dropdown__Item_active"
                >User</Link>
                <Link
                    to="/settings"
                    className="Dropdown__Item"
                    activeClassName="Dropdown__Item Dropdown__Item_active"
                >Settings</Link>
                <button
                    onClick={() => confirm('Are you sure?')}
                    className="Dropdown__Item"
                >Logout</button>
            </Dropdown>
        </div>;
    }
}

function App(props) {
    return <div className="App">
        <div className="App__Menu">
            <Menu />
        </div>
        <div className="App__Content">
            Content {props.location.pathname}
        </div>
    </div>;
}

export default function AppWithRouter() {
    return <Router history={browserHistory}>
        <Route path="*" component={App} />
    </Router>
}
