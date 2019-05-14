"use strict";
let Government = require('./Government.js').Government;
let Delegate = require('./Delegate.js');
let Client = require('./client.js');
let fakeNet = require('./fakeNet.js');


// Clients
let alice = new Client(fakeNet.broadcast, 133, true, "123", "alice");
let bob = new Client(fakeNet.broadcast, 99, true, "1233", "bob");
let charlie = new Client(fakeNet.broadcast, 355, true, "232", "charlie");

// Delegates
let del1 = new Delegate("del1", fakeNet.broadcast);
let del2 = new Delegate("del2", fakeNet.broadcast);
let del3 = new Delegate("del3", fakeNet.broadcast);
let del4 = new Delegate("del4", fakeNet.broadcast);

// Gov
let gov = new Government(fakeNet.broadcast,3);
gov.addDelegate(del1, del2, del3, del4);

// initial accounts
let accounts = {
  "123" : 133,
  "1233": 99,
  "232": 355,
  "del1" : 434,
  "del2" : 34,
  "del3" : 22,
  "del4" : 45,
  "gov":234,
}

// assgin accounts information to each delegate.
del1.accounts = JSON.parse(JSON.stringify(accounts));
del2.accounts = JSON.parse(JSON.stringify(accounts));
del3.accounts = JSON.parse(JSON.stringify(accounts));
del4.accounts = JSON.parse(JSON.stringify(accounts));


console.log("Starting simulation.  This may take a moment...");
console.log("Initial balances:");
console.log(`Initial balances to all accounts are\n`, accounts);
console.log(`Alice has ${alice.balance} coins.`);
console.log(`Bob has ${bob.balance} coins.`);
console.log(`Charlie has ${charlie.balance} coins.`);
console.log();

fakeNet.register(alice, bob, charlie, del1, del2, del3, del4, gov);

charlie.postTransaction(50, "1233");
gov.startVotingRoundes();
