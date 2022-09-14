import { useState } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import Web3Modal from "web3modal";
import { contractAddress, PINATA_KEY, PINATA_SECRET } from "../config";
import NFTMarketplace from "../abi/NFTMarketplace.json";
import axios from "axios";
import Image from "next/image";

export default function createNFT() {
    const [fileUrl, setFileUrl] = useState(null);
    const [formInput, updateFormInput] = useState({price: '', name: '', description: ''});
    const router = useRouter();
    const [loadingState, setLoadingState] = useState('not-loading');
}
