import * as dnsLib from 'dns';

export default (): Promise<boolean> => new Promise((resolve) => {
    dnsLib.resolve('www.google.com', (err) => {
        resolve(!err);
    });
});
