import isNetworkConnected from './isNetworkConnected';
import unfetch from "isomorphic-unfetch";

/**
 * 무엇을 해야하는가?
 * - 메세지 이벤트를 보낸다
 *   - url 있는 쪽으로 메세지 보냄
 *     - 보내졌는가? -> 큐검사 -> 20개씩 묶어서 보내기
 *     - 보내지지않았는가? -> 큐에다 추가
 *
 *
 *
 */

type StatisticsOptions = {
    url: string; // 보낼 원격 로그저장소의 주소
    cacheDir: string; // 설정되어있으면 오프라인 상태일때 발생한 통계로그를 저장해두고, 온라인일 때 다시 보낸다.
    offlineCheckInterval: number; // 해당 인터벌 마다 온라인 / 오프라인 여부를 확인한다.
}

export type QueryParams = { [key: string]: string | number };

const _options: StatisticsOptions = {
    url: 'https://playentry.org/logs',
    cacheDir: '.',
    offlineCheckInterval: 1000,
};

let _isOffline: boolean = false;
let _checkConnectionInterval: NodeJS.Timeout | undefined = undefined;
let _checkSendQueueInterval: number | undefined = undefined;

function startNetworkCheckInterval() {
    _checkConnectionInterval = setInterval(async () => {
        _isOffline = await isNetworkConnected();
    }, _options.offlineCheckInterval);
}

function _checkSendQueue() {
    _checkSendQueueInterval = setInterval(async () => {
        await isNetworkConnected();
        // 메세지 큐를 검사한다
    });
}

/**
 * 기본 옵션을 변경한다.
 * 기본값이 정해져있으므로 무조건 사용해야 하는 함수는 아니다.
 * @param options
 */
export function setup(options?: Partial<StatisticsOptions>) {
    options && Object.assign(_options, options);
    _checkConnectionInterval && clearInterval(_checkConnectionInterval);
    startNetworkCheckInterval();
}

export function makeQueryString(params: QueryParams): string {
    const queries = Object.entries(params).map(([key, value]) => `${key}=${value}`).join('&');
    return `?${queries}`;
}

export default async function send(args: QueryParams) {
    if (!_options.url) {
        throw new Error('url is undefined');
    }
    const queryString = makeQueryString(args);
    return await unfetch(_options.url + queryString);
}
