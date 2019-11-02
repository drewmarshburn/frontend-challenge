pragma solidity >=0.4.24 <0.6.0;

import "./fortissimo.sol";

/**
  * @title paytoview
  * @dev Allows someone to purchase access to a string
  */
contract paytoview {
    address public owner;
    uint public price;
    Fortissimo public ffContract;
    string private secret;

    /* Stores addresses of those allowed to view the secret */
    mapping (address => bool) private allowedToView;

    /**
      * @dev Sets the owner, price, secret, and exchange contract
      */
    constructor(address _owner, string memory _secret, uint _price, Fortissimo _ffContract) public {
        owner = _owner;
        secret = _secret;
        price = _price;
        ffContract = _ffContract;
        allowedToView[owner] = true;
    }

    /**
      * @dev Set the secret value. (Probably should be removed!)
      */
    function setSecret(string memory _secret) public {
        require(msg.sender == owner);
        secret = _secret;
    }

    /**
     * @dev Buy the secret
     */
     function buySecret(address _purchaser) public {
         require(msg.sender != owner, "You are the ownder.");
         require(!allowedToView[msg.sender], "You own this already.");
         require(ffContract.transfer(owner, price));

         allowedToView[_purchaser] = true;
     }

    /**
      * @dev See the secret if you're allowed
      */
    function seeSecret() public view returns (string memory _secret) {
        require(allowedToView[msg.sender]);
        return _secret;
    }
}
