pragma solidity >=0.4.24 <0.6.0;
/**
  * @title Interface for an E
  */
contract CoinInterface {
    function transfer(address _to, uint256 _value) public returns (bool success);
}
