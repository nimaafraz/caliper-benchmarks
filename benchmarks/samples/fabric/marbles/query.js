/*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

const owners = ['Alice', 'Bob', 'Claire', 'David'];

/**
 * Workload module for the benchmark round.
 */
class QueryWorkload extends WorkloadModuleBase {
    /**
     * Initializes the workload module instance.
     */
    constructor() {
        super();
        this.txIndex = 0;
    }

    /**
     * Assemble TXs for the round.
     * @return {Promise<TxStatus[]>}
     */
    async submitTransaction() {
        this.txIndex++;
        let marbleOwner = owners[this.txIndex % owners.length];
        let args;

        if (this.sutAdapter.getType() === 'fabric') {
            args = {
                chaincodeFunction: 'queryMarblesByOwner',
                chaincodeArguments: [marbleOwner]
            };
        } else {
            args = {
                verb: 'queryMarblesByOwner',
                owner: marbleOwner
            };
        }

        return this.sutAdapter.querySmartContract(this.sutContext, 'marbles', 'v1', args, 120);
    }
}

/**
 * Create a new instance of the workload module.
 * @return {WorkloadModuleInterface}
 */
function createWorkloadModule() {
    return new QueryWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
