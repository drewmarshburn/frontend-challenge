pragma solidity >=0.4.24 <0.6.0;

contract CoinInterface {
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success);
}

/**
  * @title paytoview
  * @dev Allows someone to purchase access to a string
  */
contract PayToView {
    address public owner;
    uint public price;
    CoinInterface public ffContract;
    string private secret;

    // Event to indicate the contract was created
    event Creation(address indexed _owner, uint _price);
    event Purchase(address indexed _buyer);

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
        emit Creation(msg.sender, price);
    }

    /**
     * @dev Buy the secret
     */
     function buySecret() public {
         require(msg.sender != owner, "You are the owner.");
         require(!allowedToView[msg.sender], "You own this already.");
         require(ffContract.transferFrom(msg.sender, owner, price), "Problem with transfer.");

         emit Purchase(msg.sender);
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
