pragma solidity >=0.4.24 <0.6.0;

/**
  * @title paytoview
  * @dev Allows a user to publish a secret and grant others access to it
  */
contract AllowToView {
    address public owner;
    uint public price;
    string private secret;

    /* Stores addresses of those allowed to view the secret */
    mapping (address => bool) public allowedToView;

    /**
      * @dev Sets the owner, price, and secret
      */
    constructor(string memory _secret, uint _price) public {
        owner = msg.sender;
        secret = _secret;
        price = _price;
        allowedToView[owner] = true;
    }

    /**
     * @dev Grant access to the secret
     */
     function grantAccess(address _other) public {
         require(msg.sender == owner, "You are not the owner.");
         require(!allowedToView[_other], "That user has access already.");

         allowedToView[_other] = true;
     }

    /**
      * @dev See the secret if you're allowed
      */
    function seeSecret() public view returns (string memory _secret) {
        require(allowedToView[msg.sender], "You must purchase access.");
        return secret;
    }
}
