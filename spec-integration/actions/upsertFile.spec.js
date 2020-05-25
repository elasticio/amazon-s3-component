/* eslint-disable func-names */
require('dotenv').config();
const chai = require('chai');
const nock = require('nock');
const sinon = require('sinon');
const logger = require('@elastic.io/component-logger')();

const upsertFile = require('../../lib/actions/upsertFile');

const { expect } = chai;

const defaultCfg = {
  accessKeyId: process.env.ACCESS_KEY_ID,
  accessKeySecret: process.env.ACCESS_KEY_SECRET,
  region: process.env.REGION,
};

const defaultMsg = {
  body: {
    bucketName: 'lloyds-dev',
    fileName: 'some123isin',
    attachmentUrl: 'https://attachment.url.loc/someof',
  },
};

const self = {
  emit: sinon.spy(),
  logger,
};

describe('streamToFile', () => {
  let cfg;
  let msg;

  beforeEach(() => {
    cfg = JSON.parse(JSON.stringify(defaultCfg));
    msg = JSON.parse(JSON.stringify(defaultMsg));
  });

  afterEach(() => self.emit.resetHistory());

  it('should update', async () => {
    nock('https://attachment.url.loc/', { encodedQueryParams: true })
      .get('/someof').reply(200, 'Hello World!!!');

    const result = await upsertFile.process.call(self, msg, cfg, {});
    expect(Object.keys(result.body)).to.include('ETag');
  });
});