const { expect } = require('chai');

const PublicMessages = artifacts.require('PublicMessages');

contract('PublicMessages', accounts => {
  const [alice, bob] = accounts;
  const handlePrice = '1000000000000000';
  let pubMsg;

  beforeEach(async () => {
    pubMsg = await PublicMessages.new(handlePrice, { from: alice });
  });

  describe('deployment', () => {
    it('should set handle price', async () => {
      const price = (await pubMsg.getHandlePrice()).toString();

      expect(price).to.be.equal(handlePrice);
    });

    it("should set owner's handle to 'owner'", async () => {
      const handle = (await pubMsg.getHandle({ from: alice })).toString();

      expect(handle).to.equal('owner');
    });
  });

  describe('handle', () => {
    describe('handle price', () => {
      const newHandlePrice = (parseInt(handlePrice, 10) * 2).toString();

      it('should  allow owner to change handle price', async () => {
        const result = await pubMsg.setHandlePrice(newHandlePrice, { from: alice });

        expect(result.receipt.status).to.be.true;
      });

      it('should not allow non-owners to change handle prive', async () => {
        try {
          const result = await pubMsg.setHandlePrice(newHandlePrice, { from: bob });

          expect(result).to.be.undefined;
        } catch (err) {
          expect(err).to.be.an('error');
          expect(err.reason).to.equal('Only the owner of the contract has access');
        }
      });
    });

    describe('handle pay', () => {
      it('should only set new handle only when value sent is equal to handle price', async () => {
        const result = await pubMsg.setHandle('bob', { from: bob, value: handlePrice });

        expect(result.receipt.status).to.be.true;
      });

      it('should not set new handle when value sent is not equal to handle parice', async () => {
        try {
          const result = await pubMsg.setHandle('bob', { from: bob, value: '100000' });

          expect(result).to.be.undefined;
        } catch (err) {
          expect(err).to.be.an('error');
          expect(err.reason).to.equal('Please pay the required handle price to setup a handle');
        }
      });
    });

    describe('handle value', () => {
      it('should return the handle of existing user', async () => {
        const handle = (await pubMsg.getHandle({ from: alice })).toString();

        expect(handle).to.equal('owner');
      });

      it('should allow to set new handle only when it is of correct length (2 - 10)', async () => {
        const result = await pubMsg.setHandle('alice', { from: alice, value: handlePrice });

        expect(result.receipt.status).to.be.true;
      });

      it("should not allow new handle's length to be < 2 characters", async () => {
        try {
          const result = await pubMsg.setHandle('a', { from: bob, value: handlePrice });

          expect(result.receipt.status).to.be.true;
        } catch (err) {
          expect(err).to.be.an('error');
          expect(err.reason).to.equal('Please give a handle with 2 to 10 characters');
        }
      });

      it("should not allow new handle's length to be > 10 characters", async () => {
        try {
          const result = await pubMsg.setHandle('abcdefghijk', { from: bob, value: handlePrice });

          expect(result.receipt.status).to.be.true;
        } catch (err) {
          expect(err).to.be.an('error');
          expect(err.reason).to.equal('Please give a handle with 2 to 10 characters');
        }
      });
    });

    describe('message', () => {});
  });
});
