'use strict';

let EventEmitter = require('events');
let Block = require('./block.js');

const ACCEPT_REWARDS = "ACCEPT_REWARDS";
/**
 * event triggered by the government for the candidates to propose their blocks
 * @type {string}
 */
const PROPOSE_BLOCK = "PROPOSE_BLOCK";
/**
 * event triggered by the candidate delegates. 
 * the government listens to this event expectong the candidate blocks
 * broadcasted by the candidate delegates.
 * @type {string}
 */
const PROPOSE_CANDIDATE_BLOCK = "PROPOSE_CANDIDATE_BLOCK";
/**
 * event triggered by the gov for the winner candidated to append its block to the blockchain
 * and braodcast after that.
 * the Goverenemt send the block to be commited to delegate as a load to the message.
 * @type {string}
 */
const COMMIT_BLOCK = "COMMIT_BLOCK";
/**
 * event triggered by winner delegated to braodcast their block to everyone.
 */
const BROADCAST_COMMITED_BLOCK = "BROADCAST_COMMITED_BLOCK";
/**
 * event broadcasted for delegators updated account balances.
 * @type {string} 
 */
const GIVE_REWARDS = "GIVE_REWARDS";
/**
 * event broadcasted by government for new voting round.
 * @type {string} 
 */
const NEW_VOTING_ROUND = "NEW_VOTING_ROUND";
/**
 * event gets triggered by client to cast their votes to the government.
 * @type {string}
 */
const ACCEPT_VOTES = "ACCEPT_VOTES";
/**
 * the minimum proportion of votes before determining a winner.
 * this number should be int the range 0 < x <= 1.0
 * @type {float} 
 */
const EFFECTIVE_VOTES = 1.0;
const NUM_CANDIDATES = 3;
const TAX = 0.09;
const FEES = 0.001;

class Government extends EventEmitter
{

    constructor(broadcast, numVoters)
    {
        super();
        this.broadcast = broadcast;
        this.delegates = {}; // store the votes
        this.accounts = {}; // account balances in sys
        this.candidateBlocks = {}; // candidate: block holds the top 4 candidate and eventually thier blocks.
        this.numVoters = numVoters; // acts like the num of entities who can vote.
        this.voted = 0; // holds the number of people voted so far in a specific voting round.
        this.on(ACCEPT_VOTES, this.acceptVote);
        this.on(PROPOSE_CANDIDATE_BLOCK, this.accumalateBlock); 
        this.on(BROADCAST_COMMITED_BLOCK, this.updateAccounts);
        this.on(GIVE_REWARDS, this.updateAccounts);
    }

    /**
     * Adding delegates and initializing votes. 
     * @param {*} dels 
     */
    addDelegate(...dels)
    {
        dels.forEach(({name}) => {
            this.delegates[name] = 0;  // 0 is the initial vote count.
        });
    }

    /**
     * Accepting votes from all the clients and adding it to the delegate map.
     * after enough votes have been accumalated, trriger *determineCandidates*
     * @param {Object} vote the vote Object casten by the client.
     * @param {string} vote.name Name of the delegate. delegate[name] equates to the vote count.
     */
    acceptVote({name})
    {
        this.log(`one vote for ${name}`);
        if(this.delegates[name] == undefined) throw "Delegate not found...";
        this.delegates[name]++;
        this.voted++;
        // if we met the throushold, find the winner.
        if(this.voted >= Math.floor(this.numVoters * EFFECTIVE_VOTES))
        {
            this.determineCandidates();
        }
    }

    /**
     * After recieving enough candidate blocks, pick one delegate at random to commit.
     */
    determineWinner()
    {
        // Choose a delegate at random
        let winner = Object.keys(this.candidateBlocks)[Math.floor(Math.random()*100) % NUM_CANDIDATES];
        let blockToBeCommited = this.candidateBlocks[winner];
        if(!blockToBeCommited) throw "there is a problem in finding the winning block. it is unintialized.";
        // initialize the commiter to indicate the entity to add the block.
        blockToBeCommited.commiter = winner;
        this.log(`${winner} is the WINNER to commit the new block!`);
        console.log();
        // TODO find a way to broadcast to winner only.
        this.broadcast(COMMIT_BLOCK, Block.serialize(blockToBeCommited)); 
    }

    /**
     * Determine the top NUM_DELEGATES candidate based on the votes. change the candidates map accordiglly.
     * we stop after we receive votes equal to num of voters.
     * 
     * We need to make sure that this is called when voting is done.
     * 
     */
    determineCandidates()
    {
        let sortedCandidates = [];
        for (let candidate in this.delegates) {
            sortedCandidates.push([candidate, this.delegates[candidate]]);
        }
        sortedCandidates.sort((a, b) => b[1] - a[1]);
        let topFour = sortedCandidates.slice(0, NUM_CANDIDATES);
        // add the top 4 candidates to the candidate blocks list beacuse they will be proposing blocks later on.
        topFour.forEach(([name, vote]) => this.candidateBlocks[name] = undefined);
        console.log();
        this.log(`The top candidates for this round are ${Object.keys(this.candidateBlocks)}`);
        console.log();
        // after finding the top four, ask to propose a block.
        // TODO: find a way to broadcast to candidates only not everyone on the network.
        this.broadcast(PROPOSE_BLOCK);
        // reset the num of client voted for the next round.
        this.voted = 0;
    }

    /**
     * add the blcok to the cadidate list. check the size of the list and compare against the NUM_CANDIDATES.
     * if equal, we call determine winner.
     * @param {*} param0 
     */
    accumalateBlock({name, block})
    {
        // only top 4 candidates can propose blocks
        let listCandidate = Object.keys(this.candidateBlocks);
        if(listCandidate.length > NUM_CANDIDATES) throw "the num of candidates is not right";
        if(listCandidate.indexOf(name) < 0) return;
        this.candidateBlocks[name] = Block.deserialize(block);
        // if we have all 4 block or a variable minimum num of blocks, determine the winner
        if(this.getNumCandidateBlocks() == NUM_CANDIDATES)
        {
            this.determineWinner();
        }
    }

    /**
     * get the number of the candidate blocks proposed so far.
     */
    getNumCandidateBlocks()
    {
        return Object.values(this.candidateBlocks).reduce((acc, block) => block == undefined ? acc: acc+1, 0);
    }

    /**
     * this function is used to kick start the election rounds in the system.
     * it works by setting time intervals to boardcast event for users to cast thier votes every 5 seconds.
     * Along with the broadcasted event, the government sends the list of the delegates that people can choose from.
     * 
     * For the pupose of this project, every call to this function will cause one round of voting to be triggered.
     */
    startVotingRoundes()
    {
        let listOfdelegates = Object.keys(this.delegates).toString();
        // setInterval(() => this.broadcast(NEW_VOTING_ROUND, listOfdelegates), 5);
        this.broadcast(NEW_VOTING_ROUND, Object.keys(this.delegates));
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
        let taxes = 0, rewards = 0;
        let blockObj = Block.deserialize(block);
        // move money around.
        blockObj.getTransactions().forEach( ({tax, fees, amount, to, from})  => {
            // here some transaction verification could happen.
            // like making sure that the taxes and rewards are of the right proportions.
            taxes += tax;
            rewards += fees;
            this.accounts[from] -= amount;
            this.accounts[to] += amount;
        });
        this.accounts['gov'] += taxes;
        console.log();
        this.log(`Added ${taxes} coins from taxes.`);
        console.log();
        // updating the delegate account with the rewards
        // potential problem here is should we pay all the candidates
        // we can solve it by only rewarding the candidates who submited a block.
        // But we are assuming honest candidates so far.
        Object.keys(this.candidateBlocks).forEach( candidateName => this.accounts[candidateName] += rewards / NUM_CANDIDATES);

        // notify the delegates about the new balances with the accounts.
        this.broadcast(ACCEPT_REWARDS, this.accounts);

        // empty the candidates block obj for the next voting round.
        this.candidateBlocks = {};
    }
    
    log(s)
    {
        console.log(`GOV: ${s}`);
    }

}

module.exports = {
    TAX: TAX,
    FEES: FEES,
    ACCEPT_VOTES: ACCEPT_VOTES,
    NEW_VOTING_ROUND: NEW_VOTING_ROUND,
    ACCEPT_REWARDS: ACCEPT_REWARDS,
    PROPOSE_BLOCK: PROPOSE_BLOCK,
    COMMIT_BLOCK: COMMIT_BLOCK,
    BROADCAST_COMMITED_BLOCK: BROADCAST_COMMITED_BLOCK,
    GIVE_REWARDS: GIVE_REWARDS,
    NEW_VOTING_ROUND: NEW_VOTING_ROUND,
    PROPOSE_CANDIDATE_BLOCK: PROPOSE_CANDIDATE_BLOCK,
    Government: Government,
}