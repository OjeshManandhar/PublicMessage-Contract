const PublicMessages = artifacts.require('PublicMessages');

module.exports = function (deployer) {
  deployer.deploy(PublicMessages, '1000000000000000');
};
