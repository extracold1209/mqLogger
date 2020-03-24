import send from './index';
import checkNetworkConnected from "./isNetworkConnected";
import nock from 'nock';
import {assert} from 'chai'
import chaiFs from 'chai-fs';

chai.use(chaiFs);

describe('Index', async () => {
    it('send:networkConnected', async function () {
        const isNetworkConnected = await checkNetworkConnected();
        if (!isNetworkConnected) {
            this.skip();
        }

        const dummyQuery = {event: 'test', hello: 'word'};
        const dummyResponse = '[Nock] Test';

        nock('https://playentry.org')
            .get('/logs')
            .query(dummyQuery)
            .reply(200, dummyResponse);

        const result = await send(dummyQuery);
        const responseBody = await result.text();

        assert.equal(result.status, 200);
        assert.equal(responseBody, dummyResponse);
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
            await send(dummyQuery);
        } catch (e) {
            assert.ok(e);
        }
    });


    afterEach(function () {
        nock.cleanAll();
    });
});
