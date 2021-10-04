// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

contract PublicMessages {
  struct Message {
    address sender;
    string message;
  }

  uint256 handlePrice;
  address private owner;
  Message[] private chat;

  mapping(address => string) public handles;

  event SendingMessage(address _from);
  event MessageSaved(address _from, string _msg);

  constructor(uint256 _handlePrice) {
    owner = msg.sender;
    handlePrice = _handlePrice;
    handles[msg.sender] = 'owner';
  }

  modifier onlyOwner() {
    require(msg.sender == owner, 'Only the owner of the contract has access');
    _;
  }

  modifier requireHandle() {
    require(bytes(handles[msg.sender]).length >= 2, 'Please create a handle first');
    _;
  }

  function setHandlePrice(uint256 _handlePrice) external onlyOwner {
    handlePrice = _handlePrice;
  }

  function getHandlePrice() public view returns (uint256) {
    return handlePrice;
  }

  function setHandle(string memory _handle) public payable {
    require(msg.value == handlePrice, 'Please pay the required handle price to setup a handle');

    require(bytes(_handle).length >= 2 && bytes(_handle).length <= 10, 'Please give a handle with 2 to 10 characters');

    handles[msg.sender] = _handle;
  }

  function getHandle() public view returns (string memory) {
    string memory handle = handles[msg.sender];

    return handle;
  }

  function sendMessage(string memory _message) public requireHandle {
    emit SendingMessage(msg.sender);
    chat.push(Message({ sender: msg.sender, message: _message }));
    emit MessageSaved(msg.sender, _message);
  }

  function getMessages(uint256 _page, uint256 _count) public view requireHandle returns (Message[] memory) {
    uint256 len = chat.length;
    uint256 maxPages = len / _count;

    uint256 end;
    uint256 size;
    uint256 start;

    if (_page > maxPages) {
      size = len % _count;
      start = 0;
      end = len - maxPages * _count - 1;
    } else {
      size = _count;
      start = len - (_page * _count);
      end = len - (_page - 1) * _count - 1;
    }

    Message[] memory chatToReturn = new Message[](size);

    uint256 counter = 0;
    for (uint256 i = start; i <= end; i++) {
      chatToReturn[counter] = chat[i];
      counter++;
    }

    return chatToReturn;
  }
}
