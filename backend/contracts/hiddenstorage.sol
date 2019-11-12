pragma solidity >=0.4.24 <0.6.0;
/**
  * @title hidden storage
  * @dev Writes a hidden value to the chain
  */
contract hiddenstorage {
    address public owner;
    address public canSee;
    uint private secret;

    /**
      * @dev Constructor sets the default value
      */
    constructor(address _owner, uint _sec) public {
        owner = _owner;
        secret = _sec;
    }

    /**
      * @dev Set the value
      */
    function set(uint _sec) public {
        require(msg.sender == owner);
        secret = _sec;
    }

    function show(address other) public {
        require(msg.sender == owner);
        canSee = other;
    }

    /**
      * @dev Get the value
      */
    function get() public view returns (uint x) {
        require(msg.sender == canSee);
        return secret;
    }
}
