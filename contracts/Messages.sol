// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Messages {
  struct Message {
    address sender;
    string message;
  }

  mapping(address => string) public handles;

  Message[] private chat;

  modifier requireHandle() {
    require(bytes(handles[msg.sender]).length >= 2, 'Please create a handle first');
    _;
  }

  function setHandle(string memory _handle) public payable {
    require(msg.value == 0.001 ether, 'Please pay 0.001 ether to setup a handle');

    require(bytes(_handle).length >= 2 && bytes(_handle).length <= 10, 'Please give a handle with 2 to 10 characters');

    handles[msg.sender] = _handle;
  }

  function getHandle() public view returns (string memory) {
    string memory handle = handles[msg.sender];

    return handle;
  }

  function sendMessage(string memory _message) public requireHandle {
    chat.push(Message({ sender: msg.sender, message: _message }));
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
