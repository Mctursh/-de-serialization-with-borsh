//Program ID: EWQpVofYx5tcHcAkFceAx6GQZTi4JHmUW2t9QSSgPVDs 
import { serialize, deserialize } from "borsh";
import {
    Connection,
    clusterApiUrl,
    PublicKey,
    Keypair,
    SystemProgram,
    Transaction,
    TransactionInstruction,
    sendAndConfirmTransaction,
} from "@solana/web3.js";
// import * as BufferLayout from "@solana/buffer-layout";
// const BN = require("bn.js");
// import  BN from "bn.js";
import { Buffer } from "buffer";

let greetedPubkey: PublicKey;

class GreetingAccount {
    counter = 0
    constructor(field: {counter: number} | undefined = undefined){
    // constructor(counter?: number){
        if (field){
            this.counter = field.counter
        }
    }
}

const GreetingSchema = new Map([
    [
        GreetingAccount,
        { 
            kind: "struct",
            fields: [
                ["counter", "u32"]
            ]
        }
    ],
])

const GREETING_SIZE = serialize(
    GreetingSchema,
    new GreetingAccount()
).length

const connection = new Connection(clusterApiUrl("devnet"))

async function main() {
    const key: Uint8Array = Uint8Array.from([160,192,158,159,152,28,93,4,29,147,243,118,190,64,155,84,251,222,199,23,226,71,88,206,138,82,68,73,202,43,26,156,90,192,188,56,28,49,146,18,32,201,230,56,132,197,65,36,77,192,10,16,187,49,230,200,240,35,106,89,38,216,155,185]);


    // const data_to_send: Buffer = Buffer.from(
            
    //     Uint8Array.of(0, ...new BN(10).toArray("le", 8)
        
    // ));

    const bufferData = Buffer.from(serialize(
        GreetingSchema,
        new GreetingAccount({counter: 5}),
    ))

    // const layout = BufferLayout.struct([BufferLayout.u32("counter")])
    // let data: Buffer = Buffer.alloc(layout.span);
    // layout.encode({counter:3}, data);

    const signer: Keypair = Keypair.fromSecretKey(key);
    let programId: PublicKey = new PublicKey("EWQpVofYx5tcHcAkFceAx6GQZTi4JHmUW2t9QSSgPVDs");

    //first create account with seed then refer with Public Key
    // const GREETING_SEED = 'hello 41';
    // greetedPubkey = await PublicKey.createWithSeed(
    //     signer.publicKey,
    //     GREETING_SEED,
    //     programId,
    // );
       
      greetedPubkey = new PublicKey("DZrtxw59wvR4LqinakJCJeWhjtDMoF9WPkFZq23k5PYP");
    
    
    let fees = 0
     
    
    const lamports = await connection.getMinimumBalanceForRentExemption(
    GREETING_SIZE,
    );
    
    //This creteAccount with Seed  only first time   
    const transaction = new Transaction()
    // transaction.add(
    //     SystemProgram.createAccountWithSeed({
    //         fromPubkey: signer.publicKey,
    //         basePubkey: signer.publicKey,
    //         seed: GREETING_SEED,
    //         newAccountPubkey: greetedPubkey,
    //         lamports,
    //         space: GREETING_SIZE,
    //         programId,
    //     }),
    // );

    transaction.add(
        new TransactionInstruction({
            keys: [
                {pubkey: greetedPubkey, isSigner: false, isWritable: true}
            ],
            programId,
            data: bufferData
        })
    );

    await sendAndConfirmTransaction(connection, transaction, [signer])
        .then((sig)=> {
            console.log("sig: {}", sig);
        });
    reportGreetings();
}

async function reportGreetings(): Promise<void> {
    const accountInfo = await connection.getAccountInfo(greetedPubkey);
    if (accountInfo === null) {
      throw 'Error: cannot find the greeted account';
    }
    const greeting = deserialize(
      GreetingSchema,
      GreetingAccount,
      accountInfo.data,
    );
    console.log(greeting);
    
    console.log(
      greetedPubkey.toBase58(),
      'has been greeted',
      Number(greeting?.counter),
      'time(s)',
    );
  }

main();