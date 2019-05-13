"use strict";

let Block = require('./block.js');
let Client = require('./client.js');

const NUM_ROUNDS_MINING = 2000;
const POST_TRANSACTION = "POST_TRANSACTION";
const COMMIT_BLOCK = "COMMIT_BLOCK";
const ACCEPT_REWARDS = "ACCEPT_REWARDS";
const PROPSE_CANDIDATE_BLOCK = "PROPSE_CANDIDATE_BLOCK";
const BROADCAST_COMMITED_BLOCK = "BROADCAST_COMMITED_BLOCK";
const PROPOSE_BLOCK = "PROPOSE_BLOCK";

/**
 * Miners are clients, but they also mine blocks looking for "proofs".
 * 
 * Each miner stores a map of blocks, where the hash of the block
 * is the key.
 */
module.exports = class Delegate extends Client {
  /**
   * When a new miner is created, but the PoW search is **not** yet started.
   * The initialize method kicks things off.
   * 
   * @param {function} broadcast - The function that the miner will use
   * to send messages to all other clients.
   */
  constructor(name, broadcast) {
    super(broadcast);

    // Used for debugging only.
    this.name = name;
    this.accounts = {};
    this.previousBlocks = {};
    this.currentBlock = {} // holds the current block we are working on

    this.on(COMMIT_BLOCK, this.addBlock); // when the gov choses me to commit the block.
    this.on(POST_TRANSACTION, this.addTransaction); // when i receive a new transaction to add.
    this.on(ACCEPT_REWARDS, this.updateAccounts); // after i commit the block and the government will update the accounts with the proper balances
    this.on(PROPSE_CANDIDATE_BLOCK, this.broadcast(PROPOSE_BLOCK, this.block)); 
    this.on(BROADCAST_COMMITED_BLOCK, this.receiveBlock);
  }

  /**
   * Broadcast the new block added to the blockchain
   */
  announceBlock() {
    this.broadcast(BLOCK_FOUND, this.currentBlock.serialize(true));
  }


  /**
   * Receives a block from another miner. If it is valid,
   * the block will be stored. If it is also a longer chain,
   * the miner will accept it and replace the currentBlock.
   * 
   * @param {string} s - The block in serialized form.
   */
  receiveBlock(s) { //Delegate doesnot need this method.
    let newBlock = block.deserialize(s);
    newBlock.previousBlock = this.previousBlock;
    this.currentBlock = newBlock;
  }
  /**
   * Add the accumated block to my blockchain because i gov 
   * said so. also because i was elected out of the four to add a
   * block.
   */
  addBlock()
  {
    this.currentBlock.previousBlock = this.previousBlock
    this.previousBlock = this.currentBlock
    this.currentBlock = {} // assign a new block
    // i need to announce the block that i jsut added with PROPOSE_COMMITED_BLOCK
    this.broadcast(BROADCAST_COMMITED_BLOCK, this.previousBlock.serialize(true));
  }

  updateAccounts(accounts)
  {
    this.accounts = accounts;
  }

  /**
   * Returns false if transaction is not accepted. Otherwise adds
   * the transaction to the current block.
   * 
   * @param {Transaction} tx - The transaction to add.
   */
  addTransaction(tx) {
    this.currentBlock.addTransaction(tx)
  }

  /**
   * Like console.log, but includes the miner's name to make debugging easier.
   * 
   * @param {String} msg - The message to display to the console.
   */
  log(msg) {
    console.log(`${this.name}: ${msg}`);
  }
}
