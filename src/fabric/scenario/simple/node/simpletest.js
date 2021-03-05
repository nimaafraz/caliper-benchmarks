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
const shim = require('fabric-shim');
const util = require('util');

const ERROR_SYSTEM = '{"code":300, "location": "%s", "reason": "system error: %s"}';
const ERROR_WRONG_FORMAT = '{"code":301, "location": "%s", "reason": "command format is wrong-NIMA.js"}';
const ERROR_ACCOUNT_EXISTING = '{"code":302, "location": "%s", "reason": "account already exists"}';
const ERROR_ACCOUNT_ABNORMAL = '{"code":303, "location": "%s", "reason": "abnormal account"}';
const ERROR_MONEY_NOT_ENOUGH = '{"code":304, "location": "%s", "reason": "account\'s money is not enough"}';

/**
 * Generates an {@link ErrorResponse} from the given arguments.
 * @param {String} location Specifies the location of the error.
 * @param {String} formatString The format string of the error.
 * @param {Object[]} params Arbitrary values to pass to the format string.
 * @return {ErrorResponse} The constructed error response.
 */
function getErrorResponse(location, formatString, ...params) {
    return shim.error(Buffer.from(util.format(formatString, location, ...params)));
}

/**
 * Simple money transfer chaincode written in node.js, implementing {@link ChaincodeInterface}.
 * @type {SimpleChaincode}
 * @extends {ChaincodeInterface}
 */
let SimpleChaincode = class {
    /**
     * Called during chaincode instantiate and upgrade. This method can be used
     * to initialize asset states.
     * @async
     * @param {ChaincodeStub} stub The chaincode stub is implemented by the fabric-shim
     * library and passed to the {@link ChaincodeInterface} calls by the Hyperledger Fabric platform. The stub
     * encapsulates the APIs between the chaincode implementation and the Fabric peer.
     * @return {Promise<SuccessResponse>} Returns a promise of a response indicating the result of the invocation.
     */
    async Init(stub) {
        return shim.success();
    }

    /**
     * Called throughout the life time of the chaincode to carry out business
     * transaction logic and effect the asset states.
     * The provided functions are the following: open, delete, query, transfer.
     * @async
     * @param {ChaincodeStub} stub The chaincode stub is implemented by the fabric-shim
     * library and passed to the {@link ChaincodeInterface} calls by the Hyperledger Fabric platform. The stub
     * encapsulates the APIs between the chaincode implementation and the Fabric peer.
     * @return {Promise<SuccessResponse | ErrorResponse>} Returns a promise of a response indicating the result of the invocation.
     */
    async Invoke(stub) {
        let funcAndParams = stub.getFunctionAndParameters();

        let method = this[funcAndParams.fcn];
        if (!method) {
            return getErrorResponse('Invoke', ERROR_WRONG_FORMAT);
        }

        try {
            return await method(stub, funcAndParams.params);
        } catch (err) {
            return getErrorResponse('Invoke', ERROR_SYSTEM, err);
        }
    }

    /**
     * Creates a new account with the given amount of money. The account must not exist!
     * @async
     * @param {ChaincodeStub} stub The chaincode stub object.
     * @param {String[]} params The parameters for account creation.
     * Index 0: account name. Index 1: initial amount of money.
     * @return {Promise<SuccessResponse | ErrorResponse>} Returns a promise of a response indicating the result of the invocation.
     */
    async open(stub, params) {
        if (params.length !== 2) {
            return getErrorResponse('open', ERROR_WRONG_FORMAT);
        }
        let out_auction = auction_nima8k();
        let account = params[0];
        let money = await stub.getState(account);
        

        // if (money.toString()) {
        //     return getErrorResponse('open', ERROR_ACCOUNT_EXISTING);
        // }

        let initMoney = parseInt(params[1]);
        if (isNaN(initMoney)) {
            return getErrorResponse('open', ERROR_WRONG_FORMAT);
        }

        try {
            // expand enumerable Buffer to byte array with the ... operator
            // await stub.putState(account, Buffer.from(params[1]));
            await stub.putState(account, Buffer.from(out_auction.toString()));
            console.log(Buffer.from(out_auction.toString()));
            console.log('Buffer.from(out_auction.toString())');
        } catch (err) {
            return getErrorResponse('open', ERROR_SYSTEM, err);
        }
        let moneyy = await stub.getState(params[0]);
        console.log(moneyy.toString());
        console.log('moneyy');

        return shim.success();
    }

    /**
     * Deletes an account.
     * @async
     * @param {ChaincodeStub} stub The chaincode stub object.
     * @param {String[]} params The parameter for account deletion. Index 0: account name.
     * @return {Promise<SuccessResponse | ErrorResponse>} Returns a promise of a response indicating the result of the invocation.
     */
    async delete(stub, params) {
        if (params.length !== 1) {
            return getErrorResponse('delete', ERROR_WRONG_FORMAT);
        }

        try {
            await stub.deleteState(params[0]);
        } catch (err) {
            return getErrorResponse('delete', ERROR_SYSTEM, err);
        }

        return shim.success();
    }

    /**
     * Queries the amount of money of a given account.
     * @async
     * @param {ChaincodeStub} stub The chaincode stub object.
     * @param {String[]} params The parameter for account query. Index 0: account name.
     * @return {Promise<SuccessResponse | ErrorResponse>} Returns a promise of a response indicating the result of the invocation.
     */
    async query(stub, params) {
        if (params.length !== 1) {
            return getErrorResponse('query', ERROR_WRONG_FORMAT);
        }

        let money;
        try {
            money = await stub.getState(params[0]);

            console.log('JSON.stringify(money)');
            console.log(JSON.stringify(money));
            console.log("params[0]");
            console.log(params[0]);
            console.log("-------------------------");
            console.log("params");
            console.log(params);;
            console.log("-------------------------");    
            console.log("money.toString('utf8')");
            console.log(money.toString('utf8'));
            console.log("-------------------------");
            console.log("money.toString()");
            console.log(money.toString());
            console.log("-------------------------");
            console.log('money');
            console.log(money);
            console.log("-------------------------")
            console.log('query executed -Nima4');

        } catch (err) {
            return getErrorResponse('query', ERROR_SYSTEM, err);
        }

        if (!money) {
            return getErrorResponse('query', ERROR_ACCOUNT_ABNORMAL);
        }
        console.log(money.toString('utf8'));
        return shim.success(money);
    }

    /**
     * Transfers a given amount of money from one account to an other.
     * @async
     * @param {ChaincodeStub} stub The chaincode stub object.
     * @param {String[]} params The parameters for money transfer.
     * Index 0: sending account name. Index 1: receiving account name. Index 2: amount of money to transfer.
     * @return {Promise<SuccessResponse | ErrorResponse>} Returns a promise of a response indicating the result of the invocation.
     */
    async transfer(stub, params) {
        if (params.length !== 3) {
            return getErrorResponse('transfer', ERROR_WRONG_FORMAT);
        }

        let money = parseInt(params[2]);
        if (isNaN(money)) {
            return getErrorResponse('transfer', ERROR_WRONG_FORMAT);
        }

        let moneyBytes1, moneyBytes2;
        try {
            moneyBytes1 = await stub.getState(params[0]);
            moneyBytes2 = await stub.getState(params[1]);
        } catch (err) {
            return getErrorResponse('transfer', ERROR_SYSTEM, err);
        }

        if (!moneyBytes1 || !moneyBytes2) {
            return getErrorResponse('transfer', ERROR_ACCOUNT_ABNORMAL);
        }

        let money1 = parseInt(String.fromCharCode.apply(String, moneyBytes1));
        let money2 = parseInt(String.fromCharCode.apply(String, moneyBytes2));

        if (money1 < money) {
            return getErrorResponse('transfer', ERROR_MONEY_NOT_ENOUGH);
        }

        money1 -= money;
        money2 += money;

        try {
            await stub.putState(params[0], Buffer.from(money1.toString()));
            await stub.putState(params[1], Buffer.from(money2.toString()));
        } catch (err) {
            return getErrorResponse('transfer', ERROR_SYSTEM, err);
        }

        return shim.success();
    }
};

try {
    shim.start(new SimpleChaincode());
} catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
}


let rand = function(min, max) {
    if (min==null && max==null)
      {return 0;}

    if (max == null) {
        max = min;
        min = 0;
      }
      return min + Math.floor(Math.random() * (max - min + 1));
    };

function auction_nima8k(){
    var tmp_auction=[];
    for (var i=1; i < 800; i++){
        tmp_auction.concat("----------------Next Round ----------------");
        tmp_auction.concat(auction_nima());
    }}    
    return tmp_auction;

function auction_nima(){

    rand = function(min, max) {
        if (min==null && max==null)
        {return 0;}

        if (max == null) {
            max = min;
            min = 0;
        }
        return min + Math.floor(Math.random() * (max - min + 1));
        };


    function vno(vno_id, vno_name, balance, ask, bid, quantity, won_quantity){
        this.vno_id = vno_id;
        this.vno_name = vno_name;
        this.balance = balance;
        this.ask = ask;
        this.bid = bid;
        this.quantity = quantity;
        this.won_quantity = 0;
    }

    function split_seller_buyer(vnos){
        var sellers = [];
        var buyers = [];
        for (var vno of vnos){
            if (vno.ask == null){
                buyers.push(vno);
            }
            if (vno.bid == null){
                sellers.push(vno);
            }
        }
        return [sellers, buyers];
    }


    function printSB(sellers,buyers){
        //Debugign print
        // console.log("sellers");
        // console.log("sellers[i].ask,sellers[i].quantity,sellers[i].vno_name,buyers[i].balance,i");

        for ( i=0; i < sellers.length; i++) {
            // console.log(sellers[i].ask,sellers[i].quantity,sellers[i].vno_name,buyers[i].balance,i);
            }

        // console.log("Buyers");
        for ( i=0; i < buyers.length; i++) {
            // console.log(buyers[i].bid,buyers[i].quantity,buyers[i].vno_name,buyers[i].balance,i);
            }
    }

    function sortSB(sellers,buyers){
    sellers.sort((a, b) => (a.ask > b.ask) ? 1 : -1);
    buyers.sort((a, b) => (a.bid > b.bid) ? -1 : 1);
    }
    function mergeback(sellers,buyers){
        newvnos = sellers.concat(buyers);
        newvnos.sort((a, b) => (a.vno_id > b.vno_id) ? 1 : -1);
        return newvnos;
        }

    function find_MC_point_price(sellers, buyers){
        for (i=0; i < Math.max(sellers.length,buyers.length); i++){
            if (i>0 && sellers[i].ask >= buyers[i].bid){
                // console.table(sellers);
                // console.log('sellers[i-1].ask = ',i,i-1);
                // console.log('sellers[i-1].ask = ',i,i-1,sellers[i-1].ask);
                // console.log('==========RAN==============');

                if (sellers[i-1].ask < (sellers[i].ask + buyers[i].bid)/2 < buyers[i-1].bid){
                    MC_point = i-1;
                    sell_price = (sellers[i].ask + buyers[i].bid)/2;
                    buy_price = (sellers[i].ask + buyers[i].bid)/2;

                }
                else{
                    MC_point = i-2;
                    sell_price = sellers[i-1].ask;
                    buy_price = buyers[i-1].bid;

                }
                return [MC_point, sell_price, buy_price];

            }
        }
    }

    function find_MC_quantity(sellers,buyers,MC_point){
        var sum_toSell = 0;
        var sum_toBuy = 0;
        for (var i=0; i <= MC_point; i++){
            sum_toSell += sellers[i].quantity;
            sum_toBuy += buyers[i].quantity;
        }
        return Math.min(sum_toSell,sum_toBuy);
        }

    function generate_vnos(){
        var vnos = [];
        var ask_max=100;
        var bid_max=100;
        // function vno(vno_id, vno_name, balance, ask, bid, quantity, won_quantity){
        var vno1 = new vno(1, 'VNO1',10000,rand(1,ask_max),null,rand(0,1000),null);
        var vno2 = new vno(2, 'VNO2',10000,rand(1,ask_max),null,rand(0,1000),null);
        var vno3 = new vno(3, 'VNO3',10000,rand(1,ask_max),null,rand(0,1000),null);
        var vno4 = new vno(4, 'VNO4',10000,rand(1,ask_max),null,rand(0,1000),null);
        var vno5 = new vno(5, 'VNO5',10000,rand(1,ask_max),null,rand(0,1000),null);
        var vno6 = new vno(6, 'VNO6',10000,null,rand(1,bid_max),rand(0,1000),null);
        var vno7 = new vno(7, 'VNO7',10000,null,rand(1,bid_max),rand(0,1000),null);
        var vno8 = new vno(8, 'VNO8',10000,null,rand(1,bid_max),rand(0,1000),null);
        var vno9 = new vno(9, 'VNO9',10000,null,rand(1,bid_max),rand(0,1000),null);
        var vno10 = new vno(10, 'VNO10',10000,null,rand(1,bid_max),rand(0,1000),null);

        vnos = [vno1,vno2,vno3,vno4,vno5,vno6,vno7,vno8,vno9,vno10];
        return vnos;
    }

    // function generate_vnos(){
    //     var vnos = [
    //         {
    //           "vno_id": 1,
    //           "vno_name": "VNO1",
    //           "balance": 10000,
    //           "ask": 98,
    //           "bid": null,
    //           "quantity": 182,
    //           "won_quantity": 0
    //         },
    //         {
    //           "vno_id": 2,
    //           "vno_name": "VNO2",
    //           "balance": 10000,
    //           "ask": 24,
    //           "bid": null,
    //           "quantity": 78,
    //           "won_quantity": 0
    //         },
    //         {
    //           "vno_id": 3,
    //           "vno_name": "VNO3",
    //           "balance": 10000,
    //           "ask": 27,
    //           "bid": null,
    //           "quantity": 652,
    //           "won_quantity": 0
    //         },
    //         {
    //           "vno_id": 4,
    //           "vno_name": "VNO4",
    //           "balance": 10000,
    //           "ask": 61,
    //           "bid": null,
    //           "quantity": 24,
    //           "won_quantity": 0
    //         },
    //         {
    //           "vno_id": 5,
    //           "vno_name": "VNO5",
    //           "balance": 10000,
    //           "ask": 75,
    //           "bid": null,
    //           "quantity": 119,
    //           "won_quantity": 0
    //         },
    //         {
    //           "vno_id": 6,
    //           "vno_name": "VNO6",
    //           "balance": 10000,
    //           "ask": null,
    //           "bid": 63,
    //           "quantity": 491,
    //           "won_quantity": 0
    //         },
    //         {
    //           "vno_id": 7,
    //           "vno_name": "VNO7",
    //           "balance": 10000,
    //           "ask": null,
    //           "bid": 69,
    //           "quantity": 179,
    //           "won_quantity": 0
    //         },
    //         {
    //           "vno_id": 8,
    //           "vno_name": "VNO8",
    //           "balance": 10000,
    //           "ask": null,
    //           "bid": 68,
    //           "quantity": 397,
    //           "won_quantity": 0
    //         },
    //         {
    //           "vno_id": 9,
    //           "vno_name": "VNO9",
    //           "balance": 10000,
    //           "ask": null,
    //           "bid": 75,
    //           "quantity": 579,
    //           "won_quantity": 0
    //         },
    //         {
    //           "vno_id": 10,
    //           "vno_name": "VNO10",
    //           "balance": 10000,
    //           "ask": null,
    //           "bid": 6,
    //           "quantity": 804,
    //           "won_quantity": 0
    //         }
    //       ];   
    //     return vnos;
    // }

    function MC_settle(sellers,buyers,MC_point,MC_quantity){
        // const sellers_temp = sellers;

        // const buyers_temp = buyers;

        var MC_quantity_b = MC_quantity;
        var MC_quantity_s = MC_quantity;
        for (i=0; i <= MC_point && MC_quantity_b > 0; i++){
            if (buyers[i].quantity <= MC_quantity_b){
                MC_quantity_b -= buyers[i].quantity;
                buyers[i].quantity = 0;

            }
            else{
                buyers[i].quantity -= MC_quantity_b;
                MC_quantity_b =0;
            }
        }

        for (i=0; i <= MC_point && MC_quantity_s > 0; i++){
            if (sellers[i].quantity <= MC_quantity_s){
                MC_quantity_s -= sellers[i].quantity;
                sellers[i].quantity = 0;

            }
            else{
                // console.log("here");
                // console.log(sellers[i].quantity);
                sellers[i].quantity -= MC_quantity_s;
                // console.log(sellers[i].quantity);
                MC_quantity_s =0;
            }
        }
    }

    function copy_q(sellers,buyers,MC_point){
        var sellers_temp_q = [];
        var buyers_temp_q = [];
        for (i=0; i <= MC_point; i++){
            sellers_temp_q.push(sellers[i].quantity);
            buyers_temp_q.push(buyers[i].quantity);
            // console.log("sellers_temp_q,buyers_temp_q");
            // console.log(sellers_temp_q,buyers_temp_q);
        }
    }

    function balance_settle(sellers,buyers,MC_point,sellers_temp_q,buyers_temp_q){
        // sellers_temp_q = [];
        // buyers_temp_q = [];
        // for (i=0; i <= MC_point; i++){
        //     sellers_temp_q.push(sellers[i].quantity);
        //     buyers_temp_q.push(buyers[i].quantity);
        //     console.log("sellers_temp_q,buyers_temp_q");
        //     console.log(sellers_temp_q,buyers_temp_q);
        // }
        for (i=0; i <= MC_point; i++){
            // sellers_temp_q.push(sellers[i].quantity);
            // buyers_temp_q.push(buyers[i].quantity);
            // console.log("sellers_temp_q,buyers_temp_q");
            // console.log(sellers_temp_q,buyers_temp_q);

            // console.log("sellers[i].balance");
            // console.log(sellers[i].balance);
            // console.log("sellers[i].balance,sellers_temp_q[i] , sellers[i].quantity,sell_price");
            // console.log(sellers[i].balance,sellers_temp_q[i] , sellers[i].quantity,sell_price);
            sellers[i].balance += (Math.abs(sellers_temp_q[i] - sellers[i].quantity) * sell_price);
            // console.log("buyers[i].balance");
            // console.log(buyers[i].balance);
            // console.log("buyers[i].quantity - buyers_temp_q[i]) * buy_price");
            buyers[i].balance -= (Math.abs(buyers[i].quantity - buyers_temp_q[i]) * buy_price);


            // console.log("sellers[i].balance,sellers_temp_q[i] , sellers[i].quantity,sell_price");
            // console.log(sellers[i].balance,sellers_temp_q[i] , sellers[i].quantity,sell_price);
        }
    }
    function auction(){

        var vnos_org = generate_vnos();
        // var vnos = vnos_org;

        const vnos = JSON.parse(JSON.stringify(vnos_org));
        [sellers,buyers] = split_seller_buyer(vnos);


        sortSB(sellers,buyers);
        // console.table(sellers);
        // console.table(buyers);
        find_MC_point_price(sellers,buyers);
        // console.log(MC_point);
        // console.log(sell_price);
        // console.log(buy_price);
        copy_q(sellers,buyers,MC_point);
        MC_quantity = find_MC_quantity(sellers,buyers,MC_point);
        // console.log(MC_quantity);
        MC_settle(sellers,buyers,MC_point,MC_quantity,sell_price,buy_price);
        // console.log(sellers[2].balance);

        // printSB(sellers,buyers);
        balance_settle(sellers,buyers,MC_point,sellers_temp_q,buyers_temp_q);
        // console.table(sellers);
        // console.table(buyers);
        return calc_won(vnos_org,mergeback(sellers,buyers));
    }

    // function test_balance(sellers, buyers){
    //     var t_b_bal = 0;
    //     var t_s_bal = 0;
    //     for (var i=0; i < Math.max(sellers.length,buyers.length); i++){
    //         t_s_bal = t_s_bal + sellers[i].balance;
    //         t_b_bal = t_b_bal + buyers[i].balance;
    //     }
        // if (t_s_bal - 50000 != 50000 - t_b_bal){
        //     // console.error("Balance does not match");
        //     throw Error("Balance does not match");

        // }
    //     }
    function test_won(sellers, buyers){
        var t_b_won = 0;
        var t_s_won = 0;
        for (var i=0; i < Math.max(sellers.length,buyers.length); i++){
            t_s_won = t_s_won + sellers[i].won_quantity;
            t_b_won = t_b_won + buyers[i].won_quantity;
        }
        if (t_s_won !=   t_b_won){
            // console.error("Balance does not match");
            throw Error("won_quantity does not match");
    
        }
        }
    var sellers = [];
    var buyers = [];
    var MC_point = 0;
    var sell_price = 0;
    var buy_price = 0;
    var i = 0;
    var MC_quantity =0;
    var buyers_temp_q = 0;
    var sellers_temp_q = 0;
    var newvnos = [];


function calc_won(vnos_org,newvnos){
    for (var i=0; i < 9; i++){
        newvnos[i].won_quantity=(vnos_org[i].quantity-newvnos[i].quantity);
        // console.log('won_quantity=====',newvnos[i].won_quantity,'=======================');
        // console.log('org_quantity=====',vnos_org[i].quantity,'new_quantity=====',newvnos[i].quantity,'=======================');
    }
    // console.table(vnos_org);
    // console.table(newvnos);
    return newvnos;
}
    auction();
    console.log('\'===================================auction===================================\'');
    // console.warn('\'===================================auction===================================\'');
    // console.log(sellers);
    // console.table(sellers);

    // for (j = 0; j <10000; j++){
    // console.log("=========================",j,"=======================");
    //     auction();
    //     test_balance(sellers, buyers);
    // test_won(sellers, buyers);
    // }
    // var a=4000000000000000000000000000000;
    // return sellers.toString();
    console.log("sellers.concat(buyers)");
    console.log(sellers.concat(buyers));
    return sellers.concat(buyers);
}
