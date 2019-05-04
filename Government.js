'use strict';
let EventEmitter = require('events');

const NUM_DELEGATE = 4;
const ACCEPT_REWARDS = "ACCEPT_REWARDS";
const PROPOSE_BLOCK = "PROPOSE_BLOCK";

class Government extends EventEmitter
{

    constructor(broadcast, numVoters)
    {
        this.broadcast = broadcast;
        this.delegates = {};
        this.accounts = {};
        this.candidateBlocks = {};
        this.numVoters = numVoters;
        this.on(ACCEPT_VOTES, this.acceptVote);
        this.on(PROPOSE_BLOCK, this.accumalateBlock);
        this.on(BROADCAST_COMMITED_BLOCK, this.updateAccounts);
        this.on(NEW_VOTING_ROUND, this.initVotes);
    }


    addDelegates(...delegates)
    {
        delegates.forEach(delegateName => {
            this.delegates[delegateName] = 0;
        });
    }

    acceptVote({name})
    {
        if(!this.delegates[name]) throw "delegate not found";
        this.delegates[name]++;
    }
    /**
     * find the delegate with the highest votes and broadcast on the fake net COMMIT_BLOCK event
     * to the delegate to add block to BC
     */
    determineWinner()
    {

    }

    /**
     * determine the top 4 candidate based on the cotes. change the candidates map accordiglly.
     * we stop after we receive votes equal to num of voters.
     * emit PROPOSE_BLOCK event on the chosen candidates
     */
    determineCandidates()
    {

    }

    /**
     * add the blcok to the cadidate list. check the size of the list and compare against the NUM_DELEGATE.
     * if equal, we call determine winner.
     * @param {*} param0 
     */
    accumalateBlock({name, block})
    {

    }

    /**
     * as a response to BROADCAST_COMMITED_BLOCK event
     * loop though all the transactions of the block. update client accounts+ collect and distribute tax and reward.
     * in the end, broadcast the new map for acccounts.(ACCEPT_REWARDS)
     * @param {*} block the commited block
     */
    updateAccounts(block)
    {

    }

    /**
     * init all votes for delegates to 0;
     */
    initVotes()
    {
        
    }


}