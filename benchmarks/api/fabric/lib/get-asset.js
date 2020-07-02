/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';


// Investigate a 'get' that may or may not result in ledger appeding via orderer. Assets are created in the init phase
// with a byte size that is specified as in input argument. The arguments "nosetup" and "consensus" are optional items that are default false.
// - label: get-asset-100
//     chaincodeID: fixed-asset
//     txNumber:
//     - 1000
//     rateControl:
//     - type: fixed-rate
//       opts:
//         tps: 50
//     arguments:
//       chaincodeID: fixed-asset | fixed-asset-base
//       bytesize: 100
//       assets: 5000
//       nosetup: false
//       consensus: false
//     callback: benchmark/network-model/lib/get-asset.js

const helper = require('./helper');

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

/**
 * Workload module for the benchmark round.
 */
class GetAssetWorkload extends WorkloadModuleBase {
    /**
     * Initializes the workload module instance.
     */
    constructor() {
        super();
        this.chaincodeID = 'fixed-asset';
        this.assets = [];
        this.bytesize = 0;
        this.consensus = false;
    }

    /**
     * Initialize the workload module with the given parameters.
     * @param {number} workerIndex The 0-based index of the worker instantiating the workload module.
     * @param {number} totalWorkers The total number of workers participating in the round.
     * @param {number} roundIndex The 0-based index of the currently executing round.
     * @param {Object} roundArguments The user-provided arguments for the round from the benchmark configuration file.
     * @param {BlockchainInterface} sutAdapter The adapter of the underlying SUT.
     * @param {Object} sutContext The custom context object provided by the SUT adapter.
     * @async
     */
    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);

        const args = this.roundArguments;
        this.chaincodeID = args.chaincodeID ? args.chaincodeID : 'fixed-asset';
        this.assets = args.assets ? parseInt(args.assets) : 0;
        this.bytesize = args.bytesize;
        this.consensus = args.consensus ? (args.consensus === 'true' || args.consensus === true): false;

        const nosetup = args.nosetup ? (args.nosetup === 'true' || args.nosetup === true) : false;
        if (nosetup) {
            console.log('   -> Skipping asset creation stage');
        } else {
            console.log('   -> Entering asset creation stage');
            await helper.addBatchAssets(this.sutAdapter, this.sutContext, this.workerIndex, args);
            console.log('   -> Test asset creation complete');
        }
    }

    /**
     * Assemble TXs for the round.
     * @return {Promise<TxStatus[]>}
     */
    async submitTransaction() {
        // Create argument array [functionName(String), otherArgs(String)]
        const uuid = Math.floor(Math.random() * Math.floor(this.assets));
        const itemKey = 'client' + this.workerIndex + '_' + this.bytesize + '_' + uuid;

        const myArgs = {
            chaincodeFunction: 'getAsset',
            chaincodeArguments: [itemKey]
        };

        // consensus or non-con query
        if (this.consensus) {
            return this.sutAdapter.invokeSmartContract(this.chaincodeID, undefined, myArgs);
        } else {
            return this.sutAdapter.querySmartContract(this.chaincodeID, undefined, myArgs);
        }
    }
}

/**
 * Create a new instance of the workload module.
 * @return {WorkloadModuleInterface}
 */
function createWorkloadModule() {
    return new GetAssetWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
