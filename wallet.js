"use strict";

const keypair = require('keypair');
const utils = require('./utils.js')

/**
 * A wallet is a collection of "coins", where a coin is defined as
 * a UTXO (unspent transaction output) and its associated
 * transaction ID and output index.
 * 
 * In order to spend the coins, we also hold the public/private keys
 * associated with each coin.
 * 
 * For simplicity, we use a JBOK ("just a bag of keys") wallet.
 */
module.exports = class Wallet {
  
  /**
   * Initializes an array for coins as well as an address->keypair map.
   * 
   * A coin is a triple of the UTXO, a transaction ID, and an output index,
   * in the form:
   * { output, txID, outputIndex }
   * 
   * An address is the hash of the corresponding public key.
   */
  constructor() {
    // An array of the UTXOs
    this.coins = [];

    // An address is the hash of the public key.
    // Its value is the public/private key pair.
    this.addresses = {};
  }

  /**
   * Return the total balance of all UTXOs.
   * 
   * @returns The total number of coins in the wallet.
   */
  get balance() {
    return this.coins.reduce((acc, {output}) => acc + output.amount, 0);
  }

  /**
   * Makes a new keypair and calculates its address from that.
   * The address is the hash of the public key.
   * 
   * @returns The address.
   */
  makeAddress() {
    let kp = keypair();
    let addr = utils.calcAddress(kp.public);
    this.addresses[addr] = kp;
    return addr;
  }

  /**
   * Checks to see if the wallet contains the specified public key.
   * This function allows a client to check if a broadcast output
   * should be added to the client's wallet.
   * 
   * @param {String} address - The hash of the public key identifying an address.
   */
  hasKey(address) {
    return !!this.addresses[address];
  }
}
