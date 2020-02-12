/* eslint-disable func-names */
const chai = require('chai');
const sinon = require('sinon');
const getAllFilesInBucket = require('../lib/actions/getAllFilesInBucket');
require('dotenv').config();

const { expect } = chai;

const defaultCfg = {
  accessKeyId: process.env.ACCESS_KEY_ID,
  accessKeySecret: process.env.ACCESS_KEY_SECRET,
  region: process.env.REGION,
  bucketName: 'lloyds-dev/inbound',
};

const defaultMsg = {
  body: {
    filename: 'some123isin',
  },
};

const self = {
  emit: sinon.spy(),
};

describe('getAllFilesInBucket', () => {
  let cfg;
  let msg;

  beforeEach(() => {
    cfg = JSON.parse(JSON.stringify(defaultCfg));
    msg = JSON.parse(JSON.stringify(defaultMsg));
  });

  afterEach(() => self.emit.resetHistory());

  it('should get test.xml from bucket', async () => {
    await getAllFilesInBucket.process.call(self, msg, cfg);
    const files = self.emit.getCalls().map((call) => (call.args[1] ? call.args[1].body.filename : 'end emit'));
    expect(files).to.include('inbound/test.xml');
  });
  it('should emit empty message if no files was found in bucket', async () => {
    cfg.bucketName = 'lloyds-dev/notExistFolder';
    await getAllFilesInBucket.process.call(self, msg, cfg);
    expect(self.emit.args[0][0]).to.be.eql('data');
    expect(self.emit.args[0][1].body).to.be.eql({});
    expect(self.emit.args[1][0]).to.be.eql('end');
  });
  it('should fail for empty bucket name', async () => {
    try {
      cfg.bucketName = '';
      await getAllFilesInBucket.process.call(self, msg, cfg);
      expect(true).to.be.false;
    } catch (e) {
      expect(e.message).to.be.eql('Bucket name cant be empty. Provided bucket name: ');
    }
  });
  it('should fail for undefined bucket name', async () => {
    try {
      cfg.bucketName = undefined;
      await getAllFilesInBucket.process.call(self, msg, cfg);
      expect(true).to.be.false;
    } catch (e) {
      expect(e.message).to.be.eql('Bucket name cant be empty. Provided bucket name: undefined');
    }
  });
  it('should fail for null bucket name', async () => {
    try {
      cfg.bucketName = null;
      await getAllFilesInBucket.process.call(self, msg, cfg);
      expect(true).to.be.false;
    } catch (e) {
      expect(e.message).to.be.eql('Bucket name cant be empty. Provided bucket name: null');
    }
  });
  it('should fail for invalid bucket name', async () => {
    try {
      cfg.bucketName = '/invalid/test';
      await getAllFilesInBucket.process.call(self, msg, cfg);
      expect(true).to.be.false;
    } catch (e) {
      expect(e.message).to.be.eql('Bucket name cant start with /, provided bucket name: /invalid/test');
    }
  });
  it('should fail if bucket not exist', async () => {
    try {
      cfg.bucketName = 'notExistBucket/test';
      await getAllFilesInBucket.process.call(self, msg, cfg);
      expect(true).to.be.false;
    } catch (e) {
      expect(e.message).to.be.eql('Bucket notExistBucket/test not exist');
    }
  });
});