import os
import json
import requests
from web3 import Web3
import dotenv

dotenv.load_dotenv()
# -------------------------------
# Smart Contract Configuration
# -------------------------------
# Use your Sepolia provider URL (e.g. via Infura)
INFURA_APIKEY_ID = os.environ.get("INFURA_APIKEY_ID")
SEPOLIA_PROVIDER_URL = os.environ.get("SEPOLIA_PROVIDER_URL")
SEPOLIA_PROVIDER_URL_KEY = SEPOLIA_PROVIDER_URL + INFURA_APIKEY_ID
web3 = Web3(Web3.HTTPProvider(SEPOLIA_PROVIDER_URL_KEY))

# The deployed contract address on Sepolia
CONTRACT_ADDRESS = web3.to_checksum_address("0x648999413daa0c32ad1e7e294b86d159e76e3b68")

# Load the contract ABI (exported from Remix as ChefPaymentABI.json)
with open("encode_deai/week5/EinYYl/ChefPaymentABI.json.json", "r") as f:
    contract_abi = json.load(f)
contract = web3.eth.contract(address=CONTRACT_ADDRESS, abi=contract_abi)
print("contract", contract)
# Your account details (make sure your account has some test ETH on Sepolia)
ACCOUNT_ADDRESS = web3.to_checksum_address(os.environ.get("ACCOUNT_ADDRESS"))
PRIVATE_KEY = os.environ.get("MM_PRIVATE_KEY")
print("ACCOUNT_ADDRESS", ACCOUNT_ADDRESS)

# -------------------------------
# Decentralized Inference Configuration
# -------------------------------
# Replace this with your decentralized inference endpoint URL
DECENTRALIZED_INFERENCE_URL = os.environ.get("DECENTRALIZED_INFERENCE_URL", "http://127.0.0.1:5000/v1/")
SYSTEM_PROMPT = """You are an italian chef who knows a lot about italian cuisine and has a passion for fine dining. Small dishes are your specialty.
If the user's initial input doesn't match these scenarios or you don't know the answer, politely decline with some italian stereotypes and ask for a valid request.
However, you only have 3 roles and you only do these roles:
1. Ingredients inputs: Suggest only dish names without full recipes, normally 2 or 3 dishes.
2. Dish name inputs: Provide a detailed recipe, readapted for the fine dining restaurant, but give a recipe.
3. Recipe inputs: Offer a constructive critique with suggested improvements, to elevate the dish to a michelin star level.
Also, you ask if there is anything else you can help with after each response, but you don't repeat yourself.
"""

# -------------------------------
# Function: Pay for Inference Onchain
# -------------------------------
def pay_for_inference_onchain(request_text):
    # Retrieve the fee from the contract (set to 0.0001 ETH, e.g., 100000000000000 wei)
    fee = contract.functions.inferenceFee().call()
    print(f"Required fee (in wei): {fee}")
    
    # Build the transaction to call payForInference with the user's request
    tx = contract.functions.payForInference(request_text).build_transaction({
        'chainId': 11155111,  # Sepolia's chain ID
        'gas': 200000,
        'gasPrice': web3.to_wei('10', 'gwei'),
        'nonce': web3.eth.get_transaction_count(ACCOUNT_ADDRESS),
        'value': fee  # Sends the required fee
    })
    
    # Sign and send the transaction
    signed_tx = web3.eth.account.sign_transaction(tx, private_key=PRIVATE_KEY)
    tx_hash = web3.eth.send_raw_transaction(signed_tx.raw_transaction)
    print("Transaction sent. Hash:", web3.to_hex(tx_hash))
    
    # Wait for the transaction to be confirmed
    receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
    print("Transaction confirmed. Receipt:", receipt)
    return receipt

# -------------------------------
# Function: Get Decentralized Inference Response
# -------------------------------
def get_decentralized_inference(conversation):
    payload = {
        "system_prompt": SYSTEM_PROMPT,
        "conversation": conversation
    }
    headers = {"Content-Type": "application/json"}
    try:
        response = requests.post(DECENTRALIZED_INFERENCE_URL, json=payload, headers=headers)
        response.raise_for_status()
        result = response.json()
        return result.get("response", "No response received from inference service.")
    except Exception as e:
        return f"Error during decentralized inference: {e}"

# -------------------------------
# Main Chatbot Function
# -------------------------------
def chat_with_ai():
    # Start the conversation with the system prompt
    conversation = [{"role": "system", "content": SYSTEM_PROMPT}]
    print("Hello! I'm the Italian Chef. How can I help you today?")
    
    while True:
        user_input = input("\nuser: ")
        if user_input.lower() in ["exit", "quit"]:
            print("Italian Chef: Goodbye!")
            break
        
        # Add the user's request to the conversation
        conversation.append({"role": "user", "content": user_input})
        
        # First: Process the on-chain payment for the inference request
        print("\nProcessing on-chain payment for your request on Sepolia...")
        pay_for_inference_onchain(user_input)
        
        # Then: Call the decentralized inference endpoint for a response
        print("Payment processed. Now fetching AI response...")
        chef_response = get_decentralized_inference(conversation)
        
        print("Italian Chef:", chef_response)
        conversation.append({"role": "assistant", "content": chef_response})

if __name__ == "__main__":
    chat_with_ai()
