import fs from 'fs';

const fsp = fs.promises;

/**
 * 메세지 큐가 하는 일
 * 메세지를 넣으면 파일시스템에 정리한다. 물론 오브젝트로도 들고있는다.
 * 그리고 큐에는 입력, 삭제 단위로 계속 append 한다.
 * 오브젝트가 빈칸이 되면 파일을 삭제한다.
 *
 * 최초 실행시에는 파일시스템을 읽고 그에따라 오브젝트를 만든다.
 * 그리고 파일을 삭제하고 add 로만 재구성한다.
 *
 */

type MessageAction = {
    action: 'add' | 'delete';
    payload: { [key: string]: any }
}


type Message = { [key: string]: any };

class MessageQueue {
    private queueFilePath: string;
    private queueObject: Message[] = [];

    constructor(queueFilePath: string = './queue.txt') {
        this.queueFilePath = queueFilePath;
    }

    get length() {
        return this.queueObject.length;
    }

    get path() {
        return this.queueFilePath;
    }

    enqueue(message: Message): void {
        this.queueObject.push(message);
        this.appendMessageToFile('add', message);
    }

    dequeue(): Message | undefined {
        const message = this.queueObject.shift();
        if (message) {
            this.appendMessageToFile('delete', message);
        }

        if (!message || !this.queueObject.length){
            this.deleteQueueFile();
        }

        return message;
    }

    /**
     * reset current queue object and load new queue from file
     * @param newFilePath {string?}
     */
    async initializeQueue(newFilePath?: string) {
        this.queueObject = [];

        if (newFilePath) {
            this.deleteQueueFile();
            this.queueFilePath = newFilePath;
        }

        if (fs.existsSync(this.queueFilePath)) {
            const fileBuffer = await fsp.readFile(this.queueFilePath);
            const messages = fileBuffer.toString('utf8').split(/\r?\n/);

            messages.forEach((msgString) => {
                if (msgString === '') {
                    return;
                }

                const message = JSON.parse(msgString) as MessageAction;
                if (message.action === 'add') {
                    this.queueObject.push(message.payload);
                } else if (message.action === 'delete') {
                    this.queueObject.shift();
                } else {
                    throw new Error('message from file : parsing error');
                }
            })
        }
    }

    clear() {
        this.queueObject = [];
        this.deleteQueueFile();
    }

    private appendMessageToFile(action: 'add' | 'delete', payload: Message) {
        fs.appendFileSync(this.queueFilePath, `${JSON.stringify({action, payload})}\r\n`);
    }

    private deleteQueueFile() {
        if (fs.existsSync(this.queueFilePath)) {
            fs.unlinkSync(this.queueFilePath);
        }
    }
}

export default MessageQueue;
