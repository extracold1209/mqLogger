import MQLogger from './index';
import checkNetworkConnected from "./isNetworkConnected";
import nock from 'nock';
import chai, {assert} from 'chai'
import chaiFs from 'chai-fs';
import fs from 'fs';

chai.use(chaiFs);

describe('Index', async () => {
    const logger = new MQLogger();

    it('send:networkConnected', async function () {
        const isNetworkConnected = await checkNetworkConnected();
        if (!isNetworkConnected) {
            this.skip();
        }

        const dummyQuery = {event: 'test', hello: 'word'};
        const dummyResponse = '[Nock] Test';

        try {
            nock('https://playentry.org')
                .get('/logs')
                .query(dummyQuery)
                .reply(200, dummyResponse);

            const result = await logger.send(dummyQuery, {noDequeueSend: true});
            const responseBody = await result.text();

            assert.equal(result.status, 200);
            assert.equal(responseBody, dummyResponse);
        } catch (e) {
            assert.fail();
        }
    });

    it('send:networkNotConnected', async function () {
        const isNetworkConnected = await checkNetworkConnected();
        if (isNetworkConnected) {
            this.skip();
        }

        const dummyQuery = {event: 'test', hello: 'word'};

        nock('https://playentry.org')
            .get('/logs')
            .replyWithError('Network not connected');

        try {
            await logger.send(dummyQuery, {noDequeueSend: true});
        } catch (e) {
            assert.ok(e);
            assert.file(logger.logPath);
        }
    });


    afterEach(function () {
        nock.cleanAll();
        if (fs.existsSync(logger.logPath)) {
            fs.unlinkSync(logger.logPath);
        }
    });
});
