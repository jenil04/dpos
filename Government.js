'use strict';

let EventEmitter = require('events');
let Block = require('./block.js');
let Delegate = require('./Delegate.js');

const NUM_DELEGATE = 4;
const ACCEPT_REWARDS = "ACCEPT_REWARDS";
const PROPOSE_BLOCK = "PROPOSE_BLOCK";
const COMMIT_BLOCK = "COMMIT_BLOCK";

class Government extends EventEmitter
{

    constructor(broadcast, numVoters)
    {
        this.broadcast = broadcast;
        this.delegates = {};
        this.accounts = {};
        this.candidates = {};
        this.candidateBlocks = {};
        this.numVoters = numVoters;
        this.on(ACCEPT_VOTES, this.acceptVote);
        this.on(PROPOSE_BLOCK, this.accumalateBlock); 
        this.on(BROADCAST_COMMITED_BLOCK, this.updateAccounts);
        this.on(NEW_VOTING_ROUND, this.initVotes);
        this.on(COMMIT_BLOCK, this.broadcast(BROADCAST_COMMITED_BLOCK, this.block));
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
        this.emit(ACCEPT_VOTES);
        if(!this.delegates[name]) throw "delegate not found";
        this.delegates[name]++;
    }

    /**
     * Find the delegate with the highest votes and broadcast on the fake net COMMIT_BLOCK event
     * to the delegate to add block to BC
     */
    determineWinner()
    {
        if(this.candidateBlocks !== 4){
            throw new error("Waiting for all the proposed blocks...");
        }
        if(this.candidates !== 4){
            throw new error("No enough candidates..."); //Might delete this later. 
        }
        //assuming we already have four delegates.
        return Math.max(this.delegates[name]); //Not the best way to do this, might change later.
        this.broadcast(COMMIT_BLOCK, this.block); //this might change.
    }

    /**
     * Determine the top 4 candidate based on the votes. change the candidates map accordiglly.
     * we stop after we receive votes equal to num of voters.
     * 
     */
    determineCandidates()
    {
        var sortedCandidates = [];
        for (var candidate in this.candidates) {
            sortedCandidates.push([candidate, this.candidates[candidate]]);
        }
        //Might delete later.
        sortedCandidates.sort(function(a, b) {
        return b[1] - a[1];
        });
        let topFour = sortedCandidates.slice(0, 3);
        this.candidates.push(topFour);
        return this.candidates;
        this.emit(PROPOSE_BLOCK);
    }

    /**
     * add the blcok to the cadidate list. check the size of the list and compare against the NUM_DELEGATE.
     * if equal, we call determine winner.
     * @param {*} param0 
     */
    accumalateBlock({name, block})
    {
        if(this.candidates.length !== NUM_DELEGATE) throw new error("Waiting for four candidates...");
        this.candidateBlocks.push({name, block});
        this.determineWinner();
    }

    /**
     * as a response to BROADCAST_COMMITED_BLOCK event
     * loop though all the transactions of the block. update client accounts+ collect and distribute tax and reward.
     * in the end, broadcast the new map for acccounts.(ACCEPT_REWARDS)
     * @param {*} block the commited block
     */
    updateAccounts(block)
    {
        //Will update later..
    }

}