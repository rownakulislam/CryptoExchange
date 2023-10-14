// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;
import "hardhat/console.sol";
//staticly typed language so must assign value to variables when initialize
contract Token {
    string public name; //state variable value written to blockchain
    string public symbol;
    uint256 public decimals=18;
    uint256 public totalSupply;

    //map/hashtable for address to balance maping
    mapping(address => uint256) public balanceOf;
    //map for allowance to other recipients
    mapping(address=>mapping(address=>uint256)) public allowance;
    //transfer event so that others can subcribe to the event so that they get alerted
    //indexed is used for easily access the transaction by address 
    event Transfer(address indexed from,address indexed to,uint256 value);
    event Approval(address indexed owner,address indexed spender,uint256 value);
    constructor(string memory _name,string memory _symbol,uint256 _totalSupply){
         name=_name;
         symbol=_symbol;
         totalSupply=_totalSupply*(10**decimals);
         //msg is a globar variable msg.sender is the person who's calling the constructor  
         balanceOf[msg.sender]=totalSupply;
    }
    function transfer(address _to, uint256 _value)
        public 
        returns (bool success)
    {
        //ensure of enough tokens if parameter require is true then run the rest of the code
        require(balanceOf[msg.sender]>=_value);
        _transfer((msg.sender), _to, _value);
        return true;
    }
    function _transfer(address _from,address _to,uint256 _value)
    internal {
        require(_to!=address(0));
        //deduct token from spender and credit tokens to receiver
        balanceOf[_from]=balanceOf[_from]-_value;
        balanceOf[_to]=balanceOf[_to]+_value;
        //must declare a transfrer event that will emit in the transfer function 
        //for the alerts and transaction history 
        emit Transfer(_from, _to, _value);
    }
    function approve(address _spender,uint256 _value)
    public 
    returns (bool success){
        require(_spender!=address(0));
        allowance[msg.sender][_spender]=_value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }
    function transferFrom(address _from,address _to,uint256 _value) 
    public 
    returns (bool success){

        require(_value<=allowance[_from][msg.sender]);
        require(_value<=balanceOf[_from]);
        //reset allowance for blocking repetitive access
        allowance[_from][msg.sender]=allowance[_from][msg.sender]-_value;

        //transfer
        _transfer(_from, _to, _value);
        return true;
    }
}
//erc20 token standard

