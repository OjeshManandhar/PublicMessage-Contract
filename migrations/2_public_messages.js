const Migrations = artifacts.require('PublicMessages');

module.exports = function (deployer) {
  deployer.deploy(PublicMessages);
};
