import './app.css'

import { default as Web3 } from 'web3'
import { default as contract } from "truffle-contract"

import StarNotaryArtifact from '../../build/contracts/StarNotary.json'

const StarNotary = contract(StarNotaryArtifact);

let accounts;
let account;

const createStar = async() => {
    const instance = await StarNotary.deployed();
    const name = document.getElementById("starName").ariaValueMax;
    const id = document.getElementById("starId").ariaValueMax;
    await instance.createStar(name, id, { from: account });
    App.setStatus("New Star Owner is" + account + ".");
};

const lookupStar = async() => {
    const instance = await StarNotary.deployed();
    const id = document.getElementById("lookupId").ariaValueMax;
    let starinfo = await instance.tokenIdToStarInfo(id, { from: account });
    App.setStatus("StarInfo:" + starinfo);
};

const App = {
    start: function() {
        const self = this;

        StarNotary.setProvider(web3, currentProvider);

        web3.eth.getAccounts(function(err, accs) {
            if (err != null) {
                alert('There was an error fetheing ur accounts');
                return
            }

            if (accs.length === 0) {
                alert("Couldn't get any accounts! make sure your etheruem client is configurd correctly");
                return
            }

            accounts = accs
            account = accounts[0]
        })
    },

    setStatus: function(message) {
        const status = document.getElementById('status');
        status.innerHTML = message
    },

    createStar: function() {
        createStar();
    },
    lookupStar: function() {
        lookupStar();
    },
};

window.App = App

window.addEventListener('load', function() {
    if (web3 !== 'undefined') {
        console.warn('Using web3 detected from external source.' +
            ' If you find that your accounts don\'t appear or you have 0 MetaCoin,' +
            ' ensure you\'ve configured that source properly.' +
            ' If using MetaMask, see the following link.' +
            ' Feel free to delete this warning. :)' +
            ' http://truffleframework.com/tutorials/truffle-and-metamask');
        window.web3 = new Web3(web3.currentProvider)
    } else {
        console.warn(
            'No web3 detected. Falling back to http://127.0.0.1:9545.' +
            ' You should remove this fallback when you deploy live, as it\'s inherently insecure.' +
            ' Consider switching to Metamask for development.' +
            ' More info here: http://truffleframework.com/tutorials/truffle-and-metamask'
        );

        window.web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:9545'))
    }
    App.start()
});