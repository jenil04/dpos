"use strict";
const utils = require('./utils.js');


/**
 * A block is a collection of transactions, with a hash connecting it
 * to a previous block.
 * 
 * The block also stores a list of UTXOs, organizing them by their
 * transaction IDs.
 */
module.exports = class Block {
  
  /**
   * Creates a new Block.  Note that the previous block will not be stored;
   * instead, its hash value will be maintained in this block.
   * 
   * @param {String} commiter - Name of the delegate commiting the block.
   * @param {Block} prevBlock - The previous block in the blockchain.
   */
  constructor(commiter, prevBlock) {
    this.prevBlockHash = prevBlock ? prevBlock.hashVal() : null;
  
    // Storing transactions in a Map to preserve key order.
    this.transactions = [];
    this.height = prevBlock ? prevBlock.height+1 : 1;
    this.commiter = commiter;
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
    b.commiter = o.commiter;
    // Transactions need to be recreated and restored in a map.
    o.transactions.forEach(([txId, txjson]) => {
      b.addTransaction(txjson);
    });
    return b;
  }

  getNumTransactions(){
    return this.transactions.length;
  }

  getTransactions(){
    return this.transactions;
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
    return `{ "transactions": ${JSON.stringify(Array.from(block.transactions.entries()))},` +	
          ` "commiter": "${block.commiter}",` +
          ` "height": "${block.height}" }`;
  }

  /**
   * Returns the cryptographic hash of the current block.
   */
  hashVal() {
    return utils.hash(Block.serialize(this));
  }

  /**
   * Adds a transaction to the block.
   * @param {Object} tx a transaction object
   */
  addTransaction(tx) 
  {
    this.transactions.push(tx);
  }
}
