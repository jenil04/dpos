"use strict";

let EventEmitter = require('events');
let Transaction = require('./transaction.js');
let Wallet = require('./wallet.js');

const POST_TRANSACTION = "POST_TRANSACTION";

const TAX = 0.09;
const FEES = 0.001;

/**
 * A client has a wallet, sends messages, and receives messages
 * on the Blockchain network.
 */
module.exports = class Client extends EventEmitter {

  /**
   * The broadcast function determines how the client communicates
   * with other entities in the system. (This approach allows us to
   * simplify our testing setup.)
   * 
   * @param {function} broadcast - The function used by the client
   *    to send messages to all miners and clients.
   */
  constructor(broadcast, balance, canVote, ssn) {
    super();

    this.broadcast = broadcast;
    this.canVote = canVote; 
    this.balance = balance;
    this.ssn = ssn;
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
      console.error(`${this.ssn} does not have enough balance to make the transaction.`);
      return;
    }
    // Broadcasting a new transaction.
    let tx ={
      amount: amount,
      tax: tax,
      fees: fees,
      to: to
    }
    this.broadcast(POST_TRANSACTION, tx);
  }
}

