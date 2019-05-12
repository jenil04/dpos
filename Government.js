'use strict';

let EventEmitter = require('events');
let Block = require('./block.js');
let Delegate = require('./Delegate.js');
let Transaction = require('./transaction.js');

const NUM_CANDIDATES = 4;
const ACCEPT_REWARDS = "ACCEPT_REWARDS";
const PROPOSE_BLOCK = "PROPOSE_BLOCK";
const COMMIT_BLOCK = "COMMIT_BLOCK";
const BROADCAST_COMMITED_BLOCK = "BROADCAST_COMMITED_BLOCK";
const GIVE_REWARDS = "GIVE_REWARDS";
const TAX = 0.09;
const FEES = 0.001;

class Government extends EventEmitter
{

    constructor(broadcast, numVoters)
    {
        this.broadcast = broadcast;
        this.delegates = {}; // store the votes
        this.accounts = {}; // account balances in sys
        this.candidateBlocks = {}; // candidate: block holds the top 4 candidate and eventually thier blocks.
        this.numVoters = numVoters; // acts like the num of entities who can vote.
        this.on(ACCEPT_VOTES, this.acceptVote);
        this.on(PROPOSE_BLOCK, this.accumalateBlock); 
        this.on(BROADCAST_COMMITED_BLOCK, this.updateAccounts);
        this.on(COMMIT_BLOCK, this.broadcast(BROADCAST_COMMITED_BLOCK, this.block));
        this.on(GIVE_REWARDS, this.distributeRewards());
    }

    /**
     * Adding delegates and initializing votes. 
     * @param {*} delegates 
     */
    initVotes(...delegates)
    {
        delegates.forEach(delegateName => {
            this.delegates[delegateName] = 0;  //0 is the initial vote count.
        });
    }
    /**
     * Accepting votes from all the clients and adding it to the delegate map.
     * @param {*} name Name of the delegate. delegate[name] equates to the vote count.
     */
    acceptVote({name})
    {
        if(!this.delegates[name]) throw "delegate not found";
        this.delegates[name]++;
    }

    /**
     * after recieving enough candidate blocks, pick one delegate at random to commit.
     */
    determineWinner()
    {
        // choose a delegate at random
        let winner = Object.keys(this.candidateBlocks)[Math.random()*100 %4];
        log(`${winner} is the winner to commit the new blcok`);
        // TODO find a way to broadcast to winner only.
        this.broadcast(COMMIT_BLOCK, this.block); //this might change.
    }

    /**
     * Determine the top 4 candidate based on the votes. change the candidates map accordiglly.
     * we stop after we receive votes equal to num of voters.
     * 
     * We need to make sure that this is called when voting is done.
     * 
     */
    determineCandidates()
    {
        let sortedCandidates = [];
        for (let candidate in this.candidates) {
            sortedCandidates.push([candidate, this.candidates[candidate]]);
        }
        //Might delete later.
        sortedCandidates.sort((a, b) => b[1] - a[1]);
        let topFour = sortedCandidates.slice(0, NUM_CANDIDATES);
        // add the top 4 candidates to the candidate blocks list beacuse they will be proposing blocks later on.
        topFour.forEach( canName => this.candidateBlocks[canName] = undefined);
        // after finding the top four, ask to propose a block.
        // TODO: find a way to broadcast to candidates only not everyone on the network.
        this.broadcast(PROPOSE_BLOCK);
    }

    /**
     * add the blcok to the cadidate list. check the size of the list and compare against the NUM_CANDIDATES.
     * if equal, we call determine winner.
     * @param {*} param0 
     */
    accumalateBlock({name, block})
    {
        // only top 4 candidates can propose blocks
        if(!this.candidateBlocks[name]) throw `Delegate ${name} cannot propose a block because not from the top four`;
        this.candidateBlocks[name] = block;
        // if we have all 4 block or a variable minimum num of blocks, determine the winner
        if(this.getNumCandidateBlocks() == 4)
            this.determineWinner();
    }

    /**
     * get the number of the candidate blocks proposed so far.
     */
    getNumCandidateBlocks()
    {
        return Object.values(this.candidateBlocks).reduce((acc, block) => block ? acc+1: acc, 0);
    }

    /**
     * this function is used to kick start the election rounds in the system.
     * it works by setting time intervals to boardcast event for users to cast thier votes every 5 seconds.
     * Along with the broadcasted event, the government sends the list of the delegates that people can choose from.
     */
    startVotingRoundes()
    {
        let listOfdelegates = Object.keys(this.delegates);
        setInterval(() => this.broadcast(NEW_VOTING_ROUND, listOfdelegates), 5);
    }

    /**
     * as a response to BROADCAST_COMMITED_BLOCK event
     * loop though all the transactions of the block. update client accounts+ collect and distribute tax and reward.
     * in the end, broadcast the new map for acccounts.(ACCEPT_REWARDS)
     * @param {*} block the commited block
     */
    updateAccounts(block)
    {
        // we can have a step to verify that the commited block is same
        // as one of the candidate blocks.

        // then take one treansaction at a time and adjust accounts accordingly.
        // keep track of rewards, and tax too
        let tax = 0, rewards = 0;
        // block.transactions.foreach.....


        // notify the delegates about the new balances with the accounts.
        this.broadcast(ACCEPT_REWARDS, this.accounts);
    }
    
    /**
     * Calculating the rewards and distributing it to each delegate equally. 
     */
    distributeRewards(){
        let rewards = FEES * Block.getNumTransactions();
        let rew = rewards / NUM_CANDIDATES;
        this.broadcast(GIVE_REWARDS, rew);
    }

    
    log(s)
    {
        console.log(`GOV: ${s}`);
    }

}

module.exports = {
    TAX: TAX,
    FEES: FEES
}