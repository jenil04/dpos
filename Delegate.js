"use strict";

let Block = require('./block.js');
let Client = require('./client.js');

const NUM_ROUNDS_MINING = 2000;

const POST_TRANSACTION = "POST_TRANSACTION";
const COMMIT_BLOCK = "COMMIT_BLOCK";
const ACCEPT_REWARDS = "ACCEPT_REWARDS";
const PROPSE_CANDIDATE_BLOCK = "PROPSE_CANDIDATE_BLOCK";
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

    this.on(COMMIT_BLOCK, this.addBlock);
    this.on(POST_TRANSACTION, this.addTransaction);
    this.on(ACCEPT_REWARDS, this.updateAccounts);
    this.on(PROPSE_CANDIDATE_BLOCK, this.broadcast(PROPOSE_BLOCK, this.block))
  }
  //   this.on(POST_TRANSACTION, this.addTransaction);

  // /**
  //  * Sets up the miner to start searching for a new block.
  //  * 
  //  * @param {boolean} reuseRewardAddress - If set, the miner's previous
  //  *      coinbase reward address will be reused.
  //  */
  // startNewSearch(reuseRewardAddress=false) {
  //   // Creating a new address for receiving coinbase rewards.
  //   // We reuse the old address if 
  //   if (!reuseRewardAddress) {
  //     this.rewardAddress = this.wallet.makeAddress();
  //   }

  //   // Create a new block, chained to the previous block.
  //   let b = new Block(this.rewardAddress, this.currentBlock);

  //   // Store the previous block, and then switch over to the new block.
  //   this.previousBlocks[b.prevBlockHash] = this.currentBlock;
  //   this.currentBlock = b;

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
    // let b = Block.deserialize(s);
    // // FIXME: should not rely on the other block for the utxos.
    // if (!this.isValidBlock(b)) {
    //   this.log(`rejecting invalid block: ${s}`);
    //   return false;
    // }

    // // If we don't have it, we store it in case we need it later.
    // if (!this.previousBlocks[b.hashVal()]) {
    //   this.previousBlocks[b.hashVal()] = b;
    // }

    // // We switch over to the new chain only if it is better.
    // if (b.chainLength > this.currentBlock.chainLength) {
    //   this.log(`cutting over to new chain.`);
    //   this.currentBlock = b;
    //   this.startNewSearch(true);
    // }


  }
  /**
   * Add the accumated block to my blockchain because i gov 
   * said so. also because i was elected out of the four to add a
   * block.
   */
  addBlock()
  {
    
    // i need to announce the block that i jsut added with PROPOSE_COMMITED_BLOCK

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
    // if (!this.currentBlock.willAcceptTransaction(tx)) {
    //   return false;
    // }
    // // FIXME: Toss out duplicate transactions, but store pending transactions.
    // this.currentBlock.addTransaction(tx);
    // return true;


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
