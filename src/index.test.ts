import send from './index';
import nock from 'nock';
import {assert} from 'chai'

describe('Test', () => {
    it('send', async function () {
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

    afterEach(function () {
        nock.cleanAll();
    })
});
