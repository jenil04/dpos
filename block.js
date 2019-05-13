"use strict";

const {TAX, FEES} = require('./Government.js');
const utils = require('./utils.js');
const Delegate = require('./Delegate.js');


/**
 * A block is a collection of transactions, with a hash connecting it
 * to a previous block.
 * 
 * The block also stores a list of UTXOs, organizing them by their
 * transaction IDs.
 */
module.exports = class Block {

  /**
   * This method is designed to produce the very first block, known as the
   * genesis block, which does not follow normal rules.  It role is to
   * establish all starting funds for different parties.
   * 
   * @param {Array} clientInitialFunds - A list of pairs specifying a client
   * and the amount of coins that client should start with.
   */
  static makeGenesisBlock(clientInitialFunds, from, to) {
    let outputs = [];
    clientInitialFunds.forEach(({ client, amount }) => {
      let addr = client.wallet.makeAddress();
      let out = { address: addr, amount: amount};
      outputs.push(out);
    });

    let tx = new Transaction({from: from, to: to, TAX, FEES});

    // Creating block
    let genesis = new Block();
    genesis.addTransaction(tx);
    return genesis;
  }

  /**
   * Converts a string representation of a block to a new Block instance.
   * We assume that a serialized block intentended for deserialization
   * (in other words, sharing over the network) always includes the UTXOs.
   * 
   * @param {string} text - A string representing a block in JSON format.
   */
  static deserialize(text) {
    let b = new Block();
    let o = JSON.parse(text);
    b.prevBlockHash = o.prevBlockHash;
    b.timestamp = o.timestamp;
    b.height = parseInt(o.height);

    // Transactions need to be recreated and restored in a map.
    b.transactions = [];
    return b;
  }

  getNumTransactions(){
    return this.transactions.size();
  }

  getTransactions(){
    return this.transactions;
  }

  /**
   * Creates a new Block.  Note that the previous block will not be stored;
   * instead, its hash value will be maintained in this block.
   * 
   * @param {String} commiter - Name of the delegate commiting the block.
   * @param {Block} prevBlock - The previous block in the blockchain.
   * @param {Array} transactions - Array of transaction objects.
   * @param {Int} height - The length of the chain from the genesis block.
   */
  constructor(commiter, prevBlock) {
    this.prevBlockHash = prevBlock ? prevBlock.hashVal() : null;

    // Storing transactions in a Map to preserve key order.
    this.transactions = [];
    this.height = prevBlock ? prevBlock.height+1 : 1;
    this.timestamp = Date.now();
    this.commiter = commiter;
  }

  /**
   * The genesis block has special rules.  The coinbase transaction can have
   * limitless outputs and is still valid.  Note that a new Genesis block will
   * be ignored by miners who have a longer chain already.
   */
  isGenesisBlock() {
    return !this.prevBlockHash;
  }

  /**
   * Converts a Block into string form. 
   */
  static serialize(block) { 
    let o = JSON.parse(block);
    block.prevBlockHash = o.prevBlockHash;
    block.timestamp = o.timestamp;
    block.height = parseInt(o.height);
    block.commiter = o.commiter;
    block.transactions = o.transactions;
    return block.toString();
  }

  /**
   * Returns the cryptographic hash of the current block.
   */
  hashVal() {
    return utils.hash(this.serialize());
  }

  /**
   * Sends the transaction from and to the desired address.
   * 
   * @param {String} from - the address from which the amount is deducted
   * @param {String} to - The address from which the amount is added
   * @param {Integer} amount - The amount of funds needed to be transferred 
   */
  addTransaction(from, to, amount) {
    let tax = TAX * amount;
    let fee = FEES * amount;
    this.transactions.push({from: from, to: to, tax: tax, fee: fee});
  }
}
