// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;
import "hardhat/console.sol";
import "./Token.sol";

contract Exchange {
    address public feeAccount;
    uint256 public feePercent;
    mapping (address=>mapping (address=>uint256)) public tokens;
    //when order is filled change the mapping
    mapping (uint256=>bool) public orderFilled;
    //map for cancelled orders
    mapping (uint256 => bool) public orderCencelled;
    mapping(uint256=>_Order) public orders;

    uint256 public orderCount;
    event Withdraw(address token,address user, uint256 amount,uint256 balance);
    //order event
    event Order(uint256 id,address user,address tokenGet,
    uint256 amountGet, address tokenGive,uint256 amountGive,uint256 timestamp);
    //cancel even
    event Cancel (uint256 id,address user,address tokenGet,
    uint256 amountGet, address tokenGive,uint256 amountGive,uint256 timestamp);
    //trade venet
    event Trade (uint256 id,address user,address tokenGet,
    uint256 amountGet, address tokenGive,uint256 amountGive,uint256 timestamp);
    //orders mapping
    struct _Order {
        //attributes of an order
        uint256 id; //unique identifier for order
        address user; //user who made the order
        address tokenGet; //address of the token
        uint256 amountGet; //amount of the token to give
        address tokenGive;
        uint256 amountGive;
        uint256 timestamp; //time the order was created
    }
    
    event Deposite(address token,address user, uint256 amount,uint256 balance);
    constructor(address _feeAccount,uint256 _feePercent){
        feeAccount=_feeAccount;
        feePercent=_feePercent;
    }
    function depositeTokens(address _token,uint256 _amount) public{
        //transfer
        require(Token(_token).transferFrom(msg.sender, address(this), _amount));
        //update
        tokens[_token][msg.sender]=tokens[_token][msg.sender]+_amount;
        //emit an event
        emit Deposite(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }
    function withdrawToken(address _token,uint256 _amount) public {
        //ensure user has enough tokens
        require(tokens[_token][msg.sender]>=_amount);
        
        
        //transfer token to the user
        Token(_token).transfer(msg.sender, _amount);
        
        //update the balance
        tokens[_token][msg.sender]=tokens[_token][msg.sender]-_amount;

        //emit event
        emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }



    //check balances
    function balanceOf(address _token,address _user)
    public view
    returns (uint256){
        return tokens[_token][_user];
    }
    //make and cancel orders

    //token give(token they want to spend)
    //token git(token they want to receive)
    function makeOrder(address _tokenGet,uint256 _amountGet,address _tokenGive,uint256 _amountGive)
    public{
        //require token balace
        require(balanceOf(_tokenGive, msg.sender)>=_amountGive);
        //create order
        orderCount=orderCount+1;
        orders[orderCount]=_Order(
            orderCount,//id
            msg.sender,//user
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            block.timestamp//timestamp epochtime
            );
        //emit event
        emit Order(orderCount,msg.sender,_tokenGet,_amountGet,_tokenGive,_amountGive,block.timestamp);
    } 

    function cancelOrder(uint256 _id) public{
        //fetch order
        _Order storage _order=orders[_id];
        //order must exist
        require(_order.id == _id);
        //order must be owned to cancel
        require(_order.user==msg.sender);
        //cancel the order
        orderCencelled[_id]=true;

        //emit event
        emit Cancel(_order.id,msg.sender,_order.tokenGet,_order.amountGet,_order.tokenGive,_order.amountGive,block.timestamp); 
    }
    //executing orders
    function fillOrders(uint256 _id) public{
        //must be valid orderid
        require(_id>0 && _id<=orderCount,"Order doesn't exist");
        //order can't be filled
        require(!orderFilled[_id]);
        //order can't be cancelled
        require(!orderCencelled[_id]);
        
        
        
        //swapping tokens
        _Order storage _order=orders[_id];

        //swapping tokens
        _trade(_order.id,_order.user,_order.tokenGet,_order.amountGet,_order.tokenGive,_order.amountGive);


        //mark order as filled
        orderFilled[_order.id]=true;
    }

    function _trade(uint256 _orderId,address _user,
    address _tokenGet,uint256 _amountGet,
    address _tokenGive,uint256 _amountGive) internal{
        //user2 or the person fills the order pays the fee of 10 percent 
        uint256 _feeAmount=(_amountGet*feePercent)/100;
        
        
        
        //do trade inside here
        tokens[_tokenGet][msg.sender]=tokens[_tokenGet][msg.sender]-(_amountGet+_feeAmount);
        tokens[_tokenGet][_user]=tokens[_tokenGet][_user]+_amountGet;

        //charge fees
        tokens[_tokenGet][feeAccount]=tokens[_tokenGet][feeAccount]+_feeAmount;


        tokens[_tokenGive][msg.sender]=tokens[_tokenGive][msg.sender]+_amountGive;
        tokens[_tokenGive][_user]=tokens[_tokenGive][_user]-_amountGive;

        //emit trade event
        emit Trade(_orderId,msg.sender,_tokenGet,_amountGet,_tokenGive,_amountGive,block.timestamp); 
        

    }
}



 
