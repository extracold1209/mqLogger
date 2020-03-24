import chai, {assert} from 'chai'
import chaiFs from 'chai-fs';
import MessageQueue from './messageQueue';
import fs from 'fs';

chai.use(chaiFs);

describe('MessageQueue', function () {
    let messageQueue: MessageQueue;

    beforeEach(function () {
        messageQueue = new MessageQueue();
    });

    it('normal enqueue', function () {
        messageQueue.queue({event: 'test', payload: 'dummy'});
        assert.equal(messageQueue.length, 1);
        assert.pathExists(messageQueue.path);
    });

    it('dequeue whole message', function () {
        const message = {event: 'test', payload: 'hello'};

        messageQueue.queue(message);
        const dequeueMessage = messageQueue.dequeue();

        assert.deepEqual(message, dequeueMessage);
        assert.pathExists(messageQueue.path);
    });

    it('dequeue message but message remained', function () {
        const message = {event: 'test', payload: 'hello'};
        const message2 = {event: 'test', payload: 'hello2'};

        messageQueue.queue(message);
        messageQueue.queue(message2);

        const dequeueMessage = messageQueue.dequeue();

        // 메시지는 선입선출
        assert.deepEqual(message, dequeueMessage);

        // 메세지가 남아있기때문에 add, delete 이벤트가 하나씩 있어야 한다
        assert.pathExists(messageQueue.path);

        // new line 데이터가 3줄 있어야함
        assert.fileContentMatch(messageQueue.path, /(.*[\r\n]){3}/);
    });

    it('dequeue but empty queue', function () {
        const message = messageQueue.dequeue();

        assert.isUndefined(message);
    });

    it('load from file', async function () {
        const newFilePath = './loadFile.txt';
        const message = {event: 'test', payload: 'hello'};
        const message2 = {event: 'test', payload: 'hello2'};
        messageQueue.queue(message);
        messageQueue.queue(message2);
        messageQueue.dequeue();

        fs.renameSync(messageQueue.path, newFilePath);
        messageQueue.clear();

        await messageQueue.initializeQueue(newFilePath);

        assert.equal(messageQueue.length, 1);
    });

    afterEach(function () {
        messageQueue.clear();
    })
});
