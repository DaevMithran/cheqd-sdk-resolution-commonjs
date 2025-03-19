import {
    AbstractCheqdSDKModule,
    CheqdNetwork,
    CheqdSDK,
    createCheqdSDK,
    createDidPayload,
    createDidVerificationMethod,
    createKeyPairBase64,
    createVerificationKeys,
    DIDModule,
    FeemarketModule,
    ICheqdSDKOptions,
    ISignInputs,
    MethodSpecificIdAlgo,
    VerificationMethods,
    IKeyPair,
    DIDDocument,
    contexts,
    ResourceModule,
  } from "@cheqd/sdk"
  import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing"
  import { fromString, toString } from "uint8arrays"
  import { config } from 'dotenv'
  import { MsgCreateResourcePayload } from '@cheqd/ts-proto/cheqd/resource/v2/index.js';
  import { v4 } from "uuid";

  config()

  const DefaultRpcUrl = {
    Mainnet: 'https://rpc.cheqd.net:443',
    Testnet: "https://rpc.cheqd.network:443"
  }
  
  /**
   * Test Suite for @cheqd/sdk
   *
   * Steps:
   * 1. Initialize the SDK
   * 2. Generate a key pair
   * 3. Create a DID Document
   * 4. Submit the DID Document
   */
  
  describe("@cheqd/sdk Test Suite", () => {
    let cheqdSDK: CheqdSDK
    let feePayer: string
    let keyPair: IKeyPair
    let didDocument: DIDDocument
  
    beforeAll(async () => {
        // Step 1: Ensure MNEMONIC is defined
        const mnemonic = process.env.MNEMONIC || "sketch mountain erode window enact net enrich smoke claim kangaroo another visual write meat latin bacon pulp similar forum guilt father state erase bright";
      
        // Step 2: Define options for Cheqd SDK
        const options = {
          modules: [
            FeemarketModule as unknown as AbstractCheqdSDKModule,
            DIDModule as unknown as AbstractCheqdSDKModule,
            ResourceModule as unknown as AbstractCheqdSDKModule
          ],
          rpcUrl: DefaultRpcUrl.Testnet,
          network: CheqdNetwork.Testnet,
          wallet: await DirectSecp256k1HdWallet.fromMnemonic(mnemonic!, { prefix: "cheqd" }),
        } satisfies ICheqdSDKOptions;
      
        // Step 3: Initialize SDK
        cheqdSDK = await createCheqdSDK(options);
        feePayer = (await options.wallet.getAccounts())[0].address;
      
        // Step 4: Validate SDK and fee payer address
        expect(cheqdSDK).toBeDefined();
        expect(feePayer).toMatch(/^cheqd1[a-z0-9]+$/); // Ensuring valid Cheqd address format
      });
  
    test("Generate a key pair", () => {
      // Step 2: Generate key pair
      keyPair = createKeyPairBase64()
      expect(keyPair).toHaveProperty("publicKey")
      expect(keyPair).toHaveProperty("privateKey")
    })
  
    test("Create a DID Document", async () => {
      // Step 3: Create a DID Document
      const verificationKeys = createVerificationKeys(
        keyPair.publicKey,
        MethodSpecificIdAlgo.Uuid,
        "key-1"
      )
      const verificationMethods = createDidVerificationMethod(
        [VerificationMethods.Ed255192020],
        [verificationKeys]
      )
      didDocument = createDidPayload(verificationMethods, [verificationKeys])
  
      expect(didDocument).toHaveProperty("verificationMethod")
      expect(didDocument.verificationMethod?.length).toBeGreaterThan(0)
    })
  
    test("Submit the DID Document", async () => {
      // Step 4: Submit the DID Document

      // define fee amount
      const fee = await DIDModule.generateCreateDidDocFees(feePayer);

      // provide keys to sign
      const signInputs: ISignInputs[] = [{
        verificationMethodId: didDocument.verificationMethod![0].id,
        keyType: 'Ed25519',
        privateKeyHex: toString(fromString(keyPair.privateKey, "base64"), "hex"),
      }]
      
      // create did
      const createDidDocResponse = await cheqdSDK.createDidDocTx(
          signInputs,
          didDocument,
          feePayer,
          fee,
          undefined,
          undefined,
          { sdk: cheqdSDK }
      )
  
      expect(createDidDocResponse.code).toBe(0)
    })

    test("Retrieve an existing DID Document from the ledger", async () => {
        const result = await cheqdSDK.queryDidDoc(didDocument.id)
        expect(result.didDocument?.verificationMethod).toEqual(didDocument.verificationMethod)
        expect(result.didDocument?.["@context"]).toEqual([contexts.W3CDIDv1, contexts.W3CSuiteEd255192020])
      });

      test("Create a DID Linked Resource", async () => {
        // TODO: Implement create linked resource tx
        // define fee amount
  

        // provide keys to sign


        // construct resource payload

        
        // submit tx to ledger

      });

      test("Update an existing DID Document with a new serviceEndpoint", async () => {
        
      });
  })
  