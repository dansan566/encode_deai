# Overview
This is the project of kvutien (KshMR4) homework of week 5 of the Encode Club AI Agent bootcamp, Q1 2025. 
- the app and smart contract `xxx` is installed in `KsHRM4-week5`

## Homework Assignment
The homework tasks are:
To consolidate this week's learning, complete the following project:

1. Pick one of your previous AI projects using OpenAI APIs for AI inference
2. Replace the OpenAI APIs with decentralized inference
3. Implement a smart contract to handle payments (or any other relevant asset for your project)

## Homework Preparation
Contract Design steps
- Define the contract's purpose and functionality: the contract mints ERC-20 tokens and uses them to pay DeAI inference
- Design the data structures and state variables: Within lesson 19, the section "Running AI Text Generation Tasks with Decentralized AI Model Inferences" points to the OAO repository as a resource. It also mentions implementing the IAIOracle.sol interface and building smart contracts with ORA's AI Oracle to achieve provable inference.

The Exercise 1: Invoking an Onchain AI Oracle from a smart contract to execute a provable inference" directly demonstrates how to use the ORA Protocol's Onchain AI Oracles to perform verifiable AI inference that can be integrated with smart contracts, which is a key aspect of decentralised inference as we discussed previously.

- Plan the interaction points with AI agents.
- Consider gas optimization and security measures: The above section in lesson 19 touches upon handling callback gas limits for different model IDs and provides a reference list for models and addresses on various networks, which are practical considerations for on-chain or decentralised inference

## Diversion Deep Dive into ORA Protocol
I spent the weekend to deep dive into ORA protocol and design some JavaScript and Solidity code but I did not have time to implement anything. The Deep Dive is in PDF, file `ORA Protocol deep dive.pdf`