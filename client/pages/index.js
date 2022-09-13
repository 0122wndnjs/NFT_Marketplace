import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";
import { contractAddress, INFURA_URL } from "../config";
import NFTMarketplace from "../abi/NFTMarketplace.json";

export default function Home() {
  return (
    <div>
      <h1>Welcome to Home</h1>
    </div>
  );
}
