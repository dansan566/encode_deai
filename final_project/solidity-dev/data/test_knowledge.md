# Solidity Best Practices

## Reentrancy Guard

To prevent reentrancy attacks, always follow the Checks-Effects-Interactions pattern and consider using a reentrancy guard:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

abstract contract ReentrancyGuard {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
}
```

## Gas Optimization

1. Use `calldata` instead of `memory` for function parameters when possible.
2. Pack variables together to use fewer storage slots.
3. Use `uint256` instead of smaller uints when storage size isn't critical.
4. Use events to store data that doesn't need to be accessed on-chain.
5. Avoid excessive loops, especially ones that could grow unbounded.

## Access Control

Implement proper access control mechanisms to restrict sensitive functions:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AccessControl {
    address public owner;
    mapping(address => bool) public operators;
    
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event OperatorAdded(address indexed operator);
    event OperatorRemoved(address indexed operator);
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "AccessControl: caller is not the owner");
        _;
    }
    
    modifier onlyOperator() {
        require(operators[msg.sender] || msg.sender == owner, "AccessControl: caller is not an operator");
        _;
    }
    
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "AccessControl: new owner is the zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
    
    function addOperator(address operator) public onlyOwner {
        operators[operator] = true;
        emit OperatorAdded(operator);
    }
    
    function removeOperator(address operator) public onlyOwner {
        operators[operator] = false;
        emit OperatorRemoved(operator);
    }
}
```

## ERC20 Token Standard

The ERC20 standard is the most common token interface for fungible tokens:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}
```
