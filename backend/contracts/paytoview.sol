pragma solidity >=0.4.24 <0.6.0;

contract CoinInterface {
    function transfer(address _to, uint256 _value) public returns (bool success);
}

/**
  * @title paytoview
  * @dev Allows someone to purchase access to a string
  */
contract paytoview {
    address public owner;
    uint public price;
    CoinInterface public ffContract;
    string private secret;

    /* Stores addresses of those allowed to view the secret */
    mapping (address => bool) public allowedToView;

    /**
      * @dev Sets the owner, price, secret, and exchange contract
      */
    constructor(string memory _secret, uint _price, address _ffCtrAddr) public {
        owner = msg.sender;
        secret = _secret;
        price = _price;
        ffContract = CoinInterface(_ffCtrAddr);
        allowedToView[owner] = true;
    }

    /**
     * @dev Buy the secret
     */
     function buySecret() public {
         require(msg.sender != owner, "You are the ownder.");
         require(!allowedToView[msg.sender], "You own this already.");
         require(ffContract.transfer(owner, price), "Problem with transfer.");

         allowedToView[msg.sender] = true;
     }

    /**
      * @dev See the secret if you're allowed
      */
    function seeSecret() public view returns (string memory _secret) {
        require(allowedToView[msg.sender], "You must purchase access.");
        return secret;
    }
}
