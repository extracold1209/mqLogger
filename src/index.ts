import unfetch from "isomorphic-unfetch";
import MessageQueue from './messageQueue';

export type StatisticsOptions = {
    url: string; // 보낼 원격 로그저장소의 주소
    cacheDir?: string; // 설정되어있으면 오프라인 상태일때 발생한 통계로그를 저장해두고, 온라인일 때 다시 보낸다.
    offlineCheckInterval: number; // 해당 인터벌 마다 온라인 / 오프라인 여부를 확인한다.
}

export type SendOptions = { noDequeueSend?: boolean }

export type QueryParams = { [key: string]: string | number };

class MQLogger {
    private static instance: MQLogger;
    private queue: MessageQueue;
    private isInitialized = false;
    private options: StatisticsOptions = {
        url: 'https://playentry.org/logs',
        cacheDir: undefined,
        offlineCheckInterval: 1000,
    };

    constructor(options?: Partial<StatisticsOptions>) {
        Object.assign(this.options, options);
        this.queue = new MessageQueue(this.options.cacheDir);

        // 최초 선언된 객체가 공용 인스턴스
        if (!MQLogger.instance) {
            MQLogger.instance = this;
        }
    }

    get logPath() {
        return this.queue.path;
    }

    /**
     * 공용 인스턴스를 부른다. 그렇다고 이 클래스가 무조건 공용 인스턴스를 사용해야 하는 것은 아니다
     */
    public static getGlobalInstance() {
        // 최초 인스턴스 선언도 없는 경우 기본인스턴스를 생성
        if (!this.instance) {
            console.warn('global instance not set. make new instance automatically');
            this.instance = new MQLogger();
        }

        return this.instance;
    }

    public static setGlobalInstance(instance: MQLogger) {
        this.instance = instance;
    }

    public makeQueryString(params: QueryParams): string {
        const queries = Object.entries(params).map(([key, value]) => `${key}=${value}`).join('&');
        return `?${queries}`;
    }

    public async send(args: QueryParams, options?: SendOptions): Promise<void> {
        if (!this.options.url) {
            throw new Error('url is undefined');
        }

        await this.executeFirstInitialize();
        const queryString = this.makeQueryString(args);
        try {
            const result = await unfetch(this.options.url + queryString);
            if (result.status !== 200) {
                console.warn('response received but status is not OK');
                this.queue.enqueue(args);
            } else if (this.queue.length && !options?.noDequeueSend) {
                // 큐에 메세지가 있는지 확인한다
                // 메세지는 하나씩 보낸다. 나중에 청크단위를 세팅할 수 있게 한다

                const queueMessage = this.queue.dequeue();
                // noinspection ES6MissingAwait
                queueMessage && this.send(queueMessage);
            }
        } catch (e) {
            // 메시지를 큐에 백업한다
            this.queue.enqueue(args);
            console.warn('send message failed. message is enqueued', e);
        }
    }

    private async executeFirstInitialize() {
        if (!this.isInitialized) {
            await this.queue.initializeQueue(this.options.cacheDir);
            this.isInitialized = true;
        }
    }
}

export default MQLogger;
