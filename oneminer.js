"use strict";

<<<<<<< Updated upstream
let Block = require('./block.js');
let Client = require('./client.js');
let fakeNet = require('./fakeNet.js');
=======
let Block = require('../block.js');
let Client = require('../client.js');
let fakeNet = require('../fakeNet.js');
>>>>>>> Stashed changes

// Clients
let alice = new Client(fakeNet.broadcast, 133, true, "123");
let bob = new Client(fakeNet.broadcast, 99, true, "1233");
let charlie = new Client(fakeNet.broadcast, 355, true, "232");

// Delegates
let del1 = new Delegate("del1", fakeNet.broadcast);
let del2 = new Delegate("del2", fakeNet.broadcast);
let del3 = new Delegate("del3", fakeNet.broadcast);

// Gov
let gov = new Governemnt(fakeNet.broadcast,3);
gov.addDelegate(del1, del2, del3);

// initial accounts
let accounts = {
  "123" : 133,
  "1233": 99,
  "232": 355,
  "del1" : 434,
  "del2" : 34,
  "del3" : 22,
  "gov":234,
}

// assgin accounts information to each delegate.
del1.accounts = JSON.parse(JSON.stringify(accounts));
del2.accounts = JSON.parse(JSON.stringify(accounts));
del3.accounts = JSON.parse(JSON.stringify(accounts));


console.log("Starting simulation.  This may take a moment...");


console.log("Initial balances:");
console.log(`Initial balances to all accounts are ${accounts}`);
console.log(`Alice has ${alice.balance} coins.`);
console.log(`Bob has ${bob.balance} coins.`);
console.log(`Charlie has ${charlie.balance} coins.`);
console.log();

fakeNet.register(alice, bob, charlie, del1, del2, del3);













// Miners start mining.
minnie.initialize(genesis);

// Alice transfers some money to Bob.
let bobAddr = bob.wallet.makeAddress();
console.log(`Alice is transfering 40 coins to ${bobAddr}`);
alice.postTransaction([{ amount: 40, address: bobAddr }]);

// Print out the final balances after it has been running for some time.
setTimeout(() => {
  console.log();
  console.log(`Minnie has a chain of length ${minnie.currentBlock.chainLength}, with the following UTXOs:`);
  minnie.currentBlock.displayUTXOs();

  console.log();
  console.log("Final wallets:");
  console.log(`Alice has ${alice.wallet.balance} coins.`);
  console.log(`Bob has ${bob.wallet.balance} coins.`);
  console.log(`Charlie has ${charlie.wallet.balance} coins.`);
  console.log(`Minnie has ${minnie.wallet.balance} coins.`);
}, 10000);

