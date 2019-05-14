"use strict";

let Block = require('./block.js');
let Client = require('./client.js');
const {
  PROPOSE_BLOCK,
  COMMIT_BLOCK,
  ACCEPT_REWARDS,
  BROADCAST_COMMITED_BLOCK,
  PROPOSE_CANDIDATE_BLOCK,
} = require('./Government.js');

const POST_TRANSACTION = "POST_TRANSACTION";

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
    this.lastCommitedBlock = undefined; // the last commited block. In a way the last finalized. 
    this.blockInProgress = new Block(null, null); // holds the current block we are working on
    // TODO chain if possible ;)
    this.on(COMMIT_BLOCK, this.addBlock); // when the gov choses me to commit the block.
    this.on(POST_TRANSACTION, this.addTransaction); // when i receive a new transaction to add.
    this.on(ACCEPT_REWARDS, this.updateAccounts); // after i commit the block and the government will update the accounts with the proper balances
    this.on(PROPOSE_BLOCK, this.announceCandidateBlock); // when delegates are asked to propose a block.
    this.on(BROADCAST_COMMITED_BLOCK, this.receiveBlock); // when other delegates are selected to add a block
  }

  /**
   * Broadcast the new block added to the blockchain
   */
  announceCandidateBlock() {
    this.broadcast(PROPOSE_CANDIDATE_BLOCK,
      { 
        name: this.name, 
        block: Block.serialize(this.blockInProgress),
      });
  }

  /**
   * Receives a block from another miner. If it is valid,
   * the block will be stored. If it is also a longer chain,
   * the miner will accept it and replace the currentBlock.
   * 
   * @param {string} b - The block in serialized form.
   */
  receiveBlock(b) 
  {
    // TODO I can compare the hashes of both block to avoid adding the
    // same block twice.
    let block = Block.deserialize(b);
    block.prevBlock = this.lastCommitedBlock;
    block.height = this.lastCommitedBlock ? this.lastCommitedBlock.height +1 : 1;
    // dont add this block because I just added it. resolve conflict of events here.
    if(this.lastCommitedBlock && block.height - 1 == this.lastCommitedBlock.height ) return;
    this.lastCommitedBlock = block;
    this.blockInProgress = new Block(this.name, undefined);
    this.log("Added block: " + JSON.stringify(this.lastCommitedBlock));
  }

  /**
   * Add the accumated block to my blockchain because i gov 
   * said so. also because i was elected out of the four to add a
   * block.
   * @param {string} b the serialized block.
   */
  addBlock(b)
  {
    let block = Block.deserialize(b);
    // dont add the block if i am not the one who should. ASSUMING HONEST DELEGATORS SO FAR.
    if(block.commiter !== this.name) return;
    //make the new block points to the last commited one.
    block.prevBlock = this.lastCommitedBlock;
    block.height = this.lastCommitedBlock ? this.lastCommitedBlock.height +1 : 1;
    this.lastCommitedBlock = block;
    this.blockInProgress = new Block(this.name, undefined);
    this.log(`Committed a new block because the gov chose me\n-> ${JSON.stringify(this.lastCommitedBlock)}`);
    console.log();
    // i need to announce the block that i jsut added with PROPOSE_COMMITED_BLOCK event
    // TODO I wonder if this will trigger my listner for the broadcast_commited_block event.
    this.broadcast(BROADCAST_COMMITED_BLOCK, Block.serialize(this.lastCommitedBlock));
  }

  /**
   * updated the internal balances to the new balances from the government.
   * because in every new block, the government sends the new accounts.
   * @param {Object} accounts the new account balances from the governement.
   */
  updateAccounts(accounts)
  {
    // some verifecation of gov sig could be done here.
    this.accounts = accounts;
  }

  /**
   * Returns false if transaction is not accepted. Otherwise adds
   * the transaction to the current block.
   * 
   * @param {Object} tx  The transaction to add.
   */
  addTransaction(tx) {
    // TODO some work to make sure transaction is valid could be done here.
    this.blockInProgress.addTransaction(tx)
  }

  /**
   * Like console.log, but includes the miner's name to make debugging easier.
   * 
   * @param {String} msg - The message to display to the console.
   */
  log(msg) {
    console.log(`${this.name}: `, msg);
  }
}
