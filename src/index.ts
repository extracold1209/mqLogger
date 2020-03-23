import unfetch from "isomorphic-unfetch";
import MessageQueue from './messageQueue';

export type StatisticsOptions = {
    url: string; // 보낼 원격 로그저장소의 주소
    cacheDir: string; // 설정되어있으면 오프라인 상태일때 발생한 통계로그를 저장해두고, 온라인일 때 다시 보낸다.
    offlineCheckInterval: number; // 해당 인터벌 마다 온라인 / 오프라인 여부를 확인한다.
}

export type QueryParams = { [key: string]: string | number };

const queue = new MessageQueue();
let _isInitialized = false;
const _options: StatisticsOptions = {
    url: 'https://playentry.org/logs',
    cacheDir: '.',
    offlineCheckInterval: 1000,
};

async function setFirstInitialize() {
    if (!_isInitialized) {
        await queue.initializeQueue();
        _isInitialized = true;
    }
}

/**
 * 기본 옵션을 변경한다.
 * 기본값이 정해져있으므로 무조건 사용해야 하는 함수는 아니다.
 * @param options
 */
export function setup(options?: Partial<StatisticsOptions>) {
    options && Object.assign(_options, options);
}

export function makeQueryString(params: QueryParams): string {
    const queries = Object.entries(params).map(([key, value]) => `${key}=${value}`).join('&');
    return `?${queries}`;
}

export default async function send(args: QueryParams) {
    if (!_options.url) {
        throw new Error('url is undefined');
    }
    await setFirstInitialize();
    const queryString = makeQueryString(args);
    try {
        const result = await unfetch(_options.url + queryString);
        if (result.status !== 200) {
            console.warn('response received but status is not OK');
            queue.queue(args);
        } else if (queue.length) {
            // 큐에 메세지가 있는지 확인한다
            // 메세지는 하나씩 보낸다. 나중에 청크단위를 세팅할 수 있게 한다

            const queueMessage = queue.dequeue();
            // noinspection ES6MissingAwait
            queueMessage && send(queueMessage);
        }
        return result.clone();
    } catch (e) {
        // 메시지를 큐에 백업한다
        queue.queue(args);
        throw e;
    }
}
