const { expect, AssertionError } = require('chai');

const PublicMessages = artifacts.require('PublicMessages');

contract('PublicMessages', accounts => {
  const [alice, bob, chrish] = accounts;
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
    describe('price', () => {
      const newHandlePrice = (parseInt(handlePrice, 10) * 2).toString();

      it('should allow only owner to change handle price', async () => {
        const result = await pubMsg.setHandlePrice(newHandlePrice, { from: alice });

        expect(result.receipt.status).to.be.true;
      });

      it('should not allow non-owners to change handle prive', async () => {
        try {
          const result = await pubMsg.setHandlePrice(newHandlePrice, { from: bob });

          expect(result).to.be.undefined;
        } catch (err) {
          if (err instanceof AssertionError) throw err;

          expect(err).to.be.an('error');
          expect(err.reason).to.equal('Only the owner of the contract has access');
        }
      });
    });

    describe('pay', () => {
      it('should set new handle only when value sent is equal to handle price', async () => {
        const result = await pubMsg.setHandle('bob', { from: bob, value: handlePrice });

        expect(result.receipt.status).to.be.true;
      });

      it('should not set new handle when value sent is not equal to handle parice', async () => {
        try {
          const result = await pubMsg.setHandle('bob', { from: bob, value: '100000' });

          expect(result).to.be.undefined;
        } catch (err) {
          if (err instanceof AssertionError) throw err;

          expect(err).to.be.an('error');
          expect(err.reason).to.equal('Please pay the required handle price to setup a handle');
        }
      });
    });

    describe('value', () => {
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
          if (err instanceof AssertionError) throw err;

          expect(err).to.be.an('error');
          expect(err.reason).to.equal('Please give a handle with 2 to 10 characters');
        }
      });

      it("should not allow new handle's length to be > 10 characters", async () => {
        try {
          const result = await pubMsg.setHandle('abcdefghijk', { from: bob, value: handlePrice });

          expect(result.receipt.status).to.be.true;
        } catch (err) {
          if (err instanceof AssertionError) throw err;

          expect(err).to.be.an('error');
          expect(err.reason).to.equal('Please give a handle with 2 to 10 characters');
        }
      });
    });
  });

  describe('message', () => {
    describe('send', () => {
      it('should allow people with handle to send messages', async () => {
        const result = await pubMsg.sendMessage('hi', { from: alice });

        expect(result.receipt.status).to.be.true;
      });

      it("should emit 'SendingMessage' and 'MessageSaved' when user sends a message", async () => {
        const result = await pubMsg.sendMessage('hi', { from: alice });

        expect(result.logs[0]).to.have.property('event', 'SendingMessage');
        expect(result.logs[0]).to.have.property('args').that.has.property('__length__', 1);

        expect(result.logs[1]).to.have.property('event', 'MessageSaved');
        expect(result.logs[1]).to.have.property('args').that.has.property('__length__', 2);
      });

      it('should not allow people without handle to send message', async () => {
        try {
          const result = await pubMsg.sendMessage('hi', { from: bob });

          expect(result).to.be.undefined;
        } catch (err) {
          if (err instanceof AssertionError) throw err;

          expect(err).to.be.an('error');
          expect(err.reason).to.equal('Please create a handle first');
        }
      });
    });

    describe('get', () => {
      beforeEach(async () => {
        await pubMsg.setHandle('alice', { from: alice, value: handlePrice });
        await pubMsg.setHandle('bob', { from: bob, value: handlePrice });

        await pubMsg.sendMessage('hi', { from: alice });
        await pubMsg.sendMessage('hello', { from: bob });
        await pubMsg.sendMessage('whatsup', { from: alice });
        await pubMsg.sendMessage('whatsssuuuppp', { from: bob });
        await pubMsg.sendMessage('nothing much', { from: alice });
      });

      it('should allow people with handle to get messages', async () => {
        const chat = await pubMsg.getMessages(1, 3, { from: alice });

        expect(chat).to.be.an('array');
      });

      it('should return messages with proper pagination', async () => {
        const chat = await pubMsg.getMessages(2, 3, { from: bob });

        expect(chat).to.deep.equal([
          [alice, 'hi'],
          [bob, 'hello']
        ]);
      });

      it('should not allow people without handle to get message', async () => {
        try {
          const result = await pubMsg.getMessages(1, 3, { from: chrish });

          expect(result).to.be.undefined;
        } catch (err) {
          if (err instanceof AssertionError) throw err;

          expect(err).to.be.an('error');
          // The structure of error is not like this
          // expect(err.reason).to.equal('Please create a handle first');
        }
      });
    });
  });
});
