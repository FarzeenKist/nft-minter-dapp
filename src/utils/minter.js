import { create as ipfsHttpClient } from "ipfs-http-client";
import axios from "axios";

// initialize IPFS
const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

// mint an NFT
export const createNft = async (
  minterContract,
  performActions,
  { name, gemValue, description, ipfsImage, properties }
) => {
  await performActions(async (kit) => {
    if (!name || !description || !ipfsImage) return;
    const { defaultAccount } = kit;

    // convert NFT metadata to JSON format
    const data = JSON.stringify({
      name,      
      description,
      image: ipfsImage,
      owner: defaultAccount,
      properties,
    });

    try {
      // save NFT metadata to IPFS
      const added = await client.add(data);

      // IPFS url for uploaded metadata
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;

      console.log("Gem Value -> " + gemValue)
      // mint the NFT and save the IPFS url to the blockchain
      let transaction = await minterContract.methods
        .mintToken(url, gemValue)
        .send({ from: defaultAccount });

        // console.log("txn -> " + JSON.stringify(transaction, null, 4))
      return transaction;
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  });
};

// function to upload a file to IPFS
export const uploadToIpfs = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const added = await client.add(file, {
      progress: (prog) => console.log(`received: ${prog}`),
    });
    return `https://ipfs.infura.io/ipfs/${added.path}`;
  } catch (error) {
    console.log("Error uploading file: ", error);
  }
};

// fetch all NFTs on the smart contract
// export const getNfts = async (minterContract) => {
//   try {
//     const nfts = [];
//     // console.log("before call ...")
//     const tokensLength = await minterContract.methods.getTokensLength().call();    
//     // console.log("tokenslength -> " + tokensLength)
//     for (let i = 0; i < Number(tokensLength); i++) {
//       const nft = await new Promise(async (resolve, reject) => {
//         const res = await minterContract.methods.tokenURI(i).call();
//         const meta = await fetchNftMeta(res);
//         const owner = await fetchNftOwner(minterContract, i);
//         resolve({
//           index: i,
//           owner,
//           name: meta.data.name,
//           image: meta.data.image,
//           description: meta.data.description,
//           properties: meta.data.properties,
//         });
//       });
//       console.log("nft -> " + JSON.stringify(nft, null, 4))
//       nfts.push(nft);
//     }    
//     return await Promise.all(nfts);
//   } catch (e) {
//     console.log({ e });
//   }
// };

export const getNfts = async (minterContract) => {
  try {
    const data = await minterContract.methods.getAllMarketTokens().call();
    const tokens = await Promise.all(data.map(async token => {
      const tokenUri = await minterContract.methods.tokenURI(token.tokenId).call();
      const meta = await fetchNftMeta(tokenUri);
      return {
        index: Number(token.tokenId),
        value: Number(token.value),
        owner: token.owner,
        seller: token.seller,
        claimed: token.claimed,
        name: meta.data.name,
        image: meta.data.image,
        description: meta.data.description,
        properties: meta.data.properties,
      }
    }))
    return tokens;
  } catch (e) {
    console.log(e);
  }
}

// get the metedata for an NFT from IPFS
export const fetchNftMeta = async (ipfsUrl) => {
  try {
    if (!ipfsUrl) return null;
    // console.log("Before axios -> " + ipfsUrl);  
    const meta = await axios.get(ipfsUrl);
    // console.log("After axios -> " + meta);
    return meta;
  } catch (e) {
    console.log({ e });
  }
};

// get the owner address of an NFT
export const fetchNftOwner = async (minterContract, index) => {
  try {
    return await minterContract.methods.ownerOf(index).call();
  } catch (e) {
    console.log({ e });
  }
};

// get the address that deployed the NFT contract
export const fetchNftContractOwner = async (minterContract) => {
  try {
    let owner = await minterContract.methods.owner().call();
    return owner;
  } catch (e) {
    console.log({ e });
  }
};
