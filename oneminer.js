"use strict";

let Government = require('./Government.js').Government;
let Delegate = require('./Delegate.js');
let Client = require('./client.js');
let fakeNet = require('./fakeNet.js');
let utils = require('./utils.js');


// Clients
let alice = new Client(fakeNet.broadcast, 100, true, "123", "alice");
let bob = new Client(fakeNet.broadcast, 200, true, "456", "bob");
let charlie = new Client(fakeNet.broadcast, 400, true, "789", "charlie");

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
  "123" :  100,
  "456":   200,
  "789":   400,
  "del1" : 100,
  "del2" : 100,
  "del3" : 100,
  "del4" : 100,
  "gov":   1000,
}

// assgin accounts information to each delegate.
del1.accounts = JSON.parse(JSON.stringify(accounts));
del2.accounts = JSON.parse(JSON.stringify(accounts));
del3.accounts = JSON.parse(JSON.stringify(accounts));
del4.accounts = JSON.parse(JSON.stringify(accounts));
gov.accounts = JSON.parse(JSON.stringify(accounts));


console.log("Starting simulation. This may take a moment...");
console.log();

console.log(`Initial balances to all accounts are \n`, accounts);
console.log();
console.log(`Alice has ${alice.balance} coins.`);
console.log(`Bob has ${bob.balance} coins.`);
console.log(`Charlie has ${charlie.balance} coins.`);
console.log();

fakeNet.register(alice, bob, charlie, del1, del2, del3, del4, gov);

console.log("-----MAKING A TRANSACTION-----");
console.log();
charlie.postTransaction(50, "123");
console.log();

console.log("-----BEGIN VOTING-----");
console.log();
gov.startVotingRoundes();

console.log("-----PRINTING UPDATED BALANCES-----");
console.log();
console.log(del1.accounts);


console.log("-----PRINTING BALANCES-----");
console.log();
console.log(`Alice now has ${alice.balance} coins.`);
console.log(`Bob now has ${bob.balance} coins.`);
console.log(`Charlie now has ${charlie.balance} coins.`);
console.log(`Del 1 now has ${accounts.del1} coins.`);
console.log(`Del 2 now has ${accounts.del2} coins.`);
console.log(`Del 3 now has ${accounts.del3} coins.`);
console.log();

console.log("-----MAKING ANOTHER TRANSACTION-----");
console.log();
alice.postTransaction(10, "456");
console.log();


console.log("-----BEGIN VOTING: SECOND ROUND-----");
console.log();
gov.startVotingRoundes();