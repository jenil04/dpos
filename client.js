"use strict";

let EventEmitter = require('events');
const {
  TAX, 
  FEES, 
  ACCEPT_VOTES,
  NEW_VOTING_ROUND
} = require('./Government.js');
const Government = require('./Government.js');
const POST_TRANSACTION = "POST_TRANSACTION";

/**
 * A client keeps track of its balance and can send and recieve messages.
 * A client can also vote or elect delegates for commiting the next block. 
 */
module.exports = class Client extends EventEmitter {


  constructor(broadcast, balance, canVote, ssn) {
    super();

    this.broadcast = broadcast;
    this.balance = balance;
    this.canVote = canVote; 
    this.ssn = ssn;
    this.on(NEW_VOTING_ROUND, this.vote(Government.delegates));
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
  }

  /**
   * votes for any of the delegates specified in the list.
   * @param {String[]} delegates array of the delegates to vote for.
   */
  vote(delegates)
  {
    if(this.canVote)
    {
      let chosenDelegate = Math.random()*100 % delegates.length;
      this.broadcast(ACCEPT_VOTES, delegates[chosenDelegate]);
      log(`voted for ${delegates[chosenDelegate]}`)
    }
  }

  log(s)
  {
    console.log(`${this.name}: `);
  }
}

