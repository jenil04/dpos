"use strict";

let EventEmitter = require('events');
const {
  TAX, 
  FEES, 
  ACCEPT_VOTES,
  NEW_VOTING_ROUND
} = require('./Government.js');
const POST_TRANSACTION = "POST_TRANSACTION";

/**
 * A client keeps track of its balance and can send and recieve messages.
 * A client can also vote or elect delegates for commiting the next block. 
 */
module.exports = class Client extends EventEmitter {


  constructor(broadcast, balance, canVote, ssn, name) {
    super();

    this.broadcast = broadcast;
    this.balance = balance;
    this.canVote = canVote; 
    this.ssn = ssn;
    this.name = name;
    this.on(NEW_VOTING_ROUND, this.vote);
  }

  /**
   * post a transaction to the network and specify the tax and the fees associated with it.
   * @param {Integer} amount the amount of the transaction
   * @param {String} to the ssn of the person to recieve the money.
   */
  postTransaction(amount, to) {
    let tax = amount * TAX;
    let fees = amount * FEES;
    if(amount + tax + fees > this.balance)
    {
      log(`${this.ssn} does not have enough balance to make the transaction.`);
      return;
    }
    // Broadcasting a new transaction.
    let tx ={
      amount: amount,
      tax: tax,
      fees: fees,
      to: to,
      from: this.ssn,
    }
    this.broadcast(POST_TRANSACTION, tx);
    this.log(`made a transaction of ${amount} to ${to}`);
  }

  /**
   * votes for any of the delegates specified in the list.
   * @param {string[]} d array of the delegates to vote for serialized
   */
  vote(d)
  {
    if(this.canVote)
    {
      // TODO delegates should be parse.
      let chosenDelegate = Math.floor(Math.random()*100) % d.length;
      this.log(`voted for ${d[chosenDelegate]}`);
      this.broadcast(ACCEPT_VOTES, {name: d[chosenDelegate]});
    }
  }

  log(s)
  {
    console.log(`${this.name}(${this.ssn}):`, s);
  }
}

